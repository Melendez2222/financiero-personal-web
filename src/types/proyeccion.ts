/** Un mes proyectado en la guía, con su desglose y los hitos que ocurren ese mes. */
export interface GuiaMes {
  anio: number;
  mes: number;
  etiqueta: string;
  ingresos: number;
  fijos: number;
  necesarios: number;
  deudas: number;
  ahorro: number;
  neto: number;
  saldoAcumulado: number;
  hitos: string[];
}

export interface Guia {
  desdeAnio: number;
  desdeMes: number;
  saldoInicial: number;
  meses: GuiaMes[];
}
