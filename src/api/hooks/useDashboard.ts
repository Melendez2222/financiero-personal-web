import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../dashboard.api';
import { qk } from '../queryKeys';

export function useDashboard(periodoId?: string) {
  return useQuery({
    queryKey: qk.dashboard(periodoId),
    queryFn: () => dashboardApi.get(periodoId),
    enabled: !!periodoId,
  });
}
