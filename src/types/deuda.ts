/** Deuda con su saldo calculado (monto total − pagos). */
export interface Deuda {
  id: string;
  nombre: string;
  emoji?: string | null;
  fechaVencimiento?: string | null;
  cuotaMensual: number;
  cuotasRestantes?: number | null;
  montoTotal?: number | null;
  /** Solo deudas con interés: capital que reduce la deuda por cada cuota regular. Null = sin interés. */
  capitalPorCuota?: number | null;
  /** Capital efectivamente abonado (lo que bajó la deuda). */
  totalPagado: number;
  /** Interés acumulado pagado (parte de los abonos que no redujo el capital). */
  totalInteres: number;
  saldoRestante?: number | null;
  pct?: number | null;
  activo: boolean;
}
