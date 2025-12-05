import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [AuthModule,
     ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // .env.local si NODE_ENV=local
    }),
  ],
  controllers: [AppController,UsersController],
  providers: [AppService],
})
export class AppModule {}
