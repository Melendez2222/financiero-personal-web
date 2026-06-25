// Tipos base del dominio. Se evitan los `enum` de TS por la opción
// `erasableSyntaxOnly` del tsconfig; se usan uniones + arrays `as const`.

export const TIPOS = ['Ingreso', 'Fijo', 'Necesario', 'Deuda', 'Ahorro', 'Situacional'] as const;
export type Tipo = (typeof TIPOS)[number];

/** Tipos considerados "gasto" (salidas de dinero). */
export const TIPOS_GASTO = ['Fijo', 'Necesario', 'Deuda'] as const;

export const ESTADOS_META = [
  'NoIniciado',
  'Pendiente',
  'Iniciado',
  'Suspendido',
  'Finalizado',
] as const;
export type EstadoMeta = (typeof ESTADOS_META)[number];

export const ESTADOS_PERIODO = ['Borrador', 'Iniciado', 'Cerrado'] as const;
export type EstadoPeriodo = (typeof ESTADOS_PERIODO)[number];

/** Nombres de mes (índice 0 = Enero) para mostrar; el campo `mes` del periodo es 1-12. */
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

export const MESES_ABBR = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const;

/** Etiqueta legible de un tipo (singular, para chips/encabezados). */
export const TIPO_LABEL: Record<Tipo, string> = {
  Ingreso: 'Ingreso',
  Fijo: 'Gasto fijo',
  Necesario: 'Gasto necesario',
  Deuda: 'Deuda',
  Ahorro: 'Ahorro',
  Situacional: 'Situacional',
};

/** Etiqueta plural (para títulos de sección/grupo del catálogo). */
export const TIPO_LABEL_PLURAL: Record<Tipo, string> = {
  Ingreso: 'Ingresos',
  Fijo: 'Gastos fijos',
  Necesario: 'Gastos necesarios',
  Deuda: 'Deudas',
  Ahorro: 'Ahorros',
  Situacional: 'Gastos situacionales',
};

export interface ApiError {
  code: string;
  message: string;
}
