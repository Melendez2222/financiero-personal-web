import { useMemo } from 'react';
import { Box, Card } from '@mui/material';
import { useSettings } from '../../../context/SettingsContext';
import { colors } from '../../../theme/tokens';
import type { Movimiento, Usuario } from '../../../types';

interface Props {
  movimientos: Movimiento[];
  usuarios: Usuario[];
}

interface Linea {
  key: string;
  nombre: string;
  monto: number;
  color: string;
}

/** Resumen del conjunto filtrado: cuánto suma cada persona + sin asignar + total global. */
export function DesglosePersona({ movimientos, usuarios }: Props) {
  const { money } = useSettings();

  const lineas = useMemo<Linea[]>(() => {
    const porUsuario = new Map<string, number>();
    let sinAsignar = 0;
    for (const m of movimientos) {
      if (m.usuarioId) porUsuario.set(m.usuarioId, (porUsuario.get(m.usuarioId) ?? 0) + m.monto);
      else sinAsignar += m.monto;
    }
    const paleta = [colors.ahorro, colors.situacional, colors.necesario, colors.deuda];
    // Personas sin movimientos también se muestran (en 0) para que el desglose sea legible.
    const items: Linea[] = usuarios.map((u, i) => ({
      key: u.id,
      nombre: u.nombre.split(' ')[0] || u.nombre,
      monto: porUsuario.get(u.id) ?? 0,
      color: paleta[i % paleta.length],
    }));
    if (sinAsignar > 0) {
      items.push({ key: '__none__', nombre: 'Sin asignar', monto: sinAsignar, color: colors.textTertiary });
    }
    return items;
  }, [movimientos, usuarios]);

  const total = useMemo(() => movimientos.reduce((s, m) => s + m.monto, 0), [movimientos]);

  if (movimientos.length === 0) return null;

  return (
    <Card sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
      <Box sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textTertiary, mr: 0.5 }}>
        Por persona
      </Box>
      {lineas.map((l) => (
        <Box
          key={l.key}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.25,
            py: 0.6,
            borderRadius: 999,
            bgcolor: colors.canvas,
            border: `1px solid ${colors.borderLight}`,
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
          <Box sx={{ fontSize: 13, color: colors.textSecondary }}>{l.nombre}</Box>
          <Box sx={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>{money(l.monto)}</Box>
        </Box>
      ))}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.6,
          borderRadius: 999,
          ml: 'auto',
          bgcolor: colors.textPrimary,
          color: colors.surface,
        }}
      >
        <Box sx={{ fontSize: 12, opacity: 0.85 }}>Total</Box>
        <Box sx={{ fontSize: 13.5, fontWeight: 700 }}>{money(total)}</Box>
      </Box>
    </Card>
  );
}
