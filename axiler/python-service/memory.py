import os
from dotenv import load_dotenv
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver
import psycopg

# Load environment variables
load_dotenv()

class MemoryManager:
    """Manages memory for the AI chatbot using LangGraph checkpointing."""
    
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        if not self.database_url:
            print("⚠️ DATABASE_URL not found, using SQLite for memory storage")
        
        self._checkpointer = None
        self._setup_memory()
    
    def _setup_memory(self):
        """Setup the memory system with PostgreSQL."""
        try:
            if self.database_url and self.database_url.startswith("postgresql://"):
                # Use PostgreSQL for checkpointing
                print("🐘 Setting up PostgreSQL memory storage...")
                
                # Create direct connection with autocommit for DDL
                conn = psycopg.connect(self.database_url, autocommit=True)
                self._checkpointer = PostgresSaver(conn)
                
                # Setup the database tables for checkpointing
                self._checkpointer.setup()
                
                print("✅ PostgreSQL memory database initialized")
                print("💡 Chat conversations will be persistent across sessions")
                
            else:
                raise ValueError("❌ PostgreSQL DATABASE_URL is required. Please check your .env file.")
                
        except Exception as e:
            print(f"❌ Error setting up PostgreSQL memory: {e}")
            print("🔄 Falling back to in-memory storage (conversations won't persist)")
            # Fall back to in-memory storage
            self._checkpointer = MemorySaver()
    
    @property
    def checkpointer(self):
        """Get the checkpointer instance."""
        if self._checkpointer is None:
            raise RuntimeError("Checkpointer not initialized. Call _setup_memory() first.")
        return self._checkpointer
    
    def get_conversation_config(self, user_id: str = "default", conversation_id: str = "main"):
        """
        Get configuration for a specific conversation thread.
        
        Args:
            user_id: Identifier for the user (default: "default")
            conversation_id: Identifier for the conversation (default: "main")
            
        Returns:
            Configuration dictionary for LangGraph checkpointing
        """
        thread_id = f"{user_id}_{conversation_id}"
        return {"configurable": {"thread_id": thread_id}}
    
    def clear_conversation(self, user_id: str = "default", conversation_id: str = "main"):
        """
        Clear a specific conversation's memory.
        
        Args:
            user_id: Identifier for the user
            conversation_id: Identifier for the conversation
        """
        thread_id = f"{user_id}_{conversation_id}"
        if isinstance(self._checkpointer, PostgresSaver):
            try:
                # For PostgreSQL, we can delete the thread data
                with self._checkpointer.conn.cursor() as cur:
                    cur.execute("DELETE FROM checkpoints WHERE thread_id = %s", (thread_id,))
                    cur.execute("DELETE FROM checkpoint_writes WHERE thread_id = %s", (thread_id,))
                    self._checkpointer.conn.commit()
                    print(f"🗑️ Cleared conversation: {thread_id}")
            except Exception as e:
                print(f"❌ Error clearing conversation: {e}")
        else:
            print(f"⚠️ Conversation clearing not supported for current checkpointer type")
    
    def get_conversation_history(self, user_id: str = "default", conversation_id: str = "main"):
        """
        Get the conversation history for a specific thread.
        
        Args:
            user_id: Identifier for the user
            conversation_id: Identifier for the conversation
            
        Returns:
            List of messages in the conversation
        """
        try:
            config = self.get_conversation_config(user_id, conversation_id)
            print(f"📖 Getting conversation history for thread: {user_id}_{conversation_id}")
            return []
        except Exception as e:
            print(f"❌ Error getting conversation history: {e}")
            return []
    
    def get_user_conversations(self, user_id: str):
        """
        Get all conversations for a specific user.
        
        Args:
            user_id: Identifier for the user
            
        Returns:
            List of conversation summaries with thread_id and first_message
        """
        try:
            if isinstance(self._checkpointer, PostgresSaver):
                with self._checkpointer.conn.cursor() as cur:
                    # Query to get all conversations for a user
                    query = """
                    SELECT 
                        thread_id,
                        MIN(created_at) as created_at,
                        MAX(created_at) as last_activity,
                        COUNT(*) as message_count
                    FROM checkpoints 
                    WHERE thread_id LIKE %s 
                    GROUP BY thread_id
                    ORDER BY MAX(created_at) DESC
                    """
                    cur.execute(query, (f"{user_id}_%",))
                    conversations = []
                    
                    for row in cur.fetchall():
                        thread_id, created_at, last_activity, message_count = row
                        conversation_id = thread_id.replace(f"{user_id}_", "", 1)
                        
                        # Get the first message from this conversation
                        first_message = self._get_first_message(thread_id)
                        
                        conversations.append({
                            'thread_id': thread_id,
                            'conversation_id': conversation_id,
                            'first_message': first_message,
                            'created_at': int(created_at.timestamp()) if created_at else 0,
                            'last_activity': int(last_activity.timestamp()) if last_activity else 0,
                            'message_count': message_count
                        })
                    
                    return conversations
            else:
                print("⚠️ Getting user conversations not supported for current checkpointer type")
                return []
                
        except Exception as e:
            print(f"❌ Error getting user conversations: {e}")
            return []
    
    def _get_first_message(self, thread_id: str):
        """
        Get the first human message from a conversation.
        
        Args:
            thread_id: The thread identifier
            
        Returns:
            The content of the first human message, or empty string if not found
        """
        try:
            if isinstance(self._checkpointer, PostgresSaver):
                with self._checkpointer.conn.cursor() as cur:
                    # Get the checkpoint with the earliest created_at for this thread
                    query = """
                    SELECT checkpoint 
                    FROM checkpoints 
                    WHERE thread_id = %s 
                    ORDER BY created_at ASC 
                    LIMIT 1
                    """
                    cur.execute(query, (thread_id,))
                    result = cur.fetchone()
                    
                    if result and result[0]:
                        checkpoint_data = result[0]
                        # Extract messages from checkpoint data
                        if 'channel_values' in checkpoint_data and 'messages' in checkpoint_data['channel_values']:
                            messages = checkpoint_data['channel_values']['messages']
                            for message in messages:
                                if hasattr(message, 'type') and message.type == 'human':
                                    return message.content[:100] + ('...' if len(message.content) > 100 else '')
                                elif isinstance(message, dict) and message.get('type') == 'human':
                                    content = message.get('content', '')
                                    return content[:100] + ('...' if len(content) > 100 else '')
            
            return "No messages found"
            
        except Exception as e:
            print(f"❌ Error getting first message: {e}")
            return "Error retrieving message"

# Create a global instance
memory_manager = MemoryManager()