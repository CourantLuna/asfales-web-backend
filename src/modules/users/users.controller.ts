import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { admin } from '../../firebase/firebase-admin';

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

  /**
   * Obtener todos los usuarios de Firebase
   * Soporta paginación con maxResults y pageToken
   */
  @UseGuards(FirebaseAuthGuard)
  @Get()
  async getAllUsers(
    @Query('maxResults') maxResults?: string,
    @Query('pageToken') pageToken?: string,
    @Query('search') search?: string
  ) {
    try {
      const limit = maxResults ? parseInt(maxResults, 10) : 1000;
      
      // Listar usuarios de Firebase
      const listUsersResult = await admin.auth().listUsers(limit, pageToken);

      let users = listUsersResult.users.map(userRecord => ({
        uid: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || '',
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
        },
        customClaims: userRecord.customClaims || {},
        phoneNumber: userRecord.phoneNumber || ''
      }));

      // Filtrar por búsqueda si se proporciona
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(user => 
          user.email.toLowerCase().includes(searchLower) ||
          user.displayName.toLowerCase().includes(searchLower) ||
          user.uid.toLowerCase().includes(searchLower)
        );
      }

      return {
        users,
        pageToken: listUsersResult.pageToken,
        totalCount: users.length
      };
    } catch (error) {
      console.error('Error obteniendo usuarios de Firebase:', error);
      throw error;
    }
  }

  /**
   * Buscar usuario específico por UID, email o phone
   */
  @UseGuards(FirebaseAuthGuard)
  @Get('search')
  async searchUser(
    @Query('uid') uid?: string,
    @Query('email') email?: string,
    @Query('phoneNumber') phoneNumber?: string
  ) {
    try {
      let userRecord;

      if (uid) {
        userRecord = await admin.auth().getUser(uid);
      } else if (email) {
        userRecord = await admin.auth().getUserByEmail(email);
      } else if (phoneNumber) {
        userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
      } else {
        return { error: 'Debes proporcionar uid, email o phoneNumber' };
      }

      return {
        uid: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || '',
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
        },
        customClaims: userRecord.customClaims || {},
        phoneNumber: userRecord.phoneNumber || ''
      };
    } catch (error) {
      console.error('Error buscando usuario:', error);
      throw error;
    }
  }
}
