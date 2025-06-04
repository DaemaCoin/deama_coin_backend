import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('DEAMA Coin Backend API')
    .setDescription('DEAMA 코인 백엔드 API 문서 - 사용자 인증, 지갑, 상점 관리 시스템')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'JWT 토큰을 입력하세요',
      in: 'header',
    })
    .addApiKey({
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: '관리자 API Key를 입력하세요',
    }, 'api-key')
    .addTag('auth', '사용자 인증 관련 API')
    .addTag('wallet', '지갑 관리 관련 API')
    .addTag('store', '상점 관리 관련 API')
    .addTag('admin', '관리자 기능 관련 API (API Key 필요)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      persistAuthorization: true,
    },
  });

  const port: number = Number(process.env.HTTP_PORT) || 3000;
  await app.listen(port, () => {
    Logger.log(`Server running on port ${port}`);
    Logger.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
  });
}
bootstrap();
