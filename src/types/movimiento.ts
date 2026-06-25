import type { Tipo } from './common';

/** Movimiento concreto (= "Transacción" del concepto). Alimenta los totales "actual". */
export interface Movimiento {
  id: string;
  periodoId: string;
  /** Categoría del catálogo. Null/ausente en gastos situacionales. */
  categoriaId?: string | null;
  /** Concepto libre para gastos situacionales (sin categoría). */
  concepto?: string | null;
  tipo: Tipo;
  /** Persona/usuario a quien se atribuye el movimiento. Opcional. */
  usuarioId?: string | null;
  fecha: string; // ISO yyyy-mm-dd
  monto: number; // siempre positivo; el signo se deriva del tipo en la UI
  nota: string;
}

export interface CrearMovimientoRequest {
  periodoId: string;
  categoriaId?: string | null;
  concepto?: string | null;
  tipo: Tipo;
  usuarioId?: string | null;
  fecha: string;
  monto: number;
  nota?: string;
}

export type ActualizarMovimientoRequest = Partial<Omit<CrearMovimientoRequest, 'periodoId'>>;

export interface FiltroMovimientos {
  periodoId?: string;
  tipo?: Tipo;
  categoriaId?: string;
  desde?: string;
  hasta?: string;
  q?: string;
}
