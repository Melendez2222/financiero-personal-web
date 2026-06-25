import axios from 'axios';
import { authStorage } from '../lib/authStorage';

/** Cliente axios único. baseURL desde la variable de entorno del build. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el token JWT a cada petición.
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ante un 401 (sesión inválida) limpia y redirige a login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && window.location.pathname !== '/login') {
      authStorage.clear();
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);
