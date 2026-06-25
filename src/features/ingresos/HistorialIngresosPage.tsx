import { HistorialView } from '../gastos/HistorialView';
import type { Tipo } from '../../types';

const TIPOS_INGRESO: Tipo[] = ['Ingreso'];

export function HistorialIngresosPage() {
  return <HistorialView tiposPermitidos={TIPOS_INGRESO} mostrarTipo={false} textoNuevo="Nuevo ingreso" />;
}
