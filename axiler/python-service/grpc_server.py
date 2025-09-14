import grpc
import asyncio
from concurrent import futures
import logging
import time
from typing import Iterator, Optional

import chatbot_pb2
import chatbot_pb2_grpc
from langchain_core.messages import HumanMessage
from googleGenai import model
from memory import memory_manager
from main import graph

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatbotServicer(chatbot_pb2_grpc.ChatbotServiceServicer):
    """gRPC servicer for the AI Chatbot with streaming responses."""
    
    def StreamChat(self, request: chatbot_pb2.ChatRequest, context) -> Iterator[chatbot_pb2.ChatResponse]:
        """
        Handle streaming chat requests.
        
        Args:
            request: ChatRequest with thread_id, message, user_id, conversation_id
            context: gRPC context
            
        Yields:
            ChatResponse chunks with streaming AI response
        """
        try:
            # Extract request parameters
            thread_id = request.thread_id
            message = request.message
            user_id = request.user_id.strip() if request.user_id else ""
            conversation_id = request.conversation_id or "main"
            
            # Validate required fields
            if not thread_id:
                yield chatbot_pb2.ChatResponse(
                    thread_id="",
                    content="",
                    is_complete=True,
                    error="thread_id is required"
                )
                return
                
            if not message:
                yield chatbot_pb2.ChatResponse(
                    thread_id=thread_id,
                    content="",
                    is_complete=True,
                    error="message is required"
                )
                return
                
            if not user_id:
                yield chatbot_pb2.ChatResponse(
                    thread_id=thread_id,
                    content="",
                    is_complete=True,
                    error="user_id is required"
                )
                return
            
            logger.info(f"Processing chat request for thread_id: {thread_id}")
            
            # Get conversation configuration
            config = memory_manager.get_conversation_config(user_id, conversation_id)
            
            # Override thread_id if provided explicitly
            if thread_id != f"{user_id}_{conversation_id}":
                config = {"configurable": {"thread_id": thread_id}}
            
            # Create input state with user message
            input_state = {"messages": [HumanMessage(content=message)]}
            
            # Invoke the graph and get the response
            result = graph.invoke(input_state, config)
            
            # Get the AI response
            ai_response = result["messages"][-1].content
            
            # Stream the response in chunks
            chunk_size = 50  # Adjust chunk size as needed
            for i in range(0, len(ai_response), chunk_size):
                chunk = ai_response[i:i + chunk_size]
                is_final = (i + chunk_size) >= len(ai_response)
                
                yield chatbot_pb2.ChatResponse(
                    thread_id=thread_id,
                    content=chunk,
                    is_complete=is_final,
                    error=""
                )
                
                # Small delay between chunks for realistic streaming
                if not is_final:
                    time.sleep(0.05)
            
            logger.info(f"Completed chat request for thread_id: {thread_id}")
            
        except Exception as e:
            logger.error(f"Error in StreamChat: {str(e)}")
            yield chatbot_pb2.ChatResponse(
                thread_id=request.thread_id,
                content="",
                is_complete=True,
                error=f"Internal server error: {str(e)}"
            )
    
    def GetHistory(self, request: chatbot_pb2.HistoryRequest, context) -> chatbot_pb2.HistoryResponse:
        """
        Get conversation history for a thread.
        
        Args:
            request: HistoryRequest with thread_id, user_id, conversation_id
            context: gRPC context
            
        Returns:
            HistoryResponse with conversation messages
        """
        try:
            thread_id = request.thread_id
            user_id = request.user_id or "default"
            conversation_id = request.conversation_id or "main"
            
            if not thread_id:
                return chatbot_pb2.HistoryResponse(
                    thread_id="",
                    messages=[],
                    error="thread_id is required"
                )
            
            logger.info(f"Getting history for thread_id: {thread_id}")
            
            # Get conversation configuration
            config = memory_manager.get_conversation_config(user_id, conversation_id)
            
            # Override thread_id if provided explicitly
            if thread_id != f"{user_id}_{conversation_id}":
                config = {"configurable": {"thread_id": thread_id}}
            
            # Get the current state to retrieve conversation history
            snapshot = graph.get_state(config)
            messages = []
            
            if snapshot.values.get("messages"):
                for msg in snapshot.values["messages"]:
                    role = "human" if msg.type == "human" else "ai"
                    messages.append(chatbot_pb2.Message(
                        role=role,
                        content=msg.content,
                        timestamp=int(time.time())  # Placeholder timestamp
                    ))
            
            return chatbot_pb2.HistoryResponse(
                thread_id=thread_id,
                messages=messages,
                error=""
            )
            
        except Exception as e:
            logger.error(f"Error in GetHistory: {str(e)}")
            return chatbot_pb2.HistoryResponse(
                thread_id=request.thread_id,
                messages=[],
                error=f"Internal server error: {str(e)}"
            )
    
    def ClearConversation(self, request: chatbot_pb2.ClearRequest, context) -> chatbot_pb2.ClearResponse:
        """
        Clear conversation history for a thread.
        
        Args:
            request: ClearRequest with thread_id, user_id, conversation_id
            context: gRPC context
            
        Returns:
            ClearResponse indicating success or failure
        """
        try:
            thread_id = request.thread_id
            user_id = request.user_id or "default"
            conversation_id = request.conversation_id or "main"
            
            if not thread_id:
                return chatbot_pb2.ClearResponse(
                    thread_id="",
                    success=False,
                    error="thread_id is required"
                )
            
            logger.info(f"Clearing conversation for thread_id: {thread_id}")
            
            # Use memory manager to clear conversation
            if thread_id == f"{user_id}_{conversation_id}":
                memory_manager.clear_conversation(user_id, conversation_id)
            else:
                # If thread_id is custom, extract user and conversation parts or use defaults
                parts = thread_id.split('_', 1)
                if len(parts) == 2:
                    memory_manager.clear_conversation(parts[0], parts[1])
                else:
                    memory_manager.clear_conversation("default", thread_id)
            
            return chatbot_pb2.ClearResponse(
                thread_id=thread_id,
                success=True,
                error=""
            )
            
        except Exception as e:
            logger.error(f"Error in ClearConversation: {str(e)}")
            return chatbot_pb2.ClearResponse(
                thread_id=request.thread_id,
                success=False,
                error=f"Internal server error: {str(e)}"
            )
    
    def GetUserConversations(self, request, context):
        """
        Get all conversations for a specific user.
        
        Args:
            request: UserConversationsRequest containing user_id
            context: gRPC context
            
        Returns:
            UserConversationsResponse with list of conversations
        """
        try:
            user_id = request.user_id.strip() if request.user_id else "default"
            
            if not user_id:
                return chatbot_pb2.UserConversationsResponse(
                    user_id="",
                    conversations=[],
                    error="user_id is required"
                )
            
            logger.info(f"Getting conversations for user: {user_id}")
            
            # Get conversations from memory manager
            conversations = memory_manager.get_user_conversations(user_id)
            
            # Convert to protobuf messages
            proto_conversations = []
            for conv in conversations:
                proto_conv = chatbot_pb2.Conversation(
                    thread_id=conv['thread_id'],
                    conversation_id=conv['conversation_id'],
                    first_message=conv['first_message'],
                    created_at=conv['created_at'],
                    last_activity=conv['last_activity'],
                    message_count=conv['message_count']
                )
                proto_conversations.append(proto_conv)
            
            logger.info(f"Found {len(proto_conversations)} conversations for user: {user_id}")
            
            return chatbot_pb2.UserConversationsResponse(
                user_id=user_id,
                conversations=proto_conversations,
                error=""
            )
            
        except Exception as e:
            logger.error(f"Error in GetUserConversations: {str(e)}")
            return chatbot_pb2.UserConversationsResponse(
                user_id=request.user_id,
                conversations=[],
                error=f"Internal server error: {str(e)}"
            )
    
    def HealthCheck(self, request, context):
        """
        Health check endpoint for the service.
        
        Args:
            request: HealthCheckRequest (empty)
            context: gRPC context
            
        Returns:
            HealthCheckResponse with service status
        """
        try:
            # Simple health check - just return SERVING if we can respond
            return chatbot_pb2.HealthCheckResponse(status="SERVING")
        except Exception as e:
            logger.error(f"Error in HealthCheck: {str(e)}")
            return chatbot_pb2.HealthCheckResponse(status="NOT_SERVING")

def serve(port: int = 50051):
    """
    Start the gRPC server.
    
    Args:
        port: Port number to serve on (default: 50051)
    """
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    chatbot_pb2_grpc.add_ChatbotServiceServicer_to_server(ChatbotServicer(), server)
    
    listen_addr = f'[::]:{port}'
    server.add_insecure_port(listen_addr)
    
    logger.info(f"🚀 Starting gRPC server on {listen_addr}")
    logger.info("📡 Services available:")
    logger.info("  - StreamChat: Streaming AI chat responses (requires thread_id, user_id, message)")
    logger.info("  - GetHistory: Retrieve conversation history")
    logger.info("  - ClearConversation: Clear conversation memory")
    logger.info("  - GetUserConversations: Get all conversations for a user")
    logger.info("  - HealthCheck: Service health monitoring")
    
    server.start()
    
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down gRPC server...")
        server.stop(0)

if __name__ == '__main__':
    serve()
