import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../../theme/tokens';

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ textAlign: 'center', color: colors.textDisabled, fontSize: 13, py: 3 }}>
      {children}
    </Box>
  );
}
