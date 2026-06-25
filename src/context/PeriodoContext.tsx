import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { usePeriodos } from '../api/hooks/usePeriodos';
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

  // El activo es el seleccionado, o el más reciente (la lista viene ordenada desc).
  const periodoActivo = useMemo(() => {
    if (seleccionId) {
      const match = periodos.find((p) => p.id === seleccionId);
      if (match) return match;
    }
    return periodos[0] ?? null;
  }, [periodos, seleccionId]);

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
