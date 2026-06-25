import { useState } from 'react';
import { Box, Card, MenuItem, TextField } from '@mui/material';
import FlagIcon from '@mui/icons-material/FlagOutlined';
import { useProyeccion } from '../../api/hooks/useProyeccion';
import { useSettings } from '../../context/SettingsContext';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { MoneyText } from '../../components/ui/MoneyText';
import { SectionCard } from '../../components/ui/SectionCard';
import { colors, tipoColors } from '../../theme/tokens';
import type { GuiaMes } from '../../types';

export function ProyeccionPage() {
  const [meses, setMeses] = useState(12);
  const { data, isLoading } = useProyeccion(meses);
  const { money } = useSettings();

  if (isLoading || !data) {
    return isLoading ? <Loading /> : <EmptyState>No hay datos para proyectar. Crea un mes primero.</EmptyState>;
  }

  const saldoFinal = data.meses.length ? data.meses[data.meses.length - 1].saldoAcumulado : data.saldoInicial;
  const hitos = data.meses.flatMap((m) => m.hitos.map((texto) => ({ etiqueta: m.etiqueta, texto })));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
          Guía automática: cómo evoluciona tu saldo y cuándo terminas deudas y metas si mantienes tu presupuesto actual.
        </Box>
        <TextField
          select
          size="small"
          label="Horizonte"
          value={meses}
          onChange={(e) => setMeses(Number(e.target.value))}
          sx={{ minWidth: 130 }}
        >
          {[6, 12, 24, 36].map((m) => (
            <MenuItem key={m} value={m}>
              {m} meses
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Resumen */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Resumen label="Saldo inicial" valor={money(data.saldoInicial)} />
        <Resumen label={`Saldo en ${meses} meses`} valor={money(saldoFinal)} color={saldoFinal >= 0 ? colors.positive : colors.negative} />
        <Resumen label="Hitos próximos" valor={String(hitos.length)} color={colors.ahorro} />
      </Box>

      {/* Gráfico + Hitos */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, gap: 2 }}>
        <Card sx={{ p: 2.5 }}>
          <Box sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>Saldo proyectado</Box>
          <SaldoChart meses={data.meses} />
        </Card>

        <SectionCard title="Próximos hitos" accent={colors.ahorro} flush>
          <Box sx={{ px: 2.5, py: 1 }}>
            {hitos.length === 0 && <EmptyState>Sin hitos en este horizonte.</EmptyState>}
            {hitos.map((h, i) => {
              const esDeuda = h.texto.startsWith('Terminas');
              const c = esDeuda ? tipoColors.Deuda : tipoColors.Ahorro;
              return (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1, borderTop: i ? `1px solid ${colors.borderSoft}` : 'none' }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 2, bgcolor: c.soft, color: c.main, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <FlagIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ fontSize: 13.5, fontWeight: 600 }}>{h.texto}</Box>
                    <Box sx={{ fontSize: 11.5, color: colors.textTertiary }}>{h.etiqueta}</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </SectionCard>
      </Box>

      {/* Detalle mes a mes */}
      <SectionCard title="Detalle mes a mes" accent={colors.ingreso} flush>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 560, px: 2.5, py: 1 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.9fr 1fr',
                gap: 1.25,
                py: 0.75,
                fontSize: 10.5,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: colors.textTertiary,
              }}
            >
              <Box>Mes</Box>
              <Box sx={{ textAlign: 'right' }}>Deudas</Box>
              <Box sx={{ textAlign: 'right' }}>Ahorro</Box>
              <Box sx={{ textAlign: 'right' }}>Neto</Box>
              <Box sx={{ textAlign: 'right' }}>Saldo</Box>
            </Box>
            {data.meses.map((m) => (
              <Box key={m.etiqueta} sx={{ borderTop: `1px solid ${colors.borderSoft}`, py: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.9fr 1fr', gap: 1.25, alignItems: 'center', fontSize: 13.5 }}>
                  <Box sx={{ fontWeight: 600 }}>{m.etiqueta}</Box>
                  <Box sx={{ textAlign: 'right', color: colors.textSecondary }}>
                    <MoneyText value={m.deudas} weight={400} />
                  </Box>
                  <Box sx={{ textAlign: 'right', color: colors.textSecondary }}>
                    <MoneyText value={m.ahorro} weight={400} />
                  </Box>
                  <Box sx={{ textAlign: 'right', color: m.neto >= 0 ? colors.positive : colors.negative }}>
                    <MoneyText value={m.neto} weight={500} />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <MoneyText value={m.saldoAcumulado} />
                  </Box>
                </Box>
                {m.hitos.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                    {m.hitos.map((h) => {
                      const esDeuda = h.startsWith('Terminas');
                      const c = esDeuda ? tipoColors.Deuda : tipoColors.Ahorro;
                      return (
                        <Box key={h} sx={{ fontSize: 11.5, fontWeight: 600, color: c.main, bgcolor: c.soft, px: 1, py: 0.3, borderRadius: 20 }}>
                          {h}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </SectionCard>
    </Box>
  );
}

function Resumen({ label, valor, color }: { label: string; valor: string; color?: string }) {
  return (
    <Card sx={{ p: 2.25 }}>
      <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>{label}</Box>
      <Box sx={{ fontSize: 22, fontWeight: 700, color, mt: 0.5 }}>{valor}</Box>
    </Card>
  );
}

function SaldoChart({ meses }: { meses: GuiaMes[] }) {
  const W = 320;
  const H = 130;
  if (meses.length < 2) {
    return <Box sx={{ height: 180, display: 'grid', placeItems: 'center', color: colors.textTertiary, fontSize: 13 }}>Sin suficientes datos</Box>;
  }
  const valores = meses.map((m) => m.saldoAcumulado);
  const min = Math.min(0, ...valores);
  const max = Math.max(...valores, 1);
  const span = max - min || 1;
  const step = W / (meses.length - 1);
  const puntos = valores.map((v, i) => `${(i * step).toFixed(1)},${(H - ((v - min) / span) * H).toFixed(1)}`).join(' ');
  const cero = H - ((0 - min) / span) * H;

  return (
    <Box>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 180 }}>
        {min < 0 && <line x1={0} x2={W} y1={cero} y2={cero} stroke={colors.border} strokeWidth={1} strokeDasharray="4 4" />}
        <polyline points={puntos} fill="none" stroke={tipoColors.Ahorro.main} strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Box sx={{ fontSize: 11, color: colors.textTertiary }}>{meses[0].etiqueta}</Box>
        <Box sx={{ fontSize: 11, color: colors.textTertiary }}>{meses[meses.length - 1].etiqueta}</Box>
      </Box>
    </Box>
  );
}
