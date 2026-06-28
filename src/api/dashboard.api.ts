import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { Tipo } from '../types';

export interface KpiValor {
  actual: number;
  deltaPct: number;
}

export interface DashboardData {
  kpis: {
    ingresos: KpiValor;
    fijos: KpiValor;
    necesarios: KpiValor;
    deudas: KpiValor;
    ahorros: KpiValor;
  };
  flujoMeses: { mes: string; ingresos: number; gastos: number }[];
  desglose: { categoria: string; tipo: Tipo; monto: number; pct: number }[];
  disponible: number;
  metas: { id: string; nombre: string; pct: number; actual: number; objetivo: number | null }[];
}

export const dashboardApi = {
  get: (periodoId?: string, usuarioId?: string) =>
    apiClient
      .get<DashboardData>(endpoints.dashboard, {
        params: {
          ...(periodoId ? { periodoId } : {}),
          ...(usuarioId ? { usuarioId } : {}),
        },
      })
      .then((r) => r.data),
};
