export interface Configuracion {
  /** Código de moneda ISO, p.ej. 'PEN'. */
  moneda: string;
  /** Símbolo a mostrar, p.ej. 'S/'. */
  simbolo: string;
  /** Locale para formateo numérico, p.ej. 'es-PE'. */
  locale: string;
  /** Decimales a mostrar. */
  decimales: number;
}

export const CONFIG_DEFAULT: Configuracion = {
  moneda: 'PEN',
  simbolo: 'S/',
  locale: 'es-PE',
  decimales: 2,
};
