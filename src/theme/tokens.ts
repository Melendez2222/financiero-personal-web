import type { Tipo } from '../types/common';

/** Paleta cruda del design handoff. */
export const colors = {
  canvas: '#F6F6F9',
  surface: '#FFFFFF',
  textPrimary: '#2E2A32',
  textSecondary: '#8A8694',
  textTertiary: '#A6A2AE',
  textDisabled: '#CFCBD6',
  border: '#ECECF1',
  borderLight: '#F0F0F4',
  borderStrong: '#E2E2E8',
  borderSoft: '#F6F6F9',

  accent: '#E26D8A',
  accentDark: '#C9577A',

  ingreso: '#3FA678',
  ingresoSoft: '#E1F2E9',
  fijo: '#E26D8A',
  fijoSoft: '#FBE6EC',
  necesario: '#E07E54',
  necesarioSoft: '#FBE7DD',
  deuda: '#D69A2E',
  deudaSoft: '#FBEFD9',
  ahorro: '#7C83C9',
  ahorroSoft: '#EAEBF7',
  situacional: '#5B8DEF',
  situacionalSoft: '#E6EEFC',

  positive: '#2E8B5E',
  positiveSoft: '#E1F2E9',
  negative: '#C9577A',
  negativeSoft: '#FBE6EC',
} as const;

/** Par de colores (acento + suave) por tipo de movimiento. */
export const tipoColors: Record<Tipo, { main: string; soft: string }> = {
  Ingreso: { main: colors.ingreso, soft: colors.ingresoSoft },
  Fijo: { main: colors.fijo, soft: colors.fijoSoft },
  Necesario: { main: colors.necesario, soft: colors.necesarioSoft },
  Deuda: { main: colors.deuda, soft: colors.deudaSoft },
  Ahorro: { main: colors.ahorro, soft: colors.ahorroSoft },
  Situacional: { main: colors.situacional, soft: colors.situacionalSoft },
};

export const gradients = {
  accent: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
  ahorro: `linear-gradient(135deg, ${colors.ahorro} 0%, #5C63A8 100%)`,
} as const;

export const shadows = {
  card: '0 1px 3px rgba(46,42,50,.07)',
  modal: '0 20px 60px rgba(46,42,50,.25)',
  dropdown: '0 8px 28px rgba(46,42,50,.14)',
} as const;

export const radii = {
  card: 16,
  modal: 18,
  input: 11,
  button: 10,
  pill: 20,
  badge: 10,
} as const;

export const layout = {
  sidebarWidth: 248,
  topbarHeight: 64,
  contentMaxWidth: 1320,
} as const;
