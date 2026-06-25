import { useQuery } from '@tanstack/react-query';
import { deudasApi } from '../deudas.api';

export function useDeudas() {
  return useQuery({ queryKey: ['deudas'], queryFn: deudasApi.list });
}
