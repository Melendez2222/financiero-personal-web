import type { EstadoPeriodo } from './common';

export interface Periodo {
  id: string;
  anio: number;
  /** Mes 1-12. */
  mes: number;
  fechaInicio: string; // ISO yyyy-mm-dd
  fechaFin: string; // ISO yyyy-mm-dd
  moneda: string; // 'PEN'
  balanceInicial: number;
  estado: EstadoPeriodo;
}

/**
 * Snapshot de las categorías incluidas en un periodo al momento de iniciarlo.
 * Garantiza que desactivar una categoría luego NO la quite de un mes ya iniciado.
 */
export interface PeriodoCategoria {
  id: string;
  periodoId: string;
  categoriaId: string;
  montoPresupuestado: number;
}

export interface CrearPeriodoRequest {
  anio: number;
  mes: number;
  balanceInicial?: number;
  moneda?: string;
  /** Si true, hereda el balance final del periodo anterior como balance inicial. */
  heredarBalance?: boolean;
}

export type ActualizarPeriodoRequest = Partial<
  Pick<Periodo, 'balanceInicial' | 'moneda' | 'estado'>
>;
