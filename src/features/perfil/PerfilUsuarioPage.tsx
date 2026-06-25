import { Box } from '@mui/material';
import { DatosPersonalesCard } from './components/DatosPersonalesCard';
import { SeguridadCard } from './components/SeguridadCard';

export function PerfilUsuarioPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720 }}>
      <DatosPersonalesCard />
      <SeguridadCard />
    </Box>
  );
}
