import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useConfiguracion } from '../api/hooks/useConfiguracion';
import { formatMoney, formatNumber, formatSigned } from '../lib/format';
import type { Configuracion } from '../types';
import { CONFIG_DEFAULT } from '../types/configuracion';

interface SettingsContextValue {
  config: Configuracion;
  money: (value: number) => string;
  signed: (value: number, positivo: boolean) => string;
  number: (value: number) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useConfiguracion();
  const config = data ?? CONFIG_DEFAULT;

  const value = useMemo<SettingsContextValue>(
    () => ({
      config,
      money: (v: number) => formatMoney(v, config),
      signed: (v: number, positivo: boolean) => formatSigned(v, positivo, config),
      number: (v: number) => formatNumber(v, config),
    }),
    [config],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de <SettingsProvider>.');
  return ctx;
}
