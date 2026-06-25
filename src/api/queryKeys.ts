import type { FiltroMovimientos, Tipo } from '../types';

/** Claves de caché de TanStack Query, centralizadas. */
export const qk = {
  authMe: ['auth', 'me'] as const,
  categorias: (tipo?: Tipo) => (tipo ? (['categorias', tipo] as const) : (['categorias'] as const)),
  periodos: ['periodos'] as const,
  periodo: (id: string) => ['periodos', id] as const,
  resumen: (id: string) => ['periodos', id, 'resumen'] as const,
  movimientos: (filtro: FiltroMovimientos = {}) => ['movimientos', filtro] as const,
  metas: (periodoId?: string) => (periodoId ? (['metas', periodoId] as const) : (['metas'] as const)),
  configuracion: ['configuracion'] as const,
  dashboard: (periodoId?: string) => ['dashboard', periodoId] as const,
};
