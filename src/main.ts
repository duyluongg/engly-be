import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Bỏ qua field không có trong DTO
    forbidNonWhitelisted: true, // Throw error nếu có field lạ
    transform: true,        // Auto-transform types
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
