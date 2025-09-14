# AI Chatbot Service with gRPC

A powerful AI chatbot service that provides both CLI and gRPC interfaces for interacting with Google's Gemini AI model. Features persistent conversation memory using PostgreSQL and streaming responses via gRPC.

## Features

- 🤖 **AI-Powered Chat**: Uses Google Gemini 2.5 Flash model
- 🐘 **Persistent Memory**: PostgreSQL-backed conversation storage
- 📡 **gRPC Streaming**: Real-time streaming responses
- 🔄 **Multi-Session Support**: Handle multiple conversation threads
- 🖥️ **Dual Interface**: Both CLI and gRPC modes
- 🧵 **Thread Management**: Per-user conversation isolation
- 📋 **Conversation Management**: Get all conversations for a user
- 🏥 **Health Checks**: Service monitoring support

## Architecture

```
External Service ←→ gRPC Server ←→ LangGraph ←→ Google Gemini AI
                                      ↓
                               PostgreSQL Memory
```

## Docker Support

### Quick Start with Docker Compose

1. **Clone and setup**:
```bash
git clone <repository>
cd python-service
cp .env.example .env
# Edit .env file with your Google API key
```

2. **Run with Docker Compose**:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- gRPC chatbot service on port 50051

### Manual Docker Setup

1. **Build the image**:
```bash
docker build -t chatbot-service .
```

2. **Run with environment variables**:
```bash
docker run -p 50051:50051 \
  -e GOOGLE_API_KEY="your_api_key" \
  -e DB_HOST="your_db_host" \
  chatbot-service
```

## Setup

### 1. Environment Setup

Create a `.env` file with your credentials:

```env
GOOGLE_API_KEY="your_google_api_key_here"
DATABASE_URL="postgresql://postgres:admin@localhost:5432/axiler_ai"
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Database Setup

Ensure PostgreSQL is running and the database exists:

```sql
CREATE DATABASE axiler_ai;
```

### 4. Generate gRPC Code

```bash
python -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. proto/chatbot.proto
```

## Usage

### CLI Mode

Start the interactive command-line interface:

```bash
python main.py
```

### gRPC Server Mode

Start the gRPC server:

```bash
python main.py grpc 50051
```

Or use the convenience scripts:
- Windows: `start_grpc_server.bat`
- PowerShell: `start_grpc_server.ps1`

## gRPC Service API

### Service Definition

The service provides three main RPC methods:

#### 1. StreamChat (Streaming)

Send a message and receive streaming AI responses.

**Request:**
```protobuf
message ChatRequest {
  string thread_id = 1;      // Required: Unique thread identifier
  string message = 2;        // Required: User's message
  string user_id = 3;        // Optional: User identifier (default: "default")
  string conversation_id = 4; // Optional: Conversation identifier (default: "main")
}
```

**Response Stream:**
```protobuf
message ChatResponse {
  string thread_id = 1;      // Thread identifier
  string content = 2;        // Chunk of AI response
  bool is_complete = 3;      // Indicates if this is the final chunk
  string error = 4;          // Error message if any
}
```

#### 2. GetHistory

Retrieve conversation history for a thread.

**Request:**
```protobuf
message HistoryRequest {
  string thread_id = 1;      // Required: Thread identifier
  string user_id = 2;        // Optional: User identifier
  string conversation_id = 3; // Optional: Conversation identifier
}
```

#### 3. ClearConversation

Clear conversation history for a thread.

**Request:**
```protobuf
message ClearRequest {
  string thread_id = 1;      // Required: Thread identifier
  string user_id = 2;        // Optional: User identifier
  string conversation_id = 3; // Optional: Conversation identifier
}
```

#### 4. GetUserConversations

Get all conversations for a specific user.

**Request:**
```protobuf
message UserConversationsRequest {
  string user_id = 1;        // Required: User identifier
}
```

**Response:**
```protobuf
message UserConversationsResponse {
  string user_id = 1;
  repeated Conversation conversations = 2;
  string error = 3;
}

message Conversation {
  string thread_id = 1;      // Full thread identifier (user_id_conversation_id)
  string conversation_id = 2; // Just the conversation part
  string first_message = 3;  // First message in the conversation (truncated)
  int64 created_at = 4;      // Creation timestamp (Unix time)
  int64 last_activity = 5;   // Last activity timestamp (Unix time)
  int32 message_count = 6;   // Total number of messages
}
```

#### 5. HealthCheck

Check if the service is running and healthy.

**Request:**
```protobuf
message HealthCheckRequest {
  // Empty request
}
```

**Response:**
```protobuf
message HealthCheckResponse {
  string status = 1;         // "SERVING" or "NOT_SERVING"
}
```

## Client Integration Examples

### Python Client

```python
import grpc
import chatbot_pb2
import chatbot_pb2_grpc

# Connect to server
channel = grpc.insecure_channel('localhost:50051')
stub = chatbot_pb2_grpc.ChatbotServiceStub(channel)

# Send streaming chat request
request = chatbot_pb2.ChatRequest(
    thread_id="user123_session1",
    message="Hello, can you help me with Python?",
    user_id="user123",
    conversation_id="session1"
)

# Process streaming response
for response in stub.StreamChat(request):
    if response.error:
        print(f"Error: {response.error}")
        break
    
    print(response.content, end='', flush=True)
    
    if response.is_complete:
        print("\nResponse complete!")
        break

# Get all conversations for a user
def get_user_conversations(user_id):
    request = chatbot_pb2.UserConversationsRequest(user_id=user_id)
    response = stub.GetUserConversations(request)
    
    if response.error:
        print(f"Error: {response.error}")
        return
    
    print(f"User {response.user_id} has {len(response.conversations)} conversations:")
    for conv in response.conversations:
        print(f"- {conv.conversation_id}: {conv.first_message}")
        print(f"  Created: {conv.created_at}, Messages: {conv.message_count}")

# Health check
def check_health():
    request = chatbot_pb2.HealthCheckRequest()
    response = stub.HealthCheck(request)
    print(f"Service status: {response.status}")
```

### Node.js Client Example

```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load proto file
const packageDefinition = protoLoader.loadSync('proto/chatbot.proto');
const chatbot = grpc.loadPackageDefinition(packageDefinition).chatbot;

// Create client
const client = new chatbot.ChatbotService('localhost:50051', grpc.credentials.createInsecure());

// Send streaming request
const call = client.StreamChat({
    thread_id: 'user123_session1',
    message: 'Hello from Node.js!',
    user_id: 'user123',
    conversation_id: 'session1'
});

call.on('data', (response) => {
    if (response.error) {
        console.error('Error:', response.error);
        return;
    }
    
    process.stdout.write(response.content);
    
    if (response.is_complete) {
        console.log('\nResponse complete!');
    }
});
```

## Testing

### Test the New GetUserConversations API

1. **Start the service**:
```bash
# Using Docker Compose
docker-compose up -d

# Or directly
python grpc_server.py
```

2. **Create test conversations**:
```bash
python create_test_conversations.py
```

3. **Test getting user conversations**:
```bash
python test_user_conversations.py
```

### Interactive Testing

Test the gRPC service interactively:

```bash
python grpc_client_test.py interactive
```

Commands in interactive mode:
- `chat <thread_id> <message>` - Send a message
- `history <thread_id>` - Get conversation history  
- `clear <thread_id>` - Clear conversation
- `conversations <user_id>` - Get all conversations for user
- `health` - Check service health
- `quit` - Exit

### Automated Testing

Run automated tests:

```bash
python grpc_client_test.py
```

## Thread ID Management

Thread IDs uniquely identify conversation sessions. They can be:

1. **Auto-generated**: `{user_id}_{conversation_id}` (e.g., "user123_session1")
2. **Custom**: Any unique string provided by the client

## Error Handling

The service provides comprehensive error handling:

- **Validation Errors**: Missing required fields
- **Database Errors**: Connection or query failures
- **AI Model Errors**: API timeouts or rate limits
- **General Errors**: Unexpected system errors

All errors are returned in the response with descriptive messages.

## Performance Considerations

- **Streaming**: Responses are chunked for real-time feel
- **Connection Pooling**: PostgreSQL connection management
- **Concurrency**: Thread-safe design with concurrent request handling
- **Memory Management**: Efficient state management via LangGraph

## Configuration

### Environment Variables

- `GOOGLE_API_KEY`: Google Gemini API key
- `DATABASE_URL`: PostgreSQL connection string

### gRPC Server Settings

- **Port**: Default 50051, configurable via command line
- **Max Workers**: 10 concurrent request handlers
- **Chunk Size**: 50 characters per streaming chunk

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database exists

2. **gRPC Connection Errors**
   - Verify server is running on correct port
   - Check firewall settings
   - Ensure client uses correct server address

3. **AI Model Errors**
   - Verify GOOGLE_API_KEY is valid
   - Check API quota and rate limits
   - Ensure internet connectivity

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request
