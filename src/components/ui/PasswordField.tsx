import { useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';

/**
 * Campo de contraseña con botón mostrar/ocultar.
 * El IconButton es type="button" + tabIndex={-1} para no convertirse en el submit
 * implícito del formulario (así Enter sigue enviando el form, no togglea).
 */
export function PasswordField(props: TextFieldProps) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <TextField
      {...props}
      type={mostrar ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                tabIndex={-1}
                edge="end"
                size="small"
                aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setMostrar((v) => !v)}
              >
                {mostrar ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
