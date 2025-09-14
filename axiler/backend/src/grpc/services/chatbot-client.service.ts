import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { grpcClientOptions } from '../config/grpc.config';
import {
  ChatbotService,
  ChatRequest,
  ChatResponse,
  HistoryRequest,
  HistoryResponse,
  ClearRequest,
  ClearResponse,
  UserConversationsRequest,
  UserConversationsResponse,
  HealthCheckRequest,
  HealthCheckResponse,
} from '../interfaces/chatbot.interface';

@Injectable()
export class ChatbotClientService implements OnModuleInit {
  private readonly logger = new Logger(ChatbotClientService.name);

  @Client(grpcClientOptions)
  private client: ClientGrpc;

  private chatbotService: ChatbotService;

  onModuleInit() {
    try {
      this.chatbotService = this.client.getService<ChatbotService>('ChatbotService');
      this.logger.log('Chatbot gRPC client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize chatbot gRPC client', error);
    }
  }

  streamChat(request: ChatRequest): Observable<ChatResponse> {
    if (!this.chatbotService) {
      throw new Error('Chatbot service not available');
    }
    return this.chatbotService.streamChat(request);
  }

  async getHistory(request: HistoryRequest): Promise<HistoryResponse> {
    if (!this.chatbotService) {
      throw new Error('Chatbot service not available');
    }
    return this.chatbotService.getHistory(request);
  }

  async clearConversation(request: ClearRequest): Promise<ClearResponse> {
    if (!this.chatbotService) {
      throw new Error('Chatbot service not available');
    }
    return this.chatbotService.clearConversation(request);
  }

  async getUserConversations(request: UserConversationsRequest): Promise<UserConversationsResponse> {
    if (!this.chatbotService) {
      throw new Error('Chatbot service not available');
    }
    return this.chatbotService.getUserConversations(request);
  }

  async healthCheck(request: HealthCheckRequest): Promise<HealthCheckResponse> {
    if (!this.chatbotService) {
      throw new Error('Chatbot service not available');
    }
    return this.chatbotService.healthCheck(request);
  }

  // Utility method to create thread_id
  createThreadId(userId: string, conversationId: string = 'main'): string {
    return `${userId}_${conversationId}`;
  }
}
