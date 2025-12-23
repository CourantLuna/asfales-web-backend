import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './modules/users/users.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config'; 
import { SheetsModule } from './modules/sheets/sheets.module';
import { UserModule } from './modules/user/user.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';

@Module({
  imports: [AuthModule, 
     ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // .env.local si NODE_ENV=local
    }),
    SheetsModule, UserModule, FavoritesModule, BookingsModule, ExperiencesModule
  ],
  controllers: [AppController,UsersController],
  providers: [AppService],
})
export class AppModule {}
