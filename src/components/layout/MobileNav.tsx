import { Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';
import { colors } from '../../theme/tokens';

/** Navegación en chips para móvil (sustituye al sidebar bajo el topbar). */
export function MobileNav() {
  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        gap: 1,
        px: 2,
        py: 1.25,
        overflowX: 'auto',
        bgcolor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {navItems.map((item) => (
        <Box
          key={item.to}
          component={NavLink}
          to={item.to}
          end={item.end}
          sx={{
            flexShrink: 0,
            px: 1.75,
            py: 1,
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            bgcolor: colors.canvas,
            color: colors.textSecondary,
            whiteSpace: 'nowrap',
            '&.active': { bgcolor: colors.accent, color: '#fff' },
          }}
        >
          {item.label}
        </Box>
      ))}
    </Box>
  );
}
