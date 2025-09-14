import { Injectable } from '@nestjs/common';
import { SocketGateway } from '../socket/socket.gateway';
import { ChatbotClientService } from '../grpc/services/chatbot-client.service';
import { ChatRequest } from '../grpc/interfaces/chatbot.interface';

@Injectable()
export class ChatbotSocketService {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly chatbotService: ChatbotClientService,
  ) {}

  async streamChatToSocket(
    userId: string,
    socketId: string,
    message: string,
    conversationId: string = 'main',
  ): Promise<void> {
    const threadId = this.chatbotService.createThreadId(userId, conversationId);

    const chatRequest: ChatRequest = {
      thread_id: threadId,
      message,
      user_id: userId,
      conversation_id: conversationId,
    };

    // Stream the chatbot response to the specific socket
    const stream = this.chatbotService.streamChat(chatRequest);

    stream.subscribe({
      next: (response) => {
        this.socketGateway.server.to(socketId).emit('chatbot-stream', {
          thread_id: response.thread_id,
          content: response.content,
          is_complete: response.is_complete,
          error: response.error,
        });
      },
      error: (error) => {
        this.socketGateway.server.to(socketId).emit('chatbot-error', {
          thread_id: threadId,
          error: error.message || 'An error occurred while streaming chat',
        });
      },
      complete: () => {
        this.socketGateway.server.to(socketId).emit('chatbot-stream-complete', {
          thread_id: threadId,
        });
      },
    });
  }

  async streamChatToUser(
    userId: string,
    message: string,
    conversationId: string = 'main',
  ): Promise<void> {
    // Get user's socket from Redis and stream to them
    const socketId = await this.socketGateway['redisService'].getSocketByUser(userId);
    if (socketId) {
      await this.streamChatToSocket(userId, socketId, message, conversationId);
    }
  }
}
