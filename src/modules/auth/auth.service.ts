import { Injectable, BadRequestException } from '@nestjs/common';
import { admin } from '../../firebase/firebase-admin';
import { RegisterUserDto } from '../../dto/register-user.dto';

@Injectable()
export class AuthService {
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
}
