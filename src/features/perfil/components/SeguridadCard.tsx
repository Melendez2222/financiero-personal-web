import { useState, type FormEvent } from 'react';
import { Alert, Box, Button } from '@mui/material';
import { SectionCard } from '../../../components/ui/SectionCard';
import { PasswordField } from '../../../components/ui/PasswordField';
import { authApi } from '../../../api/auth.api';
import { colors } from '../../../theme/tokens';

export function SeguridadCard() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirma, setConfirma] = useState('');
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (nueva.length < 6) {
      setMsg({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (nueva !== confirma) {
      setMsg({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
      return;
    }
    setCargando(true);
    try {
      await authApi.changePassword({ currentPassword: actual, newPassword: nueva });
      setMsg({ tipo: 'ok', texto: 'Contraseña actualizada correctamente.' });
      setActual('');
      setNueva('');
      setConfirma('');
    } catch (err: unknown) {
      const detalle =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo cambiar la contraseña.';
      setMsg({ tipo: 'error', texto: detalle });
    } finally {
      setCargando(false);
    }
  };

  return (
    <SectionCard title="Seguridad" accent={colors.deuda} subtitle="Cambiar tu contraseña">
      <Box component="form" onSubmit={enviar} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <PasswordField
          label="Contraseña actual"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          size="small"
          required
          autoComplete="current-password"
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <PasswordField
            label="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            size="small"
            required
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirmar nueva"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            size="small"
            required
            autoComplete="new-password"
          />
        </Box>
        {msg && (
          <Alert severity={msg.tipo === 'ok' ? 'success' : 'error'} sx={{ py: 0 }}>
            {msg.texto}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={cargando}>
            {cargando ? 'Guardando…' : 'Cambiar contraseña'}
          </Button>
        </Box>
      </Box>
    </SectionCard>
  );
}
