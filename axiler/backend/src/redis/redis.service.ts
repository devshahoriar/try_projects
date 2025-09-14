import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    });
  }

  async setUserSocket(userId: string, socketId: string): Promise<void> {
    await this.redis.set(`user:${userId}:socket`, socketId);
    await this.redis.set(`socket:${socketId}:user`, userId);
  }

  async removeUserSocket(socketId: string): Promise<void> {
    const userId = await this.redis.get(`socket:${socketId}:user`);
    if (userId) {
      await this.redis.del(`user:${userId}:socket`);
      await this.redis.del(`socket:${socketId}:user`);
    }
  }

  async getUserBySocket(socketId: string): Promise<string | null> {
    return await this.redis.get(`socket:${socketId}:user`);
  }

  async getSocketByUser(userId: string): Promise<string | null> {
    return await this.redis.get(`user:${userId}:socket`);
  }

  async addUserToRoom(userId: string, room: string): Promise<void> {
    await this.redis.sadd(`room:${room}:users`, userId);
    await this.redis.sadd(`user:${userId}:rooms`, room);
  }

  async removeUserFromRoom(userId: string, room: string): Promise<void> {
    await this.redis.srem(`room:${room}:users`, userId);
    await this.redis.srem(`user:${userId}:rooms`, room);
  }

  async getUsersInRoom(room: string): Promise<string[]> {
    return await this.redis.smembers(`room:${room}:users`);
  }

  async getUserRooms(userId: string): Promise<string[]> {
    return await this.redis.smembers(`user:${userId}:rooms`);
  }
}
