import { useState } from 'react';
import { Box, Button, Card, IconButton, LinearProgress, Switch } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useSettings } from '../../../context/SettingsContext';
import { useAportes, useEliminarMeta, useToggleMetaActivo } from '../../../api/hooks/useMetas';
import { AporteDialog } from './AporteDialog';
import { MetaDialog } from './MetaDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { colors } from '../../../theme/tokens';
import { MESES } from '../../../types/common';
import type { EstadoMeta, MetaAhorro } from '../../../types';

function mesAnio(d: Date): string {
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function fechaCorta(iso: string): string {
  const [, m, d] = iso.split('-');
  return d && m ? `${d}/${m}` : iso;
}

const ESTADO_UI: Record<EstadoMeta, { label: string; fg: string; bg: string }> = {
  NoIniciado: { label: 'No iniciado', fg: colors.textTertiary, bg: colors.canvas },
  Pendiente: { label: 'Pendiente', fg: colors.deuda, bg: colors.deudaSoft },
  Iniciado: { label: 'Iniciado', fg: colors.ahorro, bg: colors.ahorroSoft },
  Suspendido: { label: 'Suspendido', fg: colors.textSecondary, bg: colors.canvas },
  Finalizado: { label: 'Finalizado', fg: colors.positive, bg: colors.positiveSoft },
};

function Stat({ label, valor, color }: { label: string; valor: string; color?: string }) {
  return (
    <Box>
      <Box sx={{ fontSize: 11, color: colors.textTertiary }}>{label}</Box>
      <Box sx={{ fontSize: 15, fontWeight: 700, color }}>{valor}</Box>
    </Box>
  );
}

export function MetaCard({ meta }: { meta: MetaAhorro }) {
  const { money } = useSettings();
  const toggle = useToggleMetaActivo();
  const eliminar = useEliminarMeta();
  const [aporteOpen, setAporteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [verAportes, setVerAportes] = useState(false);
  const { data: aportes = [] } = useAportes(verAportes ? meta.id : undefined);

  const obj = meta.montoObjetivo;
  const sinMeta = obj == null;
  const pct = obj != null && obj > 0 ? Math.min(100, Math.round((meta.montoAcumulado / obj) * 100)) : 0;
  const falta = obj != null ? Math.max(0, obj - meta.montoAcumulado) : 0;
  const ui = ESTADO_UI[meta.estado];
  const finalizada = meta.estado === 'Finalizado';

  // Proyección de cumplimiento (solo con objetivo) vs. fecha límite.
  const mesesRestantes = !sinMeta && meta.aporteMensual > 0 ? Math.ceil(falta / meta.aporteMensual) : null;
  const hoy = new Date();
  const fechaEstimada =
    sinMeta || falta <= 0
      ? null
      : mesesRestantes !== null
        ? new Date(hoy.getFullYear(), hoy.getMonth() + mesesRestantes, 1)
        : null;
  const limite = meta.fechaLimite ? new Date(`${meta.fechaLimite}T00:00:00`) : null;
  const enTiempo = fechaEstimada && limite ? fechaEstimada <= limite : null;
  const mostrarProyeccion = !sinMeta && (!!limite || !!fechaEstimada);

  return (
    <Card sx={{ p: 2.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 3, bgcolor: colors.ahorroSoft, display: 'grid', placeItems: 'center', fontSize: 20 }}>
          {meta.emoji}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: 15.5, fontWeight: 700 }}>{meta.nombre}</Box>
          <Box sx={{ fontSize: 12, color: colors.textTertiary }}>
            {sinMeta ? 'Ahorro abierto' : `Meta ${money(obj ?? 0)}`}
          </Box>
        </Box>
        <Box sx={{ fontSize: 11.5, fontWeight: 600, color: ui.fg, bgcolor: ui.bg, px: 1.25, py: 0.4, borderRadius: 20 }}>
          {ui.label}
        </Box>
        <IconButton size="small" onClick={() => setEditOpen(true)} sx={{ color: colors.textTertiary }}>
          <EditIcon sx={{ fontSize: 17 }} />
        </IconButton>
        <IconButton size="small" onClick={() => setConfirmar(true)} sx={{ color: colors.negative }}>
          <DeleteIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {sinMeta ? (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ fontSize: 22, fontWeight: 700, color: colors.ahorro }}>{money(meta.montoAcumulado)}</Box>
          <Box sx={{ fontSize: 12, color: colors.textTertiary }}>acumulado · sin meta fija</Box>
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 0.6 }}>
            <Box sx={{ fontSize: 22, fontWeight: 700, color: colors.ahorro }}>{pct}%</Box>
            <Box sx={{ fontSize: 12, color: colors.textTertiary }}>completado</Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ height: 10, '& .MuiLinearProgress-bar': { bgcolor: colors.ahorro } }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Stat label="Ahorrado" valor={money(meta.montoAcumulado)} />
        {!sinMeta && <Stat label="Falta" valor={money(falta)} />}
        <Stat label="Este mes" valor={money(meta.aporteMes ?? 0)} color={colors.ahorro} />
      </Box>

      {mostrarProyeccion && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 1.5,
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          <Box>
            {fechaEstimada ? `Estimado: ${mesAnio(fechaEstimada)}` : 'Estimado: —'}
            {limite ? ` · Límite: ${mesAnio(limite)}` : ''}
          </Box>
          {enTiempo !== null && (
            <Box
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: 20,
                fontWeight: 600,
                fontSize: 11.5,
                color: enTiempo ? colors.positive : colors.negative,
                bgcolor: enTiempo ? colors.positiveSoft : colors.negativeSoft,
              }}
            >
              {enTiempo ? 'En tiempo' : 'Atrasada'}
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAporteOpen(true)}
          sx={{ borderColor: colors.ahorro, color: colors.ahorro }}
        >
          Aportar
        </Button>
        <Button size="small" color="inherit" onClick={() => setVerAportes((v) => !v)}>
          {verAportes ? 'Ocultar aportes' : 'Ver aportes'}
        </Button>
      </Box>

      {verAportes && (
        <Box sx={{ mb: 1.5 }}>
          {aportes.length === 0 ? (
            <Box sx={{ fontSize: 12.5, color: colors.textTertiary }}>Aún no hay aportes registrados.</Box>
          ) : (
            aportes.map((a) => (
              <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4, fontSize: 13 }}>
                <Box sx={{ color: colors.textTertiary, width: 44 }}>{fechaCorta(a.fecha)}</Box>
                <Box sx={{ flex: 1, minWidth: 0, color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.descripcion || '—'}
                </Box>
                <Box sx={{ fontWeight: 600 }}>{money(a.monto)}</Box>
              </Box>
            ))
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.5,
          borderTop: `1px solid ${colors.borderSoft}`,
        }}
      >
        <Box sx={{ fontSize: 12, color: colors.textSecondary }}>
          {meta.activo ? 'Aportes activos' : 'Aportes en pausa'}
        </Box>
        <Switch
          size="small"
          checked={meta.activo}
          disabled={finalizada || toggle.isPending}
          onChange={(e) => toggle.mutate({ id: meta.id, activo: e.target.checked })}
        />
      </Box>

      {aporteOpen && <AporteDialog open={aporteOpen} onClose={() => setAporteOpen(false)} meta={meta} />}
      {editOpen && <MetaDialog open={editOpen} onClose={() => setEditOpen(false)} meta={meta} />}
      <ConfirmDialog
        open={confirmar}
        title="Eliminar meta"
        message={`¿Eliminar "${meta.nombre}"? Se quitará de tus ahorros (los aportes quedan en el historial).`}
        loading={eliminar.isPending}
        onClose={() => setConfirmar(false)}
        onConfirm={async () => {
          await eliminar.mutateAsync(meta.id);
          setConfirmar(false);
        }}
      />
    </Card>
  );
}
