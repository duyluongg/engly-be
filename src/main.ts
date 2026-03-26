import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Bỏ qua field không có trong DTO
    forbidNonWhitelisted: true, // Throw error nếu có field lạ
    transform: true,        // Auto-transform types
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Engly API')
    .setDescription('Engly Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📄 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
