import { useQuery } from '@tanstack/react-query';
import { usuariosApi } from '../usuarios.api';

export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.list, staleTime: 5 * 60_000 });
}
