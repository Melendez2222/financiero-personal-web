import type { CoberturaIngreso, EstadoDeuda, Tipo, TipoDeuda } from './common';

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
  /** Solo ingresos: persona por defecto a la que se atribuye al registrar (ej. de quién es la quincena). */
  usuarioId?: string | null;
  /** Ingresos/Fijos/Necesarios: bolsa que cubre el movimiento (quincena/fin de mes). Null = sin asignar. */
  cobertura?: CoberturaIngreso | null;
  /** Vigencia: primer mes en que aplica (fecha 'YYYY-MM-DD' día 1). Null = sin límite ("siempre"). */
  vigenciaDesde?: string | null;
  /** Vigencia: último mes en que aplica (fecha 'YYYY-MM-DD' día 1). Null = sin límite ("siempre"). */
  vigenciaHasta?: string | null;
  /** Solo deudas: estado del ciclo de vida (manual). Solo "Iniciada" cuenta en el mes. */
  estadoDeuda: EstadoDeuda;
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
  usuarioId?: string | null;
  cobertura?: CoberturaIngreso | null;
  vigenciaDesde?: string | null;
  vigenciaHasta?: string | null;
  estadoDeuda?: EstadoDeuda;
  activo?: boolean;
}

export type ActualizarCategoriaRequest = Partial<Omit<CrearCategoriaRequest, 'tipo'>>;
