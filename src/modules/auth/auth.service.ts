import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { admin } from '../../firebase/firebase-admin';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
constructor(private readonly userService: UserService) {}

  async registerUser(data: RegisterUserDto) {
    try {
      // Construir objeto con las propiedades obligatorias
    const userData: admin.auth.CreateRequest = {
      uid: data.uid,
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      photoURL: data.photoURL,
      emailVerified: data.emailVerified || false,
      disabled: data.disabled || false,
    };

    // Solo agregar phoneNumber si existe y no está vacío
    if (data.phoneNumber) {
      userData.phoneNumber = data.phoneNumber;
    }
    const userRecord = await admin.auth().createUser(userData);

    // 2. CREAR PERFIL EN GOOGLE SHEETS (NUEVO) 👇
      // Esto asegura que cuando el usuario haga login, su fila ya exista.
      await this.userService.createInitialProfile(
        userRecord.uid,
        userRecord.email,
        userRecord.displayName,
        userRecord.phoneNumber
      );

      // Devolver info del usuario creado
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
      };
    } catch (error) {
      console.error(error);
    throw new BadRequestException(error.message || 'Error registrando usuario');
    }
  }

  async getUser(uid: string) {
    const userRecord = await admin.auth().getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
    };
  }

  // --- NUEVO MÉTODO ---
  async changePassword(uid: string, newPassword: string) {
    try {
      await admin.auth().updateUser(uid, {
        password: newPassword,
      });

      await admin.auth().revokeRefreshTokens(uid);
      return {
        success: true,
        message: 'Contraseña actualizada correctamente',
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        error.message || 'No se pudo actualizar la contraseña',
      );
    }
  }

  // 👇 NUEVO MÉTODO PARA LOGIN (SWAGGER HELPER)
  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      throw new BadRequestException('FIREBASE_API_KEY no configurada en el backend (.env)');
    }

    try {
      // Llamamos a la API REST de Firebase Auth
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new UnauthorizedException(data.error?.message || 'Credenciales inválidas');
      }

      // Retornamos el token que necesitas para Swagger
      return {
        idToken: data.idToken, // 👈 ESTE es el token para el botón "Authorize"
        email: data.email,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        localId: data.localId,
      };

    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Error al iniciar sesión: ' + error.message);
    }
  }
}
