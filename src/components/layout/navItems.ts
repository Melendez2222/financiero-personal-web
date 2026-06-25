import GridViewIcon from '@mui/icons-material/GridViewOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import SavingsIcon from '@mui/icons-material/SavingsOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavItem {
  to: string;
  label: string;
  subtitle: string;
  icon: SvgIconComponent;
  end?: boolean;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Resumen general', subtitle: 'Tu panorama financiero', icon: GridViewIcon, end: true },
  { to: '/mes', label: 'Panel del mes', subtitle: 'Presupuesto vs. actual', icon: CalendarMonthIcon },
  { to: '/ahorros', label: 'Ahorros y metas', subtitle: 'Tus objetivos de ahorro', icon: SavingsIcon },
  { to: '/deudas', label: 'Deudas', subtitle: 'Saldos y abonos', icon: CreditCardIcon },
  { to: '/proyeccion', label: 'Proyección', subtitle: 'Guía a futuro', icon: TrendingUpIcon },
  { to: '/simulador', label: 'Simulador', subtitle: 'Simula un mes', icon: TuneIcon },
  { to: '/gastos', label: 'Historial de gastos', subtitle: 'Libro de movimientos', icon: ReceiptLongIcon },
  { to: '/ingresos', label: 'Historial de ingresos', subtitle: 'Tus entradas de dinero', icon: PaymentsIcon },
  { to: '/configuracion', label: 'Configuración', subtitle: 'Catálogo, meses y moneda', icon: SettingsIcon },
  { to: '/perfil', label: 'Perfil', subtitle: 'Tus datos y contraseña', icon: PersonOutlineIcon },
];

/** Encuentra el ítem de navegación que corresponde a una ruta. */
export function rutaActual(pathname: string): NavItem {
  const noRoot = navItems.filter((i) => i.to !== '/');
  const match = noRoot.find((i) => pathname === i.to || pathname.startsWith(`${i.to}/`));
  return match ?? navItems[0];
}
