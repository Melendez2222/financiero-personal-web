import { HistorialView } from './HistorialView';
import { CartillaPendientes } from './components/CartillaPendientes';
import type { Tipo } from '../../types';

const TIPOS_GASTO: Tipo[] = ['Fijo', 'Necesario', 'Deuda', 'Ahorro', 'Situacional'];

export function HistorialGastosPage() {
  return (
    <HistorialView
      tiposPermitidos={TIPOS_GASTO}
      mostrarTipo
      textoNuevo="Nuevo movimiento"
      accionExtra={<CartillaPendientes />}
    />
  );
}
