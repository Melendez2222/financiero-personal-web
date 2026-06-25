import { createTheme } from '@mui/material/styles';
import { colors, radii, shadows } from './tokens';

/**
 * Tema MUI alineado al design handoff.
 * Breakpoints a 3 niveles: móvil (<720), tablet (720-1180), escritorio (>=1180).
 * Se usan las claves estándar de MUI con valores personalizados:
 *   up('sm') => >= 720 (tablet+),  up('md') => >= 1180 (escritorio).
 */
export const theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 720, md: 1180, lg: 1440, xl: 1920 },
  },
  palette: {
    mode: 'light',
    primary: { main: colors.accent, dark: colors.accentDark, contrastText: '#FFFFFF' },
    secondary: { main: colors.ahorro, contrastText: '#FFFFFF' },
    success: { main: colors.ingreso, contrastText: '#FFFFFF' },
    warning: { main: colors.necesario, contrastText: '#FFFFFF' },
    error: { main: colors.negative, contrastText: '#FFFFFF' },
    background: { default: colors.canvas, paper: colors.surface },
    text: { primary: colors.textPrimary, secondary: colors.textSecondary },
    divider: colors.border,
  },
  shape: { borderRadius: radii.input },
  typography: {
    fontFamily: 'Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: { fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontSize: 16, fontWeight: 700 },
    h6: { fontSize: 15, fontWeight: 700 },
    subtitle1: { fontSize: 14, fontWeight: 500 },
    subtitle2: { fontSize: 13, fontWeight: 500 },
    body1: { fontSize: 14 },
    body2: { fontSize: 13 },
    caption: { fontSize: 12, color: colors.textTertiary },
    button: { textTransform: 'none', fontWeight: 600 },
    overline: {
      fontSize: 11,
      fontWeight: 400,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.canvas },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        rounded: { borderRadius: radii.card },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: radii.card,
          boxShadow: shadows.card,
          backgroundColor: colors.surface,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radii.button, fontWeight: 600 },
        sizeMedium: { padding: '9px 16px' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radii.pill, fontWeight: 500 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: radii.input },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: radii.modal, boxShadow: shadows.modal },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: radii.pill, backgroundColor: colors.border },
        bar: { borderRadius: radii.pill },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: colors.textPrimary, fontSize: 12 },
      },
    },
  },
});
