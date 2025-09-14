import axios, { type AxiosError, type AxiosResponse } from 'axios';
import type {
    AuthResponse,
    ChatMessage,
    Conversation,
    LoginCredentials,
    RegisterData,
    User
} from './types';

// Get API URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Include cookies for authentication
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // For now, we're using cookie-based auth
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(new Error(error.message ?? 'Request configuration failed'));
  }
);

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login or clear auth state
      // console.error('Unauthorized access - please login again');
      // You might want to trigger a logout action here
      // or redirect to login page
    } else if (error.response?.status === 403) {
      console.error('Forbidden - insufficient permissions');
    } else if (error.response?.status === 500) {
      console.error('Server error - please try again later');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - please check your connection');
    }
    
    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);

// Auth API functions
export const authApi = {
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data as AuthResponse;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data as AuthResponse;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await axiosClient.post('/auth/logout');
    return response.data as AuthResponse;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosClient.get('/auth/me',);
    return response.data as User;
  },
};

// Chatbot API functions
export const chatbotApi = {
  getHistory: async (conversationId = 'main'): Promise<ChatMessage[]> => {
    const url = conversationId === 'main' 
      ? '/chatbot/history'
      : `/chatbot/history/${conversationId}`;
    const response = await axiosClient.get(url);
    return response.data as ChatMessage[];
  },

  getAllConversations: async (): Promise<Conversation[]> => {
    const response = await axiosClient.get('/chatbot/conversations');
    return response.data as Conversation[];
  },

  clearConversation: async (conversationId = 'main'): Promise<AuthResponse> => {
    const url = conversationId === 'main'
      ? '/chatbot/conversation'
      : `/chatbot/conversation/${conversationId}`;
    const response = await axiosClient.delete(url);
    return response.data as AuthResponse;
  },
};

// Generic API helper functions
export const api = {
  get: <T = unknown>(url: string, config = {}) => 
    axiosClient.get<T>(url, config).then(res => res.data),
  
  post: <T = unknown>(url: string, data = {}, config = {}) => 
    axiosClient.post<T>(url, data, config).then(res => res.data),
  
  put: <T = unknown>(url: string, data = {}, config = {}) => 
    axiosClient.put<T>(url, data, config).then(res => res.data),
  
  delete: <T = unknown>(url: string, config = {}) => 
    axiosClient.delete<T>(url, config).then(res => res.data),
  
  patch: <T = unknown>(url: string, data = {}, config = {}) => 
    axiosClient.patch<T>(url, data, config).then(res => res.data),
};

// Error handler utility
export const handleApiError = (error: AxiosError) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      success: false,
      error: (data as { message?: string })?.message ?? `Server error: ${status}`,
      status,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      success: false,
      error: 'No response from server. Please check your connection.',
      status: undefined,
    };
  } else {
    // Something else happened
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      status: undefined,
    };
  }
};

// Response wrapper for consistent error handling
export const apiRequest = async <T = unknown>(
  requestFn: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> => {
  try {
    const data = await requestFn();
    return { success: true, data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export default axiosClient;