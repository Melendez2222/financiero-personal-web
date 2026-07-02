import type { CoberturaIngreso, Tipo } from './common';

/** Un gasto pendiente por pagar (queda > 0) en un mes concreto. Cuentas por pagar cross-mes. */
export interface PendienteGasto {
  periodoId: string;
  anio: number;
  /** Mes 1-12. */
  mes: number;
  fechaInicio: string; // ISO yyyy-mm-dd
  fechaFin: string; // ISO yyyy-mm-dd
  categoriaId: string;
  nombre: string;
  tipo: Tipo;
  emoji?: string | null;
  cobertura?: CoberturaIngreso | null;
  montoPendiente: number;
}
