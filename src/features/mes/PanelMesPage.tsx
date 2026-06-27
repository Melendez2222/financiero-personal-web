import { useMemo, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useResumenPeriodo } from '../../api/hooks/usePeriodos';
import { useCategorias } from '../../api/hooks/useCategorias';
import { MESES } from '../../types/common';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PersonaSelect } from '../../components/ui/PersonaSelect';
import { FlujoResumen } from './components/FlujoResumen';
import { PresupuestoVsActual } from './components/PresupuestoVsActual';
import { SeccionLineas } from './components/SeccionLineas';
import { SituacionalesCard } from './components/SituacionalesCard';
import { FaseActualCard } from './components/FaseActualCard';
import { CartillaIngresos } from '../ingresos/components/CartillaIngresos';
import type { CoberturaIngreso, ResumenPeriodo, SeccionResumen } from '../../types';

type Filtro = 'fase' | 'pendiente' | 'cumplido' | 'global';

export function PanelMesPage() {
  const { periodos, periodoId, periodoActivo } = usePeriodoActivo();
  // Por defecto el Panel arranca en la "fase" del mes según la fecha de hoy.
  const [filtro, setFiltro] = useState<Filtro>('fase');
  const [verActivos, setVerActivos] = useState(true);
  const [persona, setPersona] = useState('');
  const { data: categorias = [] } = useCategorias();

  // La vista 'fase' es flujo del hogar → ignora el filtro de persona.
  const usuarioFiltro = filtro === 'fase' ? undefined : persona || undefined;
  const { data: resumen, isLoading } = useResumenPeriodo(periodoId, usuarioFiltro);

  // Fase según hoy: días 1–15 = quincena; 16+ = fin de mes.
  const faseActual: CoberturaIngreso = new Date().getDate() <= 15 ? 'Quincena' : 'FinDeMes';

  // Mes anterior (para el sueldo de fin de mes que cubre la fase quincena). periodos viene desc.
  const prevPeriodo = useMemo(() => {
    if (!periodoActivo) return undefined;
    return periodos.find(
      (p) => p.anio < periodoActivo.anio || (p.anio === periodoActivo.anio && p.mes < periodoActivo.mes),
    );
  }, [periodos, periodoActivo]);
  const { data: prevResumen } = useResumenPeriodo(
    filtro === 'fase' && faseActual === 'Quincena' ? prevPeriodo?.id : undefined,
  );

  const catCobertura = useMemo(
    () => new Map(categorias.map((c) => [c.id, c.cobertura ?? null])),
    [categorias],
  );

  const titulo = periodoActivo ? `${MESES[periodoActivo.mes - 1]} ${periodoActivo.anio}` : '';

  // Suma el ingreso ACTUAL recibido de una bolsa (quincena/fin de mes) en un resumen dado.
  const ingresoBolsa = (res: ResumenPeriodo | undefined, bolsa: CoberturaIngreso): number => {
    const ing = res?.secciones.find((s) => s.tipo === 'Ingreso');
    if (!ing) return 0;
    return ing.lineas
      .filter((l) => catCobertura.get(l.categoriaId) === bolsa)
      .reduce((a, l) => a + l.actual, 0);
  };

  // Secciones para vistas normales (pendiente/cumplido/global) — igual que antes.
  const seccionesVista = useMemo<SeccionResumen[]>(() => {
    if (!resumen) return [];
    const secs = resumen.secciones.map((s) => {
      let lineas =
        filtro === 'global'
          ? s.lineas
          : s.lineas.filter((l) => (filtro === 'pendiente' ? l.queda > 0.005 : l.queda <= 0.005));
      if (verActivos && (s.tipo === 'Fijo' || s.tipo === 'Necesario')) {
        lineas = lineas.filter((l) => l.activo);
      }
      return {
        ...s,
        lineas,
        totalPresupuestado: lineas.reduce((a, l) => a + l.montoPresupuestado, 0),
        totalActual: lineas.reduce((a, l) => a + l.actual, 0),
      };
    });
    return filtro === 'global' ? secs : secs.filter((s) => s.lineas.length > 0);
  }, [resumen, filtro, verActivos]);

  // Secciones para la vista 'fase': solo Fijo/Necesario de la bolsa de hoy.
  const faseSecciones = useMemo<SeccionResumen[]>(() => {
    if (!resumen) return [];
    return resumen.secciones
      .filter((s) => s.tipo === 'Fijo' || s.tipo === 'Necesario')
      .map((s) => {
        let lineas = s.lineas.filter((l) => catCobertura.get(l.categoriaId) === faseActual);
        if (verActivos) lineas = lineas.filter((l) => l.activo);
        return {
          ...s,
          lineas,
          totalPresupuestado: lineas.reduce((a, l) => a + l.montoPresupuestado, 0),
          totalActual: lineas.reduce((a, l) => a + l.actual, 0),
        };
      })
      .filter((s) => s.lineas.length > 0);
  }, [resumen, catCobertura, faseActual, verActivos]);

  if (!periodoId) {
    return <EmptyState>No hay meses todavía. Crea uno en Configuración.</EmptyState>;
  }
  if (isLoading || !resumen) return <Loading />;

  const esFase = filtro === 'fase';
  const gastosFase = faseSecciones.reduce((a, s) => a + s.totalPresupuestado, 0);
  const ingresoQueCubre =
    faseActual === 'Quincena' ? ingresoBolsa(prevResumen, 'FinDeMes') : ingresoBolsa(resumen, 'Quincena');
  const ingresoLabel =
    faseActual === 'Quincena'
      ? prevPeriodo
        ? `Sueldo fin de mes (${MESES[prevPeriodo.mes - 1]})`
        : 'Sueldo fin de mes (mes anterior)'
      : 'Ingreso de quincena (este mes)';

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
            <ToggleButton value="fase">Fase actual</ToggleButton>
            <ToggleButton value="pendiente">Pendiente</ToggleButton>
            <ToggleButton value="cumplido">Cumplido</ToggleButton>
            <ToggleButton value="global">Global</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={verActivos ? 'activos' : 'todos'}
            onChange={(_, v: string | null) => v !== null && setVerActivos(v === 'activos')}
          >
            <ToggleButton value="activos">Activos</ToggleButton>
            <ToggleButton value="todos">Todos</ToggleButton>
          </ToggleButtonGroup>
          {!esFase && <PersonaSelect value={persona} onChange={setPersona} />}
        </Box>
        <CartillaIngresos />
      </Box>

      {esFase ? (
        <>
          <FaseActualCard
            fase={faseActual}
            ingreso={ingresoQueCubre}
            ingresoLabel={ingresoLabel}
            gastos={gastosFase}
            sinMesAnterior={faseActual === 'Quincena' && !prevPeriodo}
          />
          {faseSecciones.length === 0 ? (
            <EmptyState>
              No hay gastos asignados a esta fase. Asígnalos a quincena/fin de mes en Configuración →
              Gestionar.
            </EmptyState>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {faseSecciones.map((s) => (
                <SeccionLineas key={s.tipo} seccion={s} />
              ))}
            </Box>
          )}
        </>
      ) : (
        <>
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
        </>
      )}
    </Box>
  );
}
