from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage
from googleGenai import model
from memory import memory_manager

# Define the state of our graph
class State(TypedDict):
    # Messages have the type "list". The `add_messages` function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]

# Define the function that calls the model
def chatbot(state: State):
    return {"messages": [model.invoke(state["messages"])]}

# Build the graph
graph_builder = StateGraph(State)

# The first argument is the unique node name
# The second argument is the function or object that will be called whenever
# the node is used.
graph_builder.add_node("chatbot", chatbot)

# The first argument is the name of the node that will be called first.
graph_builder.add_edge(START, "chatbot")

# The second argument is the name of the node (or END) that will be called after.
graph_builder.add_edge("chatbot", END)

# Finally, we compile the graph with PostgreSQL checkpointer for persistent memory
graph = graph_builder.compile(checkpointer=memory_manager.checkpointer)

def run_chat():
    """Enhanced chat loop with persistent memory using PostgreSQL"""
    print("🤖 AI Chatbot Service Started with PostgreSQL Memory!")
    print("Features:")
    print("- Persistent conversation memory across sessions")
    print("- Multi-user support with separate conversation threads")
    print("- PostgreSQL-backed storage")
    print("\nCommands:")
    print("- Type 'quit' or 'exit' to end the session")
    print("- Type 'new' to start a new conversation thread")
    print("- Type 'history' to view conversation history")
    print("-" * 50)
    
    # Default user and conversation settings
    user_id = "default"
    conversation_id = "main"
    
    # Get the configuration for this conversation thread
    config = memory_manager.get_conversation_config(user_id, conversation_id)
    
    print(f"💬 Starting conversation thread: {user_id}_{conversation_id}")
    
    while True:
        user_input = input(f"\n[{conversation_id}] User: ")
        
        # Handle special commands
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("👋 Goodbye!")
            break
        elif user_input.lower() == 'new':
            conversation_id = input("Enter new conversation ID (or press Enter for timestamp): ").strip()
            if not conversation_id:
                import datetime
                conversation_id = f"chat_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
            config = memory_manager.get_conversation_config(user_id, conversation_id)
            print(f"🆕 Started new conversation: {user_id}_{conversation_id}")
            continue
        elif user_input.lower() == 'history':
            try:
                # Get the current state to show conversation history
                snapshot = graph.get_state(config)
                if snapshot.values.get("messages"):
                    print("\n📖 Conversation History:")
                    print("-" * 30)
                    for msg in snapshot.values["messages"]:
                        role = "User" if msg.type == "human" else "AI"
                        print(f"{role}: {msg.content}")
                    print("-" * 30)
                else:
                    print("📝 No conversation history found for this thread.")
            except Exception as e:
                print(f"❌ Error retrieving history: {e}")
            continue
        
        try:
            # Create the state with the user's message
            # Note: We don't include previous messages here because LangGraph's checkpointing
            # automatically loads and maintains the conversation state
            input_state = {"messages": [HumanMessage(content=user_input)]}
            
            # Invoke the graph with the configuration for persistent memory
            # The config parameter enables the checkpointing system
            result = graph.invoke(input_state, config)
            
            # Get the AI's response (the last message in the result)
            ai_response = result["messages"][-1].content
            print(f"🤖 AI: {ai_response}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            print("Please check your database connection and try again.")

def main():
    """Main entry point with mode selection."""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'grpc':
        # Start gRPC server mode
        from grpc_server import serve
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 50051
        print(f"🚀 Starting in gRPC server mode on port {port}")
        serve(port)
    else:
        # Start CLI mode
        print("🖥️ Starting in CLI mode")
        run_chat()

if __name__ == "__main__":
    main()