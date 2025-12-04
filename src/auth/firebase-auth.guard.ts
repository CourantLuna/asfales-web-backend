import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { admin } from '../firebase/firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const header = req.headers['authorization'];
    if (!header) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = header.split(' ')[1]; // Bearer <token>

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
