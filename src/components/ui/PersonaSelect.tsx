import { MenuItem, TextField } from '@mui/material';
import { useUsuarios } from '../../api/hooks/useUsuarios';

interface Props {
  /** '' = Global (ambas personas). */
  value: string;
  onChange: (v: string) => void;
}

/** Selector "Global / persona" para filtrar vistas por persona (Panel del mes, Dashboard). */
export function PersonaSelect({ value, onChange }: Props) {
  const { data: usuarios = [] } = useUsuarios();
  return (
    <TextField
      select
      size="small"
      label="Persona"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: 150 }}
    >
      <MenuItem value="">Global</MenuItem>
      {usuarios.map((u) => (
        <MenuItem key={u.id} value={u.id}>
          {u.nombre}
        </MenuItem>
      ))}
    </TextField>
  );
}
