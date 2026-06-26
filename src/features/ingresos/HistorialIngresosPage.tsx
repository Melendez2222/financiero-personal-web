import { Box } from '@mui/material';
import { HistorialView } from '../gastos/HistorialView';
import { CartillaIngresos } from './components/CartillaIngresos';
import type { Tipo } from '../../types';

const TIPOS_INGRESO: Tipo[] = ['Ingreso'];

export function HistorialIngresosPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CartillaIngresos />
      <HistorialView tiposPermitidos={TIPOS_INGRESO} mostrarTipo={false} textoNuevo="Nuevo ingreso" />
    </Box>
  );
}
