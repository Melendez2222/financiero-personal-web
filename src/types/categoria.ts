import type { Tipo, TipoDeuda } from './common';

export interface Categoria {
  id: string;
  nombre: string;
  tipo: Tipo;
  /** Presupuesto/cuota mensual en la moneda base. Fuente única (global). */
  presupuesto: number;
  emoji?: string;
  /** Día de vencimiento dentro del mes, p.ej. "15". Opcional. */
  fechaVencimiento?: string;
  /** Solo deudas: nº de cuotas pendientes. Permite proyectar cuándo se salda. */
  cuotasRestantes?: number | null;
  /** Solo deudas: monto total. Saldo restante = total − pagos. */
  montoTotal?: number | null;
  /** Solo deudas con interés: monto de cada cuota que reduce el capital (el resto es interés). Null = sin interés. */
  capitalPorCuota?: number | null;
  /** Solo deudas: etiqueta del tipo (préstamo / línea de crédito). */
  tipoDeuda?: TipoDeuda | null;
  /** Activador: si está activa, se aplica a los periodos que se inicien de aquí en adelante. */
  activo: boolean;
  /** Orden de presentación dentro de su grupo. */
  orden: number;
}

export interface CrearCategoriaRequest {
  nombre: string;
  tipo: Tipo;
  presupuesto: number;
  emoji?: string;
  fechaVencimiento?: string;
  cuotasRestantes?: number | null;
  montoTotal?: number | null;
  capitalPorCuota?: number | null;
  tipoDeuda?: TipoDeuda | null;
  activo?: boolean;
}

export type ActualizarCategoriaRequest = Partial<Omit<CrearCategoriaRequest, 'tipo'>>;
