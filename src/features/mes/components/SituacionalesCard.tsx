import { Box } from '@mui/material';
import { SectionCard } from '../../../components/ui/SectionCard';
import { MoneyText } from '../../../components/ui/MoneyText';
import { colors, tipoColors } from '../../../theme/tokens';
import type { SituacionalResumen } from '../../../types';

function fechaCorta(iso: string): string {
  const [, m, d] = iso.split('-');
  return d && m ? `${d}/${m}` : iso;
}

export function SituacionalesCard({ situacionales }: { situacionales: SituacionalResumen[] }) {
  const total = situacionales.reduce((s, x) => s + x.monto, 0);
  return (
    <SectionCard
      title="Gastos situacionales"
      accent={tipoColors.Situacional.main}
      subtitle="Imprevistos sin presupuesto"
      rightLabel="Total"
      rightValue={<MoneyText value={total} color={tipoColors.Situacional.main} />}
      flush
    >
      <Box sx={{ px: 2.5, py: 1 }}>
        {situacionales.map((s) => (
          <Box
            key={s.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '70px 1fr auto',
              gap: 1.5,
              alignItems: 'center',
              py: 1.1,
              borderTop: `1px solid ${colors.borderSoft}`,
            }}
          >
            <Box sx={{ fontSize: 13, color: colors.textSecondary }}>{fechaCorta(s.fecha)}</Box>
            <Box sx={{ fontSize: 13.5, fontWeight: 600 }}>{s.concepto}</Box>
            <Box sx={{ textAlign: 'right', fontSize: 13.5 }}>
              <MoneyText value={s.monto} />
            </Box>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}
