import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const cookies = this.parseCookies(client.handshake.headers.cookie || '');
      const token = cookies.access_token;

      if (!token) {
        return false;
      }

      const secret = this.configService.get<string>('JWT_SECRET') || 'fallback-secret-key';
      const payload = this.jwtService.verify(token, { secret });
      
      const user = await this.authService.findUserById(payload.sub);
      if (!user) {
        return false;
      }

      // Attach user to client for later use
      client.user = { id: user.id, email: user.email, name: user.name };
      return true;
    } catch (error) {
      return false;
    }
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
