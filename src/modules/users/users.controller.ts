import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard'

@Controller('users')
export class UsersController {
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    const firebaseUser = req.user;

    return {
      id: firebaseUser.uid,
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.name ?? '',
      avatar: firebaseUser.picture ?? '',
      createdAt: firebaseUser.auth_time,
      phoneNumber: firebaseUser.phoneNumber
    };
  }
}
