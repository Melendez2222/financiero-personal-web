/** Deuda con su saldo calculado (monto total − pagos). */
export interface Deuda {
  id: string;
  nombre: string;
  emoji?: string | null;
  fechaVencimiento?: string | null;
  cuotaMensual: number;
  cuotasRestantes?: number | null;
  montoTotal?: number | null;
  totalPagado: number;
  saldoRestante?: number | null;
  pct?: number | null;
  activo: boolean;
}
