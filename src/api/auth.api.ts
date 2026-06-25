import { apiClient } from './client';
import { endpoints } from './endpoints';
import type {
  ActualizarPerfilRequest,
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  Usuario,
} from '../types';

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<AuthResponse>(endpoints.auth.login, body).then((r) => r.data),
  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse>(endpoints.auth.register, body).then((r) => r.data),
  me: () => apiClient.get<Usuario>(endpoints.auth.me).then((r) => r.data),
  actualizarPerfil: (body: ActualizarPerfilRequest) =>
    apiClient.put<Usuario>(endpoints.auth.actualizarPerfil, body).then((r) => r.data),
  changePassword: (body: ChangePasswordRequest) =>
    apiClient.post<void>(endpoints.auth.changePassword, body).then((r) => r.data),
  resetPassword: (body: ResetPasswordRequest) =>
    apiClient.post<void>(endpoints.auth.resetPassword, body).then((r) => r.data),
};
