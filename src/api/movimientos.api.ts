import { apiClient } from './client';
import { endpoints } from './endpoints';
import type {
  ActualizarMovimientoRequest,
  CrearMovimientoRequest,
  FiltroMovimientos,
  Movimiento,
} from '../types';

export const movimientosApi = {
  list: (filtro: FiltroMovimientos = {}) =>
    apiClient.get<Movimiento[]>(endpoints.movimientos, { params: filtro }).then((r) => r.data),
  get: (id: string) => apiClient.get<Movimiento>(endpoints.movimiento(id)).then((r) => r.data),
  create: (body: CrearMovimientoRequest) =>
    apiClient.post<Movimiento>(endpoints.movimientos, body).then((r) => r.data),
  update: (id: string, body: ActualizarMovimientoRequest) =>
    apiClient.put<Movimiento>(endpoints.movimiento(id), body).then((r) => r.data),
  remove: (id: string) => apiClient.delete<void>(endpoints.movimiento(id)).then((r) => r.data),
};
