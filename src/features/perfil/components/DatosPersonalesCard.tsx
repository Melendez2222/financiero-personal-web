import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, TextField } from '@mui/material';
import { SectionCard } from '../../../components/ui/SectionCard';
import { authApi } from '../../../api/auth.api';
import { useAuth } from '../../../context/AuthContext';
import { colors } from '../../../theme/tokens';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DatosPersonalesCard() {
  const { usuario, actualizarUsuario } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (nombre.trim().length === 0) {
      setMsg({ tipo: 'error', texto: 'El nombre es obligatorio.' });
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setMsg({ tipo: 'error', texto: 'Ingresa un correo válido.' });
      return;
    }
    setCargando(true);
    try {
      const actualizado = await authApi.actualizarPerfil({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim(),
      });
      actualizarUsuario(actualizado);
      setMsg({ tipo: 'ok', texto: 'Perfil actualizado correctamente.' });
    } catch (err: unknown) {
      const detalle =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudieron guardar los cambios.';
      setMsg({ tipo: 'error', texto: detalle });
    } finally {
      setCargando(false);
    }
  };

  return (
    <SectionCard title="Datos personales" accent={colors.ahorro} subtitle="Tu nombre, apellidos y correo">
      <Box component="form" onSubmit={enviar} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            size="small"
            required
            autoComplete="given-name"
          />
          <TextField
            label="Apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            size="small"
            autoComplete="family-name"
          />
        </Box>
        <TextField
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="small"
          required
          fullWidth
          autoComplete="email"
        />
        {msg && (
          <Alert severity={msg.tipo === 'ok' ? 'success' : 'error'} sx={{ py: 0 }}>
            {msg.texto}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={cargando}>
            {cargando ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </Box>
      </Box>
    </SectionCard>
  );
}
