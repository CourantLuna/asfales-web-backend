import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { GetUserService } from '../user/getUser.service';
import { SheetsModule } from '../sheets/sheets.module';

@Module({
  imports: [ConfigModule, SheetsModule],
  controllers: [StripeController],
  providers: [StripeService, GetUserService],
  exports: [StripeService],
})
export class StripeModule {}