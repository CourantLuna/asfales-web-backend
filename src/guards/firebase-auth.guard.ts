// src/guards/firebase-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      throw new UnauthorizedException('No se proporcionó token');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      console.log("Error de Auth:", error.code); // Para debug

      // Si el token expiró, lanzamos 401 explícitamente
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('El token ha expirado');
      }
      
      throw new UnauthorizedException('Token inválido');
    }
  }
}