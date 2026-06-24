import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  const uploadsDir = join(process.cwd(), 'uploads', 'vouchers');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const allowedOrigins = [
    'http://localhost:5173',
    'https://dinamicas-production.up.railway.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API de Rifas - Dinámicas Los Hermanos')
    .setDescription('Backend para gestión de rifas, tickets y compras con flujo de pago por Nequi.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Servidor: http://localhost:${port}`);
  logger.log(`📖 Swagger:  http://localhost:${port}/docs`);
  logger.log(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
}

bootstrap();
