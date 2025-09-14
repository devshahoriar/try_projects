import { Controller, Post, Body, UseGuards, Request, Get, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Response() res) {
    const result = await this.authService.register(registerDto);
    
    // Set JWT as HTTP-only cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    return res.json({ message: 'Registration successful' });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto, @Response() res) {
    const result = await this.authService.login(req.user);
    
    // Set JWT as HTTP-only cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    return res.json({ message: 'Login successful' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('logout')
  logout(@Response() res) {
    res.clearCookie('access_token');
    return res.json({ message: 'Logout successful' });
  }
}
