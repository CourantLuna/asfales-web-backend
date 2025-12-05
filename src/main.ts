import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  /\.vercel\.app$/,
];

  app.enableCors({
    origin: 'http://localhost:3000',   // frontend
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
const port = Number(process.env.PORT) || 3001;

  await app.listen(port);

  console.log("🔥 NODE_ENV:", process.env.NODE_ENV);
console.log("📄 Using PORT:", process.env.PORT);

}
bootstrap();
