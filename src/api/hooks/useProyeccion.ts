import { useQuery } from '@tanstack/react-query';
import { proyeccionApi } from '../proyeccion.api';

export function useProyeccion(meses = 12) {
  return useQuery({ queryKey: ['proyeccion', meses], queryFn: () => proyeccionApi.get(meses) });
}
