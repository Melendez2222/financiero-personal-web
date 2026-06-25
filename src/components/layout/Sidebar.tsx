import { Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';
import { DisponibleCard } from './DisponibleCard';
import { colors, gradients, layout } from '../../theme/tokens';

export function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', sm: 'flex' },
        flexDirection: 'column',
        width: layout.sidebarWidth,
        flexShrink: 0,
        bgcolor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            background: gradients.accent,
            color: '#fff',
            fontWeight: 700,
            fontSize: 20,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          M
        </Box>
        <Box sx={{ lineHeight: 1.2 }}>
          <Box sx={{ fontWeight: 700, fontSize: 15, color: colors.textPrimary }}>Mis Cuentas</Box>
          <Box sx={{ fontSize: 11, color: colors.textTertiary }}>Contabilidad personal</Box>
        </Box>
      </Box>

      {/* Navegación */}
      <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1.5, mt: 1 }}>
        {navItems.map((item) => (
          <Box
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 1.5,
              py: 1.1,
              borderRadius: 2.5,
              color: colors.textSecondary,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background-color .15s',
              '&.active': { bgcolor: colors.fijoSoft, color: colors.accentDark, fontWeight: 600 },
              '&:hover:not(.active)': { bgcolor: colors.canvas },
            }}
          >
            <item.icon sx={{ fontSize: 20 }} />
            {item.label}
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1 }} />
      <DisponibleCard />
    </Box>
  );
}
