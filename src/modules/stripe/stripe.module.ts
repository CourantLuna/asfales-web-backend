import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, UserModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}