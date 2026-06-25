import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useCrearPeriodo, useIniciarPeriodo, usePeriodos } from '../api/hooks/usePeriodos';
import type { Periodo } from '../types';

interface PeriodoContextValue {
  periodos: Periodo[];
  periodoActivo: Periodo | null;
  periodoId: string | undefined;
  setPeriodoId: (id: string) => void;
  isLoading: boolean;
}

const PeriodoContext = createContext<PeriodoContextValue | null>(null);

export function PeriodoProvider({ children }: { children: ReactNode }) {
  const { data: periodos = [], isLoading } = usePeriodos();
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const crear = useCrearPeriodo();
  const iniciar = useIniciarPeriodo();
  const intentoRef = useRef<string | null>(null);

  // Mes en curso según la fecha real (se resuelve en el cliente, sin cron ni backend).
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth() + 1;

  // El mes en curso queda siempre creado e Iniciado automáticamente (una sola vez por mes):
  // si no existe se crea+inicia; si existe en Borrador se inicia; si ya está Iniciado/Cerrado no se toca.
  useEffect(() => {
    if (isLoading) return;
    const key = `${anioActual}-${mesActual}`;
    if (intentoRef.current === key) return;
    const actual = periodos.find((p) => p.anio === anioActual && p.mes === mesActual);
    if (actual && actual.estado !== 'Borrador') return;
    intentoRef.current = key;
    void (async () => {
      try {
        if (!actual) {
          const nuevo = await crear.mutateAsync({ anio: anioActual, mes: mesActual, heredarBalance: true });
          await iniciar.mutateAsync(nuevo.id);
          setSeleccionId(nuevo.id);
        } else {
          await iniciar.mutateAsync(actual.id);
          setSeleccionId(actual.id);
        }
      } catch {
        // Si falló (p.ej. carrera: ya existía), no se reintenta; el memo seleccionará el actual al refrescar.
      }
    })();
  }, [isLoading, periodos, anioActual, mesActual, crear, iniciar]);

  // El activo es: el seleccionado por el usuario → el mes en curso → el más reciente.
  const periodoActivo = useMemo(() => {
    if (seleccionId) {
      const match = periodos.find((p) => p.id === seleccionId);
      if (match) return match;
    }
    const actual = periodos.find((p) => p.anio === anioActual && p.mes === mesActual);
    return actual ?? periodos[0] ?? null;
  }, [periodos, seleccionId, anioActual, mesActual]);

  const value = useMemo<PeriodoContextValue>(
    () => ({
      periodos,
      periodoActivo,
      periodoId: periodoActivo?.id,
      setPeriodoId: setSeleccionId,
      isLoading,
    }),
    [periodos, periodoActivo, isLoading],
  );

  return <PeriodoContext.Provider value={value}>{children}</PeriodoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePeriodoActivo(): PeriodoContextValue {
  const ctx = useContext(PeriodoContext);
  if (!ctx) throw new Error('usePeriodoActivo debe usarse dentro de <PeriodoProvider>.');
  return ctx;
}
