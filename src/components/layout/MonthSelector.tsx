import { useState, type MouseEvent } from 'react';
import { Box, Menu, MenuItem } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { MESES } from '../../types/common';
import type { Periodo } from '../../types';
import { colors } from '../../theme/tokens';

function etiqueta(p: Periodo): string {
  return `${MESES[p.mes - 1]} ${p.anio}`;
}

export function MonthSelector() {
  const { periodos, periodoActivo, setPeriodoId } = usePeriodoActivo();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const abrir = (e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const cerrar = () => setAnchor(null);
  const elegir = (id: string) => {
    setPeriodoId(id);
    cerrar();
  };

  return (
    <>
      <Box
        component="button"
        onClick={abrir}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: colors.canvas,
          border: `1px solid ${colors.border}`,
          borderRadius: 2.75,
          px: 1.5,
          py: 1,
          cursor: 'pointer',
          color: colors.textPrimary,
          fontSize: 13.5,
          fontWeight: 500,
          fontFamily: 'inherit',
          '&:hover': { bgcolor: colors.surface, borderColor: colors.borderStrong },
        }}
      >
        <CalendarMonthIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          {periodoActivo ? etiqueta(periodoActivo) : 'Sin meses'}
        </Box>
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
      </Box>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={cerrar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 190, borderRadius: 3 } } }}
      >
        {periodos.map((p) => {
          const activo = p.id === periodoActivo?.id;
          return (
            <MenuItem
              key={p.id}
              selected={activo}
              onClick={() => elegir(p.id)}
              sx={{
                fontSize: 13.5,
                borderRadius: 2,
                mx: 0.5,
                my: 0.25,
                justifyContent: 'space-between',
                '&.Mui-selected': { bgcolor: colors.fijoSoft, color: colors.accentDark },
              }}
            >
              {etiqueta(p)}
              {activo && <CheckIcon sx={{ fontSize: 16 }} />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
