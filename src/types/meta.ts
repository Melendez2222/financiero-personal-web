import type { EstadoMeta } from './common';

export interface MetaAhorro {
  id: string;
  nombre: string;
  emoji: string;
  montoObjetivo: number;
  /** Aporte mensual programado. */
  aporteMensual: number;
  /** Total acumulado ahorrado hacia la meta. */
  montoAcumulado: number;
  /** Aportado en el mes activo (real). Opcional, lo calcula el backend/mock. */
  aporteMes?: number;
  fechaLimite?: string;
  estado: EstadoMeta;
  /** Switch de aportes activos. */
  activo: boolean;
}

export interface CrearMetaRequest {
  nombre: string;
  emoji: string;
  montoObjetivo: number;
  aporteMensual: number;
  fechaLimite?: string | null;
  estado?: EstadoMeta;
}

export type ActualizarMetaRequest = Partial<CrearMetaRequest & { activo: boolean }>;

export interface AporteMetaRequest {
  monto: number;
  fecha: string;
  descripcion?: string | null;
  periodoId?: string | null;
}

/** Aporte concreto (historial) de una meta. */
export interface AporteMeta {
  id: string;
  monto: number;
  fecha: string;
  descripcion?: string | null;
}
