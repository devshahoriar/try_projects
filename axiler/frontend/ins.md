# 🚀 Axiler Backend - Client App Integration Guide

## 📋 Overview

This document provides comprehensive instructions for client applications to integrate with the Axiler Backend API. The backend provides authentication, real-time communication, and AI chatbot capabilities.

## 🔗 Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

---

## 🔐 Authentication Integration

### 1. Register New User

**Endpoint**: `POST /auth/register`

```javascript
// JavaScript/TypeScript Example
const registerUser = async (userData) => {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: Include cookies
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password
    })
  });
  
  const result = await response.json();
  return result; // { message: "Registration successful" }
};
```

### 2. Login User

**Endpoint**: `POST /auth/login`

```javascript
const loginUser = async (credentials) => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: Include cookies
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    })
  });
  
  const result = await response.json();
  return result; // { message: "Login successful" }
};
```

### 3. Get Current User

**Endpoint**: `GET /auth/me`

```javascript
const getCurrentUser = async () => {
  const response = await fetch('http://localhost:3000/auth/me', {
    method: 'GET',
    credentials: 'include', // Important: Include cookies
  });
  
  if (response.status === 401) {
    throw new Error('User not authenticated');
  }
  
  const user = await response.json();
  return user; // { id, name, email }
};
```

### 4. Logout User

**Endpoint**: `POST /auth/logout`

```javascript
const logoutUser = async () => {
  const response = await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    credentials: 'include', // Important: Include cookies
  });
  
  const result = await response.json();
  return result; // { message: "Logout successful" }
};
```

---

## ⚡ Socket.IO Real-time Integration

### 1. Installation

```bash
# For React/Vue/Angular
npm install socket.io-client

# For React Native
npm install socket.io-client react-native-url-polyfill
```

### 2. Basic Connection Setup

```javascript
import { io } from 'socket.io-client';

// Initialize Socket.IO client
const socket = io('http://localhost:3000', {
  withCredentials: true, // Important: Send cookies for authentication
  autoConnect: false,    // Manual connection control
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
  // Authenticate after connection
  socket.emit('authenticate');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('authenticated', (data) => {
  console.log('Authentication successful:', data.user);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Connect manually
socket.connect();
```

### 3. React Hook Example

```javascript
// useSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (serverUrl = 'http://localhost:3000') => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const newSocket = io(serverUrl, {
      withCredentials: true,
      autoConnect: false,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('authenticate');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setUser(null);
    });

    newSocket.on('authenticated', (data) => {
      setUser(data.user);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);
    newSocket.connect();

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  return { socket, isConnected, user };
};
```

### 4. Room Management

```javascript
// Join a room
const joinRoom = (roomName) => {
  socket.emit('join-room', roomName);
};

// Listen for room events
socket.on('joined-room', (room) => {
  console.log('Successfully joined room:', room);
});

socket.on('left-room', (room) => {
  console.log('Left room:', room);
});

// Leave a room
const leaveRoom = (roomName) => {
  socket.emit('leave-room', roomName);
};
```

### 5. Real-time Messaging

```javascript
// Send message to all users
const sendMessage = (message) => {
  socket.emit('message', {
    text: message,
    timestamp: new Date().toISOString()
  });
};

// Listen for messages
socket.on('message', (data) => {
  console.log('New message:', {
    user: data.user,
    content: data.data,
    timestamp: data.timestamp
  });
});
```

---

## 🤖 AI Chatbot Integration

### 1. HTTP API Methods

#### Send Chat Message
```javascript
const sendChatMessage = async (message, conversationId = 'main') => {
  const response = await fetch('http://localhost:3000/chatbot/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      message: message,
      conversation_id: conversationId
    })
  });
  
  return await response.json();
};
```

#### Get Conversation History
```javascript
const getChatHistory = async (conversationId = 'main') => {
  const url = conversationId === 'main' 
    ? 'http://localhost:3000/chatbot/history'
    : `http://localhost:3000/chatbot/history/${conversationId}`;
    
  const response = await fetch(url, {
    credentials: 'include',
  });
  
  return await response.json();
};
```

#### Get All Conversations
```javascript
const getAllConversations = async () => {
  const response = await fetch('http://localhost:3000/chatbot/conversations', {
    credentials: 'include',
  });
  
  return await response.json();
};
```

#### Clear Conversation
```javascript
const clearConversation = async (conversationId = 'main') => {
  const url = conversationId === 'main'
    ? 'http://localhost:3000/chatbot/conversation'
    : `http://localhost:3000/chatbot/conversation/${conversationId}`;
    
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  return await response.json();
};
```

### 2. Real-time Chat via Socket.IO

```javascript
// Send chatbot message via Socket.IO
const sendChatbotMessage = (message, conversationId = 'main') => {
  socket.emit('chatbot-message', {
    message: message,
    conversation_id: conversationId
  });
};

// Listen for chatbot responses
socket.on('chatbot-message-received', (data) => {
  console.log('Message sent to AI:', data);
});

socket.on('chatbot-stream', (response) => {
  console.log('AI Response chunk:', response.content);
  
  if (response.is_complete) {
    console.log('AI response complete');
  }
});

socket.on('chatbot-error', (error) => {
  console.error('Chatbot error:', error);
});

socket.on('chatbot-stream-complete', (data) => {
  console.log('Stream finished for thread:', data.thread_id);
});
```

---

## 📱 React Component Examples

### 1. Authentication Component

```jsx
// AuthComponent.jsx
import React, { useState, useEffect } from 'react';

const AuthComponent = () => {
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log('User not authenticated');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(loginForm);
      await checkAuthStatus();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.name}!</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={loginForm.email}
        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
      />
      <input
        type="password"
        placeholder="Password"
        value={loginForm.password}
        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### 2. Chat Component

```jsx
// ChatComponent.jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

const ChatComponent = () => {
  const { socket, isConnected, user } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('chatbot-stream', (response) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'ai',
        content: response.content,
        timestamp: new Date()
      }]);
    });

    return () => {
      socket.off('chatbot-stream');
    };
  }, [socket]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket) return;

    // Add user message to chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }]);

    // Send to AI via Socket.IO
    socket.emit('chatbot-message', {
      message: inputMessage,
      conversation_id: 'main'
    });

    setInputMessage('');
  };

  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  if (!user) {
    return <div>Please authenticate first</div>;
  }

  return (
    <div>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
            <span>{msg.content}</span>
          </div>
        ))}
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

---

## 🔧 Error Handling

### Common Error Responses

```javascript
// Authentication errors
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// Validation errors
{
  "statusCode": 400,
  "message": ["email must be a valid email"],
  "error": "Bad Request"
}

// Chatbot service errors
{
  "message": "Chatbot service not available"
}
```

### Error Handling Best Practices

```javascript
const handleApiCall = async (apiFunction) => {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return { success: false, error: error.message };
  }
};
```

---

## 🌐 CORS Configuration

For client applications, ensure your requests include:

```javascript
// For fetch requests
{
  credentials: 'include' // Always include for cookie-based auth
}

// For axios
axios.defaults.withCredentials = true;

// For Socket.IO
{
  withCredentials: true
}
```

---

## 📝 Environment Variables

Client-side environment variables:

```env
# .env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:3000

# For production
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

---

## 🚀 Deployment Considerations

### Production Checklist

1. **Update API URLs** to production endpoints
2. **Enable HTTPS** for secure cookie transmission
3. **Configure CORS** for your domain
4. **Set secure cookie flags** in production
5. **Handle WebSocket** connections properly
6. **Implement retry logic** for failed connections
7. **Add proper error boundaries** in React

### Security Best Practices

1. **Never expose sensitive data** in client-side code
2. **Validate all user inputs** before sending to API
3. **Handle authentication state** properly
4. **Implement proper logout** functionality
5. **Use HTTPS** in production
6. **Sanitize user content** before displaying

---

## 📞 Support

For issues or questions:
- Check server logs for backend errors
- Verify authentication cookies are being sent
- Ensure Socket.IO connection is established
- Test API endpoints with proper credentials

---

*Last Updated: September 10, 2025*
