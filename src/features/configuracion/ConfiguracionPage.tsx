import { Box } from '@mui/material';
import { useCategorias } from '../../api/hooks/useCategorias';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../../components/ui/Loading';
import { TIPOS } from '../../types/common';
import { colors } from '../../theme/tokens';
import { MonedaCard } from './components/MonedaCard';
import { PeriodoManager } from './components/PeriodoManager';
import { CatalogoGrupo } from './components/CatalogoGrupo';

export function ConfiguracionPage() {
  const { data: categorias = [], isLoading } = useCategorias();
  const { esPrincipal } = useAuth();

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: esPrincipal ? '1fr 1fr' : '1fr' },
          gap: 2,
        }}
      >
        <MonedaCard />
        {esPrincipal && <PeriodoManager />}
      </Box>

      <Box sx={{ fontSize: 13, color: colors.textSecondary, mt: 1 }}>
        Define aquí tus categorías. El registro de movimientos y el panel del mes se alimentan de este
        catálogo. El interruptor activa/desactiva la categoría para los <strong>meses nuevos</strong>;
        un mes ya iniciado conserva las suyas.
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {TIPOS.filter((tipo) => tipo !== 'Deuda' && tipo !== 'Situacional').map((tipo) => (
          <CatalogoGrupo
            key={tipo}
            tipo={tipo}
            categorias={categorias.filter((c) => c.tipo === tipo).sort((a, b) => a.orden - b.orden)}
          />
        ))}
      </Box>
    </Box>
  );
}
