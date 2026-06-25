import { apiClient } from './client';
import { endpoints } from './endpoints';
import type {
  ActualizarPeriodoRequest,
  CrearPeriodoRequest,
  Periodo,
  ResumenPeriodo,
} from '../types';

export const periodosApi = {
  list: () => apiClient.get<Periodo[]>(endpoints.periodos).then((r) => r.data),
  get: (id: string) => apiClient.get<Periodo>(endpoints.periodo(id)).then((r) => r.data),
  create: (body: CrearPeriodoRequest) =>
    apiClient.post<Periodo>(endpoints.periodos, body).then((r) => r.data),
  update: (id: string, body: ActualizarPeriodoRequest) =>
    apiClient.put<Periodo>(endpoints.periodo(id), body).then((r) => r.data),
  iniciar: (id: string) =>
    apiClient.post<Periodo>(endpoints.periodoIniciar(id), {}).then((r) => r.data),
  resumen: (id: string) =>
    apiClient.get<ResumenPeriodo>(endpoints.periodoResumen(id)).then((r) => r.data),
};
