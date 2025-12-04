export class RegisterUserDto {
  uid?: string;                // opcional
  email: string;               // obligatorio
  password: string;            // obligatorio, mínimo 6 caracteres
  displayName?: string;        // opcional
  phoneNumber?: string;        // opcional, formato E.164
  photoURL?: string;           // opcional
  emailVerified?: boolean;     // opcional, default false
  disabled?: boolean;          // opcional, default false
}
