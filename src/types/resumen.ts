import type { Tipo } from './common';
import type { Periodo } from './periodo';

/** Una línea del panel del mes: categoría con su presupuesto y su actual. */
export interface LineaResumen {
  categoriaId: string;
  nombre: string;
  tipo: Tipo;
  montoPresupuestado: number;
  actual: number;
  /** montoPresupuestado - actual. */
  queda: number;
  fechaVencimiento?: string;
  emoji?: string;
}

/** Agrupación de líneas por tipo (Ingresos, Fijos, Necesarios, Deudas, Ahorros). */
export interface SeccionResumen {
  tipo: Tipo;
  lineas: LineaResumen[];
  totalPresupuestado: number;
  totalActual: number;
}

/** Totales de flujo de dinero del mes. */
export interface FlujoResumen {
  balanceInicial: number;
  ingresosPresupuesto: number;
  ingresosActual: number;
  fijosPresupuesto: number;
  fijosActual: number;
  necesariosPresupuesto: number;
  necesariosActual: number;
  deudasPresupuesto: number;
  deudasActual: number;
  ahorrosPresupuesto: number;
  ahorrosActual: number;
  /** Total de gastos situacionales (imprevistos sin presupuesto). */
  situacionalesActual: number;
  /** Presupuesto total de gastos - gastos reales acumulados (incluye situacionales). */
  totalRestante: number;
}

/** Gasto situacional (imprevisto sin categoría) del periodo. */
export interface SituacionalResumen {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
}

/** Respuesta de GET /periodos/{id}/resumen — alimenta el Panel del mes. */
export interface ResumenPeriodo {
  periodo: Periodo;
  secciones: SeccionResumen[];
  situacionales: SituacionalResumen[];
  flujo: FlujoResumen;
  /** Dinero realmente libre = (balance + ingresos recibidos − todo lo ya pagado) − lo que aún falta pagar (fijos+deudas+ahorros). */
  disponible: number;
}
