import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config'; 
import { SheetsModule } from './modules/sheets/sheets.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [AuthModule, 
     ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // .env.local si NODE_ENV=local
    }),
    SheetsModule, UserModule
  ],
  controllers: [AppController,UsersController],
  providers: [AppService],
})
export class AppModule {}
