import { useState, type FormEvent, type ReactNode } from 'react';
import { Alert, Box, Button, Card, TextField } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { PasswordField } from '../../components/ui/PasswordField';
import { colors, gradients, shadows } from '../../theme/tokens';

type Modo = 'login' | 'registro' | 'recuperar';

const TITULOS: Record<Modo, string> = {
  login: 'Inicia sesión para continuar',
  registro: 'Crea tu cuenta',
  recuperar: 'Restablece tu contraseña',
};

export function LoginPage() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('cristhian.melendez2711@gmail.com');
  const [password, setPassword] = useState('');
  const [confirma, setConfirma] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setError(null);
    setOk(null);
    setPassword('');
    setConfirma('');
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (modo === 'recuperar' || modo === 'registro') {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }
    if (modo === 'recuperar' && password !== confirma) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      if (modo === 'login') {
        await login({ email, password });
        navigate('/', { replace: true });
      } else if (modo === 'registro') {
        await register({ email, nombre, password });
        navigate('/', { replace: true });
      } else {
        await authApi.resetPassword({ email, newPassword: password });
        cambiarModo('login');
        setOk('Contraseña actualizada. Ya puedes iniciar sesión.');
      }
    } catch (err: unknown) {
      const detalle =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo completar la operación.';
      setError(detalle);
    } finally {
      setCargando(false);
    }
  };

  const botonTexto =
    modo === 'login' ? 'Entrar' : modo === 'registro' ? 'Crear cuenta' : 'Restablecer contraseña';

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: colors.canvas, p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400, p: { xs: 3, sm: 4 }, boxShadow: shadows.card }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: gradients.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: 22,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            M
          </Box>
          <Box>
            <Box sx={{ fontSize: 18, fontWeight: 700 }}>Mis Cuentas</Box>
            <Box sx={{ fontSize: 12.5, color: colors.textTertiary }}>{TITULOS[modo]}</Box>
          </Box>
        </Box>

        {ok && <Alert severity="success" sx={{ mb: 2, py: 0 }}>{ok}</Alert>}

        <Box component="form" onSubmit={enviar} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {modo === 'registro' && (
            <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required fullWidth size="small" />
          )}
          <TextField
            label="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <PasswordField
            label={modo === 'recuperar' ? 'Nueva contraseña' : 'Contraseña'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
          />
          {modo === 'recuperar' && (
            <PasswordField
              label="Confirmar contraseña"
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              required
              fullWidth
              size="small"
              autoComplete="new-password"
            />
          )}

          {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}

          <Button type="submit" variant="contained" disabled={cargando} sx={{ py: 1.2 }}>
            {cargando ? 'Procesando…' : botonTexto}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2, fontSize: 13, color: colors.textSecondary, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {modo === 'login' && (
            <>
              <Box>
                ¿No tienes cuenta?{' '}
                <Enlace onClick={() => cambiarModo('registro')}>Regístrate</Enlace>
              </Box>
              <Enlace onClick={() => cambiarModo('recuperar')}>¿Olvidaste tu contraseña?</Enlace>
            </>
          )}
          {modo === 'registro' && (
            <Box>
              ¿Ya tienes cuenta? <Enlace onClick={() => cambiarModo('login')}>Inicia sesión</Enlace>
            </Box>
          )}
          {modo === 'recuperar' && <Enlace onClick={() => cambiarModo('login')}>Volver a iniciar sesión</Enlace>}
        </Box>
      </Card>
    </Box>
  );
}

function Enlace({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        border: 'none',
        background: 'none',
        color: colors.accent,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: 'inherit',
      }}
    >
      {children}
    </Box>
  );
}
