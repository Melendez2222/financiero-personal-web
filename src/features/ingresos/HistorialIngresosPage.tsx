import { HistorialView } from '../gastos/HistorialView';
import { CartillaIngresos } from './components/CartillaIngresos';
import type { Tipo } from '../../types';

const TIPOS_INGRESO: Tipo[] = ['Ingreso'];

export function HistorialIngresosPage() {
  return (
    <HistorialView
      tiposPermitidos={TIPOS_INGRESO}
      mostrarTipo={false}
      textoNuevo="Registrar ingreso"
      accionNueva={<CartillaIngresos />}
    />
  );
}
