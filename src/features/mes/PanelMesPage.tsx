import { useMemo, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useResumenPeriodo } from '../../api/hooks/usePeriodos';
import { MESES } from '../../types/common';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PersonaSelect } from '../../components/ui/PersonaSelect';
import { FlujoResumen } from './components/FlujoResumen';
import { PresupuestoVsActual } from './components/PresupuestoVsActual';
import { SeccionLineas } from './components/SeccionLineas';
import { SituacionalesCard } from './components/SituacionalesCard';
import { CartillaIngresos } from '../ingresos/components/CartillaIngresos';
import type { SeccionResumen } from '../../types';

type Filtro = 'pendiente' | 'cumplido' | 'global';

export function PanelMesPage() {
  const { periodoId, periodoActivo } = usePeriodoActivo();
  const [filtro, setFiltro] = useState<Filtro>('pendiente');
  const [persona, setPersona] = useState('');
  const { data: resumen, isLoading } = useResumenPeriodo(periodoId, persona || undefined);

  const titulo = periodoActivo ? `${MESES[periodoActivo.mes - 1]} ${periodoActivo.anio}` : '';

  // Filtra las líneas de cada sección y recomputa sus totales para que el encabezado cuadre.
  const seccionesVista = useMemo<SeccionResumen[]>(() => {
    if (!resumen) return [];
    const secs = resumen.secciones.map((s) => {
      const lineas =
        filtro === 'global'
          ? s.lineas
          : s.lineas.filter((l) => (filtro === 'pendiente' ? l.queda > 0.005 : l.queda <= 0.005));
      return {
        ...s,
        lineas,
        totalPresupuestado: lineas.reduce((a, l) => a + l.montoPresupuestado, 0),
        totalActual: lineas.reduce((a, l) => a + l.actual, 0),
      };
    });
    return filtro === 'global' ? secs : secs.filter((s) => s.lineas.length > 0);
  }, [resumen, filtro]);

  if (!periodoId) {
    return <EmptyState>No hay meses todavía. Crea uno en Configuración.</EmptyState>;
  }
  if (isLoading || !resumen) return <Loading />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filtro}
            onChange={(_, v: Filtro | null) => v && setFiltro(v)}
          >
            <ToggleButton value="pendiente">Pendiente</ToggleButton>
            <ToggleButton value="cumplido">Cumplido</ToggleButton>
            <ToggleButton value="global">Global</ToggleButton>
          </ToggleButtonGroup>
          <PersonaSelect value={persona} onChange={setPersona} />
        </Box>
        <CartillaIngresos />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <FlujoResumen flujo={resumen.flujo} titulo={titulo} />
        <PresupuestoVsActual secciones={resumen.secciones} />
      </Box>

      {seccionesVista.length === 0 || seccionesVista.every((s) => s.lineas.length === 0) ? (
        <EmptyState>
          {persona
            ? 'Esta persona no tiene categorías asignadas este mes. Ponle la “persona por defecto” en el catálogo (Configuración).'
            : filtro === 'pendiente'
              ? '🎉 Nada pendiente: todo lo del mes está pagado/recibido.'
              : filtro === 'cumplido'
                ? 'Aún nada cumplido este mes.'
                : 'Aún no hay nada este mes.'}
        </EmptyState>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {seccionesVista.map((s) => (
            <SeccionLineas key={s.tipo} seccion={s} modoPendiente={filtro === 'pendiente'} />
          ))}
        </Box>
      )}

      {filtro !== 'pendiente' && resumen.situacionales.length > 0 && (
        <SituacionalesCard situacionales={resumen.situacionales} />
      )}
    </Box>
  );
}
