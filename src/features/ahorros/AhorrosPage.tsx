import { useState } from 'react';
import { Box, Button, Card, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMetas } from '../../api/hooks/useMetas';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useSettings } from '../../context/SettingsContext';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { MetaCard } from './components/MetaCard';
import { MetaDialog } from './components/MetaDialog';
import { colors, gradients } from '../../theme/tokens';

export function AhorrosPage() {
  const { periodoId } = usePeriodoActivo();
  const { data: metas = [], isLoading } = useMetas(periodoId);
  const { money } = useSettings();
  const [dialogo, setDialogo] = useState(false);

  if (isLoading) return <Loading />;

  const totalAcumulado = metas.reduce((s, m) => s + m.montoAcumulado, 0);
  // El % general solo considera metas CON objetivo (las abiertas no tienen meta que completar).
  const conObjetivo = metas.filter((m) => m.montoObjetivo != null);
  const totalObjetivo = conObjetivo.reduce((s, m) => s + (m.montoObjetivo ?? 0), 0);
  const acumuladoConObjetivo = conObjetivo.reduce((s, m) => s + m.montoAcumulado, 0);
  const aporteMes = metas.reduce((s, m) => s + (m.aporteMes ?? 0), 0);
  const aportePlan = metas.filter((m) => m.activo).reduce((s, m) => s + m.aporteMensual, 0);
  const overall = totalObjetivo ? Math.min(100, Math.round((acumuladoConObjetivo / totalObjetivo) * 100)) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card sx={{ background: gradients.ahorro, color: '#fff', p: 3 }}>
          <Box sx={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
            Ahorro acumulado
          </Box>
          <Box sx={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>{money(totalAcumulado)}</Box>
          <Box sx={{ fontSize: 13, opacity: 0.9, mb: 1.5 }}>
            de {money(totalObjetivo)} en metas · {overall}% completado
          </Box>
          <LinearProgress
            variant="determinate"
            value={overall}
            sx={{ height: 8, bgcolor: 'rgba(255,255,255,.28)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }}
          />
        </Card>

        <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: colors.ingresoSoft, display: 'grid', placeItems: 'center', fontSize: 22 }}>
              💰
            </Box>
            <Box>
              <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>Aporte de este mes</Box>
              <Box sx={{ fontSize: 22, fontWeight: 700 }}>{money(aporteMes)}</Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: colors.deudaSoft, display: 'grid', placeItems: 'center', fontSize: 22 }}>
              🎯
            </Box>
            <Box>
              <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>Aporte programado mensual</Box>
              <Box sx={{ fontSize: 22, fontWeight: 700 }}>{money(aportePlan)}</Box>
            </Box>
          </Box>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ fontSize: 15, fontWeight: 700 }}>Tus metas</Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogo(true)}>
          Nueva meta
        </Button>
      </Box>

      {metas.length === 0 ? (
        <EmptyState>Aún no tienes metas. Crea la primera.</EmptyState>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {metas.map((m) => (
            <MetaCard key={m.id} meta={m} />
          ))}
        </Box>
      )}

      {dialogo && <MetaDialog open={dialogo} onClose={() => setDialogo(false)} />}
    </Box>
  );
}
