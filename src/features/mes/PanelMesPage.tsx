import { Box } from '@mui/material';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useResumenPeriodo } from '../../api/hooks/usePeriodos';
import { MESES } from '../../types/common';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { FlujoResumen } from './components/FlujoResumen';
import { PresupuestoVsActual } from './components/PresupuestoVsActual';
import { SeccionLineas } from './components/SeccionLineas';
import { SituacionalesCard } from './components/SituacionalesCard';

export function PanelMesPage() {
  const { periodoId, periodoActivo } = usePeriodoActivo();
  const { data: resumen, isLoading } = useResumenPeriodo(periodoId);

  const titulo = periodoActivo ? `${MESES[periodoActivo.mes - 1]} ${periodoActivo.anio}` : '';

  if (!periodoId) {
    return <EmptyState>No hay meses todavía. Crea uno en Configuración.</EmptyState>;
  }
  if (isLoading || !resumen) return <Loading />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <FlujoResumen flujo={resumen.flujo} titulo={titulo} />
        <PresupuestoVsActual secciones={resumen.secciones} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {resumen.secciones.map((s) => (
          <SeccionLineas key={s.tipo} seccion={s} />
        ))}
      </Box>

      {resumen.situacionales.length > 0 && (
        <SituacionalesCard situacionales={resumen.situacionales} />
      )}
    </Box>
  );
}
