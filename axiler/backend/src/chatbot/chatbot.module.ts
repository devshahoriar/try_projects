import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotClientService } from '../grpc/services/chatbot-client.service';

@Module({
  controllers: [
    ChatbotController 
  ],
  providers: [
    ChatbotClientService
  ],
  exports: [
    ChatbotClientService
  ],
})
export class ChatbotModule {}
