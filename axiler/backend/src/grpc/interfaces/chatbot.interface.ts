export interface ChatRequest {
  thread_id: string;
  message: string;
  user_id: string;
  conversation_id?: string;
}

export interface ChatResponse {
  thread_id: string;
  content: string;
  is_complete: boolean;
  error?: string;
}

export interface HistoryRequest {
  thread_id: string;
  user_id?: string;
  conversation_id?: string;
}

export interface HistoryResponse {
  thread_id: string;
  messages: Message[];
  error?: string;
}

export interface Message {
  role: string; // "human" or "ai"
  content: string;
  timestamp: number;
}

export interface ClearRequest {
  thread_id: string;
  user_id?: string;
  conversation_id?: string;
}

export interface ClearResponse {
  thread_id: string;
  success: boolean;
  error?: string;
}

export interface UserConversationsRequest {
  user_id: string;
}

export interface UserConversationsResponse {
  user_id: string;
  conversations: Conversation[];
  error?: string;
}

export interface Conversation {
  thread_id: string;
  conversation_id: string;
  first_message: string;
  created_at: number;
  last_activity: number;
  message_count: number;
}

export interface HealthCheckRequest {
}

export interface HealthCheckResponse {
  status: string;
}

export interface ChatbotService {
  streamChat(request: ChatRequest): any;
  getHistory(request: HistoryRequest): Promise<HistoryResponse>;
  clearConversation(request: ClearRequest): Promise<ClearResponse>;
  getUserConversations(request: UserConversationsRequest): Promise<UserConversationsResponse>;
  healthCheck(request: HealthCheckRequest): Promise<HealthCheckResponse>;
}
