import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { networkInterfaces } from 'os';
import { AppModule } from './app.module';

const getLocalIpAddress = () => {
  const interfaces = networkInterfaces();

  for (const network of Object.values(interfaces)) {
    for (const details of network ?? []) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }

  return 'localhost';
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);

  const localIp = getLocalIpAddress();
  console.log(`API Local: http://localhost:${port}`);
  console.log(`API Network: http://${localIp}:${port}`);
  console.log(`Site Local: ${frontendUrl}`);
}

bootstrap();
