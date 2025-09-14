// API Response Types

// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  updatedAt: string;
}

// Socket.IO Event Types
export interface SocketChatMessage {
  message: string;
  conversation_id: string;
}

export interface SocketChatResponse {
  content: string;
  is_complete?: boolean;
  thread_id?: string;
}

export interface SocketAuthenticatedUser {
  user: User;
}

// API Error Types
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// Generic API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
