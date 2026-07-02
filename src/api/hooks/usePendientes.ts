import { useQuery } from '@tanstack/react-query';
import { pendientesApi } from '../pendientes.api';

/** Gastos pendientes por pagar (queda > 0) de todos los meses, con su mes de origen. */
export function usePendientes() {
  return useQuery({ queryKey: ['pendientes'], queryFn: pendientesApi.list });
}
