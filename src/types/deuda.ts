import type { EstadoDeuda, TipoDeuda } from './common';

/** Deuda con su saldo calculado (monto total − pagos). */
export interface Deuda {
  id: string;
  nombre: string;
  emoji?: string | null;
  fechaVencimiento?: string | null;
  cuotaMensual: number;
  /** Plazo total del préstamo (nº de cuotas). Null = sin plazo fijo. */
  cuotasRestantes?: number | null;
  montoTotal?: number | null;
  /** Solo deudas con interés: capital que reduce la deuda por cada cuota regular. Null = sin interés. */
  capitalPorCuota?: number | null;
  /** Etiqueta del tipo de deuda (préstamo / línea de crédito). */
  tipoDeuda?: TipoDeuda | null;
  /** Capital efectivamente abonado (lo que bajó la deuda). */
  totalPagado: number;
  /** Interés acumulado pagado (parte de los abonos que no redujo el capital). */
  totalInteres: number;
  /** Nº de cuotas regulares pagadas (los abonos extra a capital no cuentan). */
  cuotasPagadas: number;
  saldoRestante?: number | null;
  pct?: number | null;
  activo: boolean;
  /** Estado del ciclo de vida (manual). Solo "Iniciada" cuenta en el panel del mes. */
  estadoDeuda: EstadoDeuda;
}
