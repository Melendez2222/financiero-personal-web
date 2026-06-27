import type { Configuracion } from '../types';
import { CONFIG_DEFAULT } from '../types/configuracion';
import { MESES_ABBR } from '../types/common';

/** Carácter de signo menos "real" (U+2212), más legible que el guion. */
const MINUS = '−';

/**
 * True si la vigencia (fechas 'YYYY-MM-DD' día 1, o null = sin límite) cubre el mes dado.
 * Espejo de `PeriodoService.VigenteEn` del backend; compara strings de fecha lexicográficamente.
 */
export function vigenteEnMes(
  desde: string | null | undefined,
  hasta: string | null | undefined,
  anio: number,
  mes: number,
): boolean {
  const inicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
  return (!desde || desde <= inicio) && (!hasta || hasta >= inicio);
}

/** Etiqueta corta de vigencia: "Ago 2026 – Dic 2026", "desde Ago 2026", "hasta Jul 2026" o "" si siempre. */
export function formatVigencia(desde?: string | null, hasta?: string | null): string {
  if (!desde && !hasta) return '';
  const fmt = (s: string) => {
    const [y, m] = s.split('-');
    return `${MESES_ABBR[Number(m) - 1]} ${y}`;
  };
  if (desde && hasta) return `${fmt(desde)} – ${fmt(hasta)}`;
  if (desde) return `desde ${fmt(desde)}`;
  return `hasta ${fmt(hasta as string)}`;
}

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
