import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private redisService: RedisService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Parse cookies from handshake
      const cookies = this.parseCookies(client.handshake.headers.cookie || '');
      const token = cookies.access_token;

      if (!token) {
        console.log(`Client ${client.id} rejected: No access token`);
        client.disconnect();
        return;
      }

      // Verify JWT and get user info (simplified validation)
      // In a real app, you'd want to use the WsJwtGuard or similar validation
      console.log(`Client connected: ${client.id}`);
      
      // For now, we'll assume the connection is valid
      // You can add JWT validation here similar to WsJwtGuard
    } catch (error) {
      console.log(`Client ${client.id} rejected: Invalid token`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove user from Redis when they disconnect
    await this.redisService.removeUserSocket(client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('authenticate')
  async handleAuthenticate(@ConnectedSocket() client: AuthenticatedSocket): Promise<void> {
    if (client.user) {
      // Store user-socket mapping in Redis
      await this.redisService.setUserSocket(client.user.id.toString(), client.id);
      client.emit('authenticated', { user: client.user });
      console.log(`User ${client.user.email} authenticated with socket ${client.id}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Broadcast message with user info
    this.server.emit('message', {
      id: client.id,
      user: {
        id: client.user.id,
        name: client.user.name,
        email: client.user.email,
      },
      data,
      timestamp: new Date().toISOString(),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chatbot-message')
  async handleChatbotMessage(
    @MessageBody() data: { message: string; conversation_id?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const { message, conversation_id = 'main' } = data;
    
    // Emit acknowledgment that message was received
    client.emit('chatbot-message-received', {
      message,
      conversation_id,
      user_id: client.user.id,
    });

    // Note: You would integrate ChatbotSocketService here
    // For now, we'll emit a placeholder response
    client.emit('chatbot-stream', {
      thread_id: `${client.user.id}_${conversation_id}`,
      content: `Received your message: "${message}". Chatbot integration ready.`,
      is_complete: true,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    client.join(room);
    await this.redisService.addUserToRoom(client.user.id.toString(), room);
    
    client.emit('joined-room', room);
    console.log(`User ${client.user.email} joined room: ${room}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    client.leave(room);
    await this.redisService.removeUserFromRoom(client.user.id.toString(), room);
    
    client.emit('left-room', room);
    console.log(`User ${client.user.email} left room: ${room}`);
  }

  // Utility method to emit to a specific user by ID
  async emitToUser(userId: string, event: string, data: any): Promise<void> {
    const socketId = await this.redisService.getSocketByUser(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Utility method to emit to all users in a room
  async emitToRoom(room: string, event: string, data: any): Promise<void> {
    const userIds = await this.redisService.getUsersInRoom(room);
    for (const userId of userIds) {
      const socketId = await this.redisService.getSocketByUser(userId);
      if (socketId) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }

  // Utility method to get online users in a room
  async getOnlineUsersInRoom(room: string): Promise<string[]> {
    return await this.redisService.getUsersInRoom(room);
  }

  private parseCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }
}
