export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
}

export interface ActualizarPerfilRequest {
  nombre: string;
  apellidos: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  nombre: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}
