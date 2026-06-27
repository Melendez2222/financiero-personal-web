import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../dashboard.api';
import { qk } from '../queryKeys';

export function useDashboard(periodoId?: string, usuarioId?: string) {
  return useQuery({
    queryKey: qk.dashboard(periodoId, usuarioId),
    queryFn: () => dashboardApi.get(periodoId, usuarioId),
    enabled: !!periodoId,
  });
}
