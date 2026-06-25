import { useState, type MouseEvent } from 'react';
import { Avatar, Box, Divider, Menu, MenuItem } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { rutaActual } from './navItems';
import { MonthSelector } from './MonthSelector';
import { useAuth } from '../../context/AuthContext';
import { colors, gradients } from '../../theme/tokens';

export function Topbar() {
  const { pathname } = useLocation();
  const meta = rutaActual(pathname);
  const { usuario, logout } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const inicial = usuario?.nombre?.charAt(0).toUpperCase() ?? 'U';

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        px: { xs: 2, md: 3.75 },
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      {/* Logo móvil */}
      <Box
        sx={{
          display: { xs: 'grid', sm: 'none' },
          placeItems: 'center',
          width: 32,
          height: 32,
          borderRadius: 2,
          background: gradients.accent,
          color: '#fff',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        M
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}>
          {meta.label}
        </Box>
        <Box sx={{ fontSize: 12.5, color: colors.textTertiary, display: { xs: 'none', sm: 'block' } }}>
          {meta.subtitle}
        </Box>
      </Box>

      <MonthSelector />

      <Avatar
        onClick={(e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
        sx={{
          width: 38,
          height: 38,
          bgcolor: colors.ahorroSoft,
          color: colors.ahorro,
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        {inicial}
      </Avatar>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 3 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Box sx={{ fontWeight: 700, fontSize: 14 }}>
            {[usuario?.nombre, usuario?.apellidos].filter(Boolean).join(' ') || usuario?.nombre}
          </Box>
          <Box sx={{ fontSize: 12, color: colors.textTertiary }}>{usuario?.email}</Box>
        </Box>
        <Divider />
        <MenuItem
          component={RouterLink}
          to="/perfil"
          onClick={() => setAnchor(null)}
          sx={{ fontSize: 14, gap: 1 }}
        >
          <PersonOutlineIcon sx={{ fontSize: 18 }} />
          Perfil
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            logout();
          }}
          sx={{ fontSize: 14, gap: 1 }}
        >
          <LogoutIcon sx={{ fontSize: 18 }} />
          Cerrar sesión
        </MenuItem>
      </Menu>
    </Box>
  );
}
