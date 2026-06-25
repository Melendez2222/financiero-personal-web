import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Box, Button, Card, IconButton, MenuItem, Switch, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useCategorias } from '../../api/hooks/useCategorias';
import { useDeudas } from '../../api/hooks/useDeudas';
import { useMetas } from '../../api/hooks/useMetas';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useSettings } from '../../context/SettingsContext';
import { Loading } from '../../components/ui/Loading';
import { MoneyText } from '../../components/ui/MoneyText';
import { SectionCard } from '../../components/ui/SectionCard';
import { colors, tipoColors } from '../../theme/tokens';
import { MESES, TIPO_LABEL_PLURAL } from '../../types/common';
import type { Tipo } from '../../types';

const SECCIONES: Tipo[] = ['Ingreso', 'Fijo', 'Necesario', 'Deuda', 'Ahorro'];

interface Linea {
  id: string;
  concepto: string;
  monto: string;
}

interface Asignacion {
  id: string;
  target: string; // 'deuda:<id>' | 'meta:<id>' | ''
  monto: string;
}

function nuevoId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function SimuladorPage() {
  const { data: categorias = [], isLoading } = useCategorias();
  const { data: deudas = [] } = useDeudas();
  const { data: metas = [] } = useMetas();
  const { periodos, periodoActivo } = usePeriodoActivo();
  const { money } = useSettings();

  const [mesId, setMesId] = useState<string>('');
  const [off, setOff] = useState<Set<string>>(new Set());
  const [externos, setExternos] = useState<Linea[]>([]);
  const [ingresosExtra, setIngresosExtra] = useState<Linea[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  const activas = useMemo(() => categorias.filter((c) => c.activo), [categorias]);
  const isOn = (id: string) => !off.has(id);
  const toggle = (id: string) =>
    setOff((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sumaTipo = (tipo: Tipo) =>
    activas.filter((c) => c.tipo === tipo && isOn(c.id)).reduce((s, c) => s + c.presupuesto, 0);

  const totalLineas = (ls: Linea[]) => ls.reduce((s, e) => s + (Number(e.monto) || 0), 0);

  const ingresosExtraTotal = totalLineas(ingresosExtra);
  const ingresos = sumaTipo('Ingreso') + ingresosExtraTotal;
  const fijos = sumaTipo('Fijo');
  const necesarios = sumaTipo('Necesario');
  const deudasMonto = sumaTipo('Deuda');
  const ahorro = sumaTipo('Ahorro');
  const externosTotal = totalLineas(externos);
  const totalAsignado = asignaciones.reduce((s, a) => s + (Number(a.monto) || 0), 0);
  const gastos = fijos + necesarios + deudasMonto + externosTotal;
  const neto = ingresos - gastos - ahorro;

  const mesLabel = (() => {
    const p = periodos.find((x) => x.id === mesId) ?? periodoActivo;
    return p ? `${MESES[p.mes - 1]} ${p.anio}` : 'un mes';
  })();

  const reiniciar = () => {
    setOff(new Set());
    setExternos([]);
    setIngresosExtra([]);
    setAsignaciones([]);
  };

  // Preview de una asignación de monto extra a una deuda o meta.
  const previewAsignacion = (target: string, monto: string): string | null => {
    const m = Number(monto) || 0;
    if (!target || m <= 0) return null;
    const [tipo, id] = target.split(':');
    if (tipo === 'deuda') {
      const d = deudas.find((x) => x.id === id);
      if (!d) return null;
      const actual = d.saldoRestante ?? d.montoTotal ?? 0;
      return `${d.nombre}: queda ${money(actual)} → ${money(Math.max(0, actual - m))}`;
    }
    const meta = metas.find((x) => x.id === id);
    if (!meta) return null;
    const nuevo = meta.montoAcumulado + m;
    const pct = meta.montoObjetivo ? Math.min(100, Math.round((nuevo / meta.montoObjetivo) * 100)) : 0;
    return `${meta.nombre}: llevas ${money(meta.montoAcumulado)} → ${money(nuevo)} (${pct}%)`;
  };

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ fontSize: 13, color: colors.textSecondary, maxWidth: 560 }}>
          Arma el presupuesto de un mes: activa/desactiva qué aplica, agrega ingresos y gastos puntuales y mira
          cuánto te quedaría. <strong>No se guarda nada.</strong>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField select size="small" label="Mes" value={mesId} onChange={(e) => setMesId(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="">Mes actual</MenuItem>
            {periodos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {MESES[p.mes - 1]} {p.anio}
              </MenuItem>
            ))}
          </TextField>
          <Button startIcon={<RestartAltIcon />} color="inherit" onClick={reiniciar}>
            Reiniciar
          </Button>
        </Box>
      </Box>

      {/* Resultado */}
      <Card sx={{ p: 3, background: neto >= 0 ? undefined : colors.negativeSoft }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'center' }}>
          <Resumen label="Ingresos (con extra)" valor={money(ingresos)} color={colors.ingreso} />
          <Resumen label="Gastos (con externos)" valor={money(gastos)} color={colors.fijo} />
          <Resumen label="Ahorro" valor={money(ahorro)} color={colors.ahorro} />
          <Box>
            <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>Disponible / neto del mes</Box>
            <Box sx={{ fontSize: 28, fontWeight: 700, color: neto >= 0 ? colors.positive : colors.negative }}>
              {money(neto)}
            </Box>
          </Box>
        </Box>
        <Box sx={{ fontSize: 12, color: colors.textTertiary, mt: 1 }}>Simulación para {mesLabel}</Box>
      </Card>

      {/* Secciones del catálogo con toggles */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {SECCIONES.map((tipo) => {
          const items = activas.filter((c) => c.tipo === tipo).sort((a, b) => a.orden - b.orden);
          if (items.length === 0) return null;
          const c = tipoColors[tipo];
          return (
            <SectionCard key={tipo} title={TIPO_LABEL_PLURAL[tipo]} accent={c.main} flush>
              <Box sx={{ px: 2, py: 0.5 }}>
                {items.map((cat) => (
                  <Box
                    key={cat.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, borderTop: `1px solid ${colors.borderSoft}`, opacity: isOn(cat.id) ? 1 : 0.45 }}
                  >
                    <Box sx={{ fontSize: 16 }}>{cat.emoji ?? '•'}</Box>
                    <Box sx={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600 }}>{cat.nombre}</Box>
                    <Box sx={{ fontSize: 13.5, fontWeight: 700, color: c.main }}>
                      <MoneyText value={cat.presupuesto} color={c.main} />
                    </Box>
                    <Switch size="small" checked={isOn(cat.id)} onChange={() => toggle(cat.id)} />
                  </Box>
                ))}
              </Box>
            </SectionCard>
          );
        })}
      </Box>

      {/* Ingresos extra + Gastos externos */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <LineasCard
          title="Ingresos extra"
          accent={tipoColors.Ingreso.main}
          subtitle="Gratificación, ingreso adicional… (solo simulación)"
          lineas={ingresosExtra}
          setLineas={setIngresosExtra}
        />
        <LineasCard
          title="Gastos externos"
          accent={tipoColors.Situacional.main}
          subtitle="Imprevistos o puntuales (solo simulación)"
          lineas={externos}
          setLineas={setExternos}
        />
      </Box>

      {/* Asignar montos extra a deudas o metas (varias a la vez) */}
      <SectionCard
        title="Asignar montos extra"
        accent={colors.ahorro}
        subtitle="¿Cómo quedarían tus deudas o ahorros si les metes un extra este mes?"
        action={
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAsignaciones((prev) => [...prev, { id: nuevoId(), target: '', monto: '' }])}
            sx={{ bgcolor: `${colors.ahorro}1A`, color: colors.ahorro, fontSize: 12.5 }}
          >
            Agregar
          </Button>
        }
      >
        {asignaciones.length === 0 ? (
          <Box sx={{ fontSize: 13, color: colors.textTertiary }}>Sin asignaciones. Agrega una con el botón.</Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {asignaciones.map((a) => {
              const preview = previewAsignacion(a.target, a.monto);
              return (
                <Box key={a.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                      select
                      size="small"
                      label="Destino"
                      value={a.target}
                      onChange={(e) =>
                        setAsignaciones((prev) => prev.map((x) => (x.id === a.id ? { ...x, target: e.target.value } : x)))
                      }
                      sx={{ minWidth: 240, flex: 1 }}
                    >
                      <MenuItem value="">— elige —</MenuItem>
                      {deudas.map((d) => (
                        <MenuItem key={d.id} value={`deuda:${d.id}`}>
                          Deuda: {d.nombre}
                          {d.saldoRestante != null ? ` (queda ${money(d.saldoRestante)})` : ''}
                        </MenuItem>
                      ))}
                      {metas.map((m) => (
                        <MenuItem key={m.id} value={`meta:${m.id}`}>
                          Ahorro: {m.nombre} (llevas {money(m.montoAcumulado)})
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      label="Monto (S/)"
                      type="number"
                      value={a.monto}
                      onChange={(e) =>
                        setAsignaciones((prev) => prev.map((x) => (x.id === a.id ? { ...x, monto: e.target.value } : x)))
                      }
                      slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                      sx={{ width: 150 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setAsignaciones((prev) => prev.filter((x) => x.id !== a.id))}
                      sx={{ color: colors.negative }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                  {preview && (
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: colors.canvas, fontSize: 14, fontWeight: 600 }}>
                      {preview}
                    </Box>
                  )}
                </Box>
              );
            })}
            <Box sx={{ fontSize: 13, color: colors.textSecondary, pt: 0.5, borderTop: `1px solid ${colors.borderSoft}` }}>
              Total asignado:{' '}
              <strong style={{ color: colors.ahorro }}>{money(totalAsignado)}</strong>
            </Box>
          </Box>
        )}
      </SectionCard>
    </Box>
  );
}

function LineasCard({
  title,
  accent,
  subtitle,
  lineas,
  setLineas,
}: {
  title: string;
  accent: string;
  subtitle: string;
  lineas: Linea[];
  setLineas: Dispatch<SetStateAction<Linea[]>>;
}) {
  return (
    <SectionCard
      title={title}
      accent={accent}
      subtitle={subtitle}
      action={
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setLineas((prev) => [...prev, { id: nuevoId(), concepto: '', monto: '' }])}
          sx={{ bgcolor: `${accent}1A`, color: accent, fontSize: 12.5 }}
        >
          Agregar
        </Button>
      }
    >
      {lineas.length === 0 ? (
        <Box sx={{ fontSize: 13, color: colors.textTertiary }}>Sin registros. Agrega uno con el botón.</Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {lineas.map((e) => (
            <Box key={e.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <TextField
                size="small"
                label="Descripción"
                value={e.concepto}
                onChange={(ev) => setLineas((prev) => prev.map((x) => (x.id === e.id ? { ...x, concepto: ev.target.value } : x)))}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Monto (S/)"
                type="number"
                value={e.monto}
                onChange={(ev) => setLineas((prev) => prev.map((x) => (x.id === e.id ? { ...x, monto: ev.target.value } : x)))}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                sx={{ width: 130 }}
              />
              <IconButton size="small" onClick={() => setLineas((prev) => prev.filter((x) => x.id !== e.id))} sx={{ color: colors.negative }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

function Resumen({ label, valor, color }: { label: string; valor: string; color?: string }) {
  return (
    <Box>
      <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>{label}</Box>
      <Box sx={{ fontSize: 18, fontWeight: 700, color }}>{valor}</Box>
    </Box>
  );
}
