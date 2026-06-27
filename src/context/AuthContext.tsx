import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { authStorage } from '../lib/authStorage';
import { EMAIL_PRINCIPAL } from '../lib/constants';
import type { LoginRequest, RegisterRequest, Usuario } from '../types';

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  /** True si el usuario en sesión es el principal (Cristhian): ve acciones de administración del hogar. */
  esPrincipal: boolean;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
  /** Actualiza el usuario en sesión (cache local + storage) tras editar el perfil. */
  actualizarUsuario: (user: Usuario) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [usuario, setUsuario] = useState<Usuario | null>(() => authStorage.getUser());

  const aplicar = useCallback((token: string, user: Usuario) => {
    authStorage.setToken(token);
    authStorage.setUser(user);
    setUsuario(user);
  }, []);

  const login = useCallback(
    async (body: LoginRequest) => {
      const res = await authApi.login(body);
      aplicar(res.token, res.usuario);
    },
    [aplicar],
  );

  const register = useCallback(
    async (body: RegisterRequest) => {
      const res = await authApi.register(body);
      aplicar(res.token, res.usuario);
    },
    [aplicar],
  );

  const logout = useCallback(() => {
    authStorage.clear();
    setUsuario(null);
    qc.clear();
  }, [qc]);

  const actualizarUsuario = useCallback((user: Usuario) => {
    authStorage.setUser(user);
    setUsuario(user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isAuthenticated: !!usuario && !!authStorage.getToken(),
      esPrincipal: usuario?.email === EMAIL_PRINCIPAL,
      login,
      register,
      logout,
      actualizarUsuario,
    }),
    [usuario, login, register, logout, actualizarUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}
