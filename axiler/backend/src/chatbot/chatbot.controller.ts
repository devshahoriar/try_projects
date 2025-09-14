import { Controller, Post, Get, Body, UseGuards, Request, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatbotClientService } from '../grpc/services/chatbot-client.service';
import {
  ChatRequest,
  HistoryRequest,
  ClearRequest,
  UserConversationsRequest,
} from '../grpc/interfaces/chatbot.interface';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string;
  };
}

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotClientService) {}

  @Post('chat')
  async chat(@Request() req: AuthenticatedRequest, @Body() body: { message: string; conversation_id?: string }) {
    const { message, conversation_id = 'main' } = body;
    const userId = req.user.id.toString();
    const threadId = this.chatbotService.createThreadId(userId, conversation_id);

    const chatRequest: ChatRequest = {
      thread_id: threadId,
      message,
      user_id: userId,
      conversation_id,
    };

    // For streaming responses, you'd typically handle this differently
    // This is a simplified version that returns the stream
    return this.chatbotService.streamChat(chatRequest);
  }

  @Get('history/:conversation_id')
  async getHistory(@Request() req: AuthenticatedRequest, @Param('conversation_id') conversationId: string) {
    const userId = req.user.id.toString();
    const threadId = this.chatbotService.createThreadId(userId, conversationId);

    const historyRequest: HistoryRequest = {
      thread_id: threadId,
      user_id: userId,
      conversation_id: conversationId,
    };

    return this.chatbotService.getHistory(historyRequest);
  }

  @Get('history')
  async getDefaultHistory(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id.toString();
    const conversationId = 'main';
    const threadId = this.chatbotService.createThreadId(userId, conversationId);

    const historyRequest: HistoryRequest = {
      thread_id: threadId,
      user_id: userId,
      conversation_id: conversationId,
    };

    return this.chatbotService.getHistory(historyRequest);
  }

  @Delete('conversation/:conversation_id')
  async clearConversation(@Request() req: AuthenticatedRequest, @Param('conversation_id') conversationId: string) {
    const userId = req.user.id.toString();
    const threadId = this.chatbotService.createThreadId(userId, conversationId);

    const clearRequest: ClearRequest = {
      thread_id: threadId,
      user_id: userId,
      conversation_id: conversationId,
    };

    return this.chatbotService.clearConversation(clearRequest);
  }

  @Delete('conversation')
  async clearDefaultConversation(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id.toString();
    const conversationId = 'main';
    const threadId = this.chatbotService.createThreadId(userId, conversationId);

    const clearRequest: ClearRequest = {
      thread_id: threadId,
      user_id: userId,
      conversation_id: conversationId,
    };

    return this.chatbotService.clearConversation(clearRequest);
  }

  @Get('conversations')
  async getUserConversations(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id.toString();

    const request: UserConversationsRequest = {
      user_id: userId,
    };

    return this.chatbotService.getUserConversations(request);
  }

  @Get('health')
  async healthCheck() {
    return this.chatbotService.healthCheck({});
  }
}
