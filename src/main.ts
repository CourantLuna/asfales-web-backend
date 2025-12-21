import './firebase/firebase-admin'; // <--- AGREGAR ESTO ARRIBA DEL TODO
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CONFIGURACIÓN DE SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Asfales API')
    .setDescription('Documentación de la API del proyecto Asfales (Viajes y Lealtad)')
    .setVersion('1.0')
    .addBearerAuth() // Habilita el botón de "Authorize" para JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // La ruta donde verás la documentación (ej: localhost:3000/api/docs)
  SwaggerModule.setup('api/docs', app, document);
  // -------------------------------

  const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://asfales-web-frontend.vercel.app',
  /\.vercel\.app$/,
];

  app.enableCors({
    origin: allowedOrigins,   // frontend
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
const port = Number(process.env.PORT) || 3001;

  await app.listen(port);

//   console.log("🔥 NODE_ENV:", process.env.NODE_ENV);
// console.log("📄 Using PORT:", process.env.PORT);

}
bootstrap();
