import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true, // Allow cookies
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
