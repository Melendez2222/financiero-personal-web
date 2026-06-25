import type { Configuracion } from '../types';
import { CONFIG_DEFAULT } from '../types/configuracion';

/** Carácter de signo menos "real" (U+2212), más legible que el guion. */
const MINUS = '−';

/** Número con formato local (sin símbolo). Ej: 1234.5 -> "1,234.50" (es-PE). */
export function formatNumber(value: number, config: Configuracion = CONFIG_DEFAULT): string {
  const n = Number.isFinite(value) ? value : 0;
  return Math.abs(n).toLocaleString(config.locale, {
    minimumFractionDigits: config.decimales,
    maximumFractionDigits: config.decimales,
  });
}

/** Monto con símbolo. Ej: -50 -> "− S/ 50.00", 2100 -> "S/ 2,100.00". */
export function formatMoney(value: number, config: Configuracion = CONFIG_DEFAULT): string {
  const n = Number.isFinite(value) ? value : 0;
  const prefix = n < 0 ? `${MINUS} ` : '';
  return `${prefix}${config.simbolo} ${formatNumber(n, config)}`;
}

/**
 * Monto con signo explícito (para el libro de movimientos).
 * positivo=true => "+ S/ ...", false => "− S/ ...".
 */
export function formatSigned(
  value: number,
  positivo: boolean,
  config: Configuracion = CONFIG_DEFAULT,
): string {
  const sign = positivo ? '+' : MINUS;
  return `${sign} ${config.simbolo} ${formatNumber(value, config)}`;
}

/** Porcentaje entero. Ej: 0.42 (ratio) no; recibe 0..100 ya calculado -> "42%". */
export function formatPercent(pct: number): string {
  const n = Number.isFinite(pct) ? pct : 0;
  return `${Math.round(n)}%`;
}
