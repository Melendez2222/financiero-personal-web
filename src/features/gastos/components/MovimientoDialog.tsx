import { useMemo, useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import { useCategorias } from '../../../api/hooks/useCategorias';
import { useActualizarMovimiento, useCrearMovimiento } from '../../../api/hooks/useMovimientos';
import { useMetas } from '../../../api/hooks/useMetas';
import { useUsuarios } from '../../../api/hooks/useUsuarios';
import { useAuth } from '../../../context/AuthContext';
import { TIPO_LABEL, COBERTURA_LABEL } from '../../../types/common';
import { colors } from '../../../theme/tokens';
import type { Categoria, Movimiento, Periodo, Tipo } from '../../../types';
import { categoriaDividida } from '../../../types/categoria';

interface Props {
  open: boolean;
  onClose: () => void;
  periodo: Periodo;
  tiposPermitidos: Tipo[];
  movimiento?: Movimiento | null;
}

export function MovimientoDialog({ open, onClose, periodo, tiposPermitidos, movimiento }: Props) {
  const editando = !!movimiento;
  const { data: categorias = [] } = useCategorias();
  const { data: metas = [] } = useMetas(periodo.id);
  const { data: usuarios = [] } = useUsuarios();
  const { usuario } = useAuth();
  const crear = useCrearMovimiento();
  const actualizar = useActualizarMovimiento();

  const [tipo, setTipo] = useState<Tipo>(movimiento?.tipo ?? tiposPermitidos[0]);
  const [categoriaId, setCategoriaId] = useState(movimiento?.categoriaId ?? '');
  const [concepto, setConcepto] = useState(movimiento?.concepto ?? '');
  const [monto, setMonto] = useState(movimiento ? String(movimiento.monto) : '');
  const [fecha, setFecha] = useState(movimiento?.fecha ?? periodo.fechaInicio);
  const [nota, setNota] = useState(movimiento?.nota ?? '');
  const [usuarioId, setUsuarioId] = useState(movimiento?.usuarioId ?? usuario?.id ?? '');
  const esExtra = editando && movimiento?.tipo === 'Ingreso' && !movimiento.categoriaId;
  // Para ingresos: al elegir la categoría se auto-jala su presupuesto y el monto queda bloqueado;
  // este switch lo libera para registrar un monto distinto (ej. recibí menos). Al editar, libre.
  const [montoDiferente, setMontoDiferente] = useState(editando);
  const [montoQuincena, setMontoQuincena] = useState('');
  const [montoFinDeMes, setMontoFinDeMes] = useState('');
  const [pagarDesdeAhorro, setPagarDesdeAhorro] = useState(!!movimiento?.metaId);
  const [metaId, setMetaId] = useState(movimiento?.metaId ?? '');

  const ahorros = useMemo(
    () => metas.filter((m) => m.montoObjetivo == null && m.activo),
    [metas],
  );
  const ahorroSel = useMemo(
    () => ahorros.find((m) => m.id === metaId),
    [ahorros, metaId],
  );
  const montoNum = Number(monto);
  const saldoAhorro = ahorroSel?.montoAcumulado ?? 0;
  const creditoEdicion =
    editando && movimiento?.metaId && movimiento.metaId === metaId ? movimiento.monto : 0;
  const saldoDisponible = saldoAhorro + creditoEdicion;
  const excedeSaldoAhorro =
    pagarDesdeAhorro && !!metaId && montoNum > 0 && montoNum > saldoDisponible;

  const categoriaSel = useMemo(
    () => categorias.find((c) => c.id === categoriaId),
    [categorias, categoriaId],
  );
  const esDividida = !editando && !!categoriaSel && categoriaDividida(categoriaSel);

  const esSituacional = tipo === 'Situacional';
  const esIngreso = tipo === 'Ingreso';
  const esIngresoExtra = esIngreso && esExtra;
  const montoBloqueado = esIngreso && !montoDiferente && !esIngresoExtra;

  const categoriasDelTipo = useMemo(() => {
    const inicio = periodo.fechaInicio;
    const vigente = (c: Categoria) =>
      (!c.vigenciaDesde || inicio >= c.vigenciaDesde) &&
      (!c.vigenciaHasta || inicio <= c.vigenciaHasta);
    return categorias
      .filter((c) => c.tipo === tipo)
      .filter((c) => (c.activo && vigente(c)) || c.id === movimiento?.categoriaId)
      .sort((a, b) => a.orden - b.orden);
  }, [categorias, tipo, periodo.fechaInicio, movimiento?.categoriaId]);

  const seleccionarCategoria = (id: string) => {
    setCategoriaId(id);
    const cat = categorias.find((c) => c.id === id);
    if (cat && categoriaDividida(cat)) {
      setMontoQuincena(String(cat.montoQuincena));
      setMontoFinDeMes(String(cat.montoFinDeMes));
      setMonto('');
    } else if (esIngreso && !montoDiferente && cat) {
      setMonto(String(cat.presupuesto));
      setMontoQuincena('');
      setMontoFinDeMes('');
    } else {
      setMontoQuincena('');
      setMontoFinDeMes('');
    }
    // Al crear, prefija la persona desde la categoría (respaldo: usuario en sesión).
    if (!editando && cat) setUsuarioId(cat.usuarioId ?? usuario?.id ?? '');
  };

  const cambiarMontoDiferente = (on: boolean) => {
    setMontoDiferente(on);
    if (!on) {
      // Volver al monto planeado de la categoría.
      const cat = categorias.find((c) => c.id === categoriaId);
      if (cat) setMonto(String(cat.presupuesto));
    }
  };

  const mostrarPagarDesdeAhorro = !esIngreso && !esDividida;
  const guardando = crear.isPending || actualizar.isPending;
  const valido = esSituacional || esIngresoExtra
    ? concepto.trim().length > 0 && Number(monto) > 0 && !!fecha
      && (!pagarDesdeAhorro || (!!metaId && !excedeSaldoAhorro))
    : esDividida
      ? !!categoriaId && !!fecha
        && (Number(montoQuincena) > 0 || Number(montoFinDeMes) > 0)
      : !!categoriaId && Number(monto) > 0 && !!fecha
        && (!pagarDesdeAhorro || (!!metaId && !excedeSaldoAhorro));

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    if (editando && movimiento) {
      const datos = {
        periodoId: periodo.id,
        tipo,
        fecha,
        monto: Number(monto),
        nota,
        categoriaId: esSituacional || esIngresoExtra ? null : categoriaId,
        concepto: esSituacional || esIngresoExtra ? concepto.trim() : null,
        usuarioId: usuarioId || null,
        cobertura: movimiento.cobertura ?? null,
        metaId: pagarDesdeAhorro && metaId ? metaId : null,
      };
      await actualizar.mutateAsync({ id: movimiento.id, body: datos });
    } else if (esDividida && categoriaSel) {
      const base = {
        periodoId: periodo.id,
        tipo,
        fecha,
        categoriaId: categoriaSel.id,
        nota,
        usuarioId: usuarioId || null,
      };
      const creaciones = [];
      if (Number(montoQuincena) > 0) {
        creaciones.push(
          crear.mutateAsync({ ...base, monto: Number(montoQuincena), cobertura: 'Quincena' as const }),
        );
      }
      if (Number(montoFinDeMes) > 0) {
        creaciones.push(
          crear.mutateAsync({ ...base, monto: Number(montoFinDeMes), cobertura: 'FinDeMes' as const }),
        );
      }
      await Promise.all(creaciones);
    } else {
      const datos = {
        periodoId: periodo.id,
        tipo,
        fecha,
        monto: Number(monto),
        nota,
        categoriaId: esSituacional || esIngresoExtra ? null : categoriaId,
        concepto: esSituacional || esIngresoExtra ? concepto.trim() : null,
        usuarioId: usuarioId || null,
        metaId: pagarDesdeAhorro && metaId ? metaId : null,
      };
      await crear.mutateAsync(datos);
    }
    onClose();
  };

  const cambiarTipo = (nuevo: Tipo) => {
    setTipo(nuevo);
    if (nuevo === 'Ingreso') {
      setPagarDesdeAhorro(false);
      setMetaId('');
    }
    if (nuevo !== 'Situacional') {
      const sigueValida = categorias.some((c) => c.id === categoriaId && c.tipo === nuevo);
      if (!sigueValida) setCategoriaId('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        {editando ? 'Editar movimiento' : 'Nuevo movimiento'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={enviar}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            select
            label="Tipo"
            value={tipo}
            onChange={(e) => cambiarTipo(e.target.value as Tipo)}
            size="small"
            fullWidth
            disabled={tiposPermitidos.length === 1}
          >
            {tiposPermitidos.map((t) => (
              <MenuItem key={t} value={t}>
                {TIPO_LABEL[t]}
              </MenuItem>
            ))}
          </TextField>

          {esSituacional || esIngresoExtra ? (
            <TextField
              label="Concepto"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              size="small"
              fullWidth
              required
              placeholder={esIngresoExtra ? 'Ej. Bono, Venta' : 'Ej. Reparación de laptop'}
              helperText={
                esIngresoExtra
                  ? 'Ingreso puntual fuera del catálogo.'
                  : 'Gasto imprevisto, sin categoría del catálogo.'
              }
            />
          ) : (
            <Box>
              <TextField
                select
                label="Categoría"
                value={categoriaId}
                onChange={(e) => seleccionarCategoria(e.target.value)}
                size="small"
                fullWidth
                helperText={categoriasDelTipo.length === 0 ? 'No hay categorías de este tipo.' : ' '}
              >
                {categoriasDelTipo.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.emoji ? `${c.emoji}  ` : ''}
                    {c.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <Box
                component={RouterLink}
                to="/configuracion"
                onClick={onClose}
                sx={{ fontSize: 12, color: colors.ahorro, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Gestionar en Catálogo →
              </Box>
            </Box>
          )}

          {esDividida ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Quincena (S/)"
                type="number"
                value={montoQuincena}
                onChange={(e) => setMontoQuincena(e.target.value)}
                size="small"
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
              <TextField
                label="Fin de mes (S/)"
                type="number"
                value={montoFinDeMes}
                onChange={(e) => setMontoFinDeMes(e.target.value)}
                size="small"
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
              <TextField
                label="Fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                required
                sx={{ gridColumn: '1 / -1' }}
              />
              <Box sx={{ gridColumn: '1 / -1', fontSize: 12, color: colors.textTertiary }}>
                Ingresa solo quincena, solo fin de mes, o ambos. Se registrará un movimiento por cada monto.
              </Box>
            </Box>
          ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Monto (S/)"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              required
              disabled={montoBloqueado}
              helperText={montoBloqueado ? 'Monto planeado de la categoría.' : ' '}
            />
            <TextField
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              required
            />
          </Box>
          )}

          {editando && movimiento?.cobertura && (
            <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>
              Bolsa: {COBERTURA_LABEL[movimiento.cobertura]}
            </Box>
          )}

          {esIngreso && !esIngresoExtra && !esDividida && (
            <FormControlLabel
              control={
                <Switch
                  checked={montoDiferente}
                  onChange={(e) => cambiarMontoDiferente(e.target.checked)}
                  size="small"
                />
              }
              label="Recibí un monto diferente al planeado"
              sx={{ mt: -1, '& .MuiFormControlLabel-label': { fontSize: 13 } }}
            />
          )}

          {mostrarPagarDesdeAhorro && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={pagarDesdeAhorro}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setPagarDesdeAhorro(on);
                      if (!on) setMetaId('');
                      else if (!metaId && ahorros.length === 1) setMetaId(ahorros[0].id);
                    }}
                    size="small"
                  />
                }
                label="Pagar desde un ahorro"
                sx={{ mt: -1, '& .MuiFormControlLabel-label': { fontSize: 13 } }}
              />
              {pagarDesdeAhorro && (
                <TextField
                  select
                  label="Ahorro"
                  value={metaId}
                  onChange={(e) => setMetaId(e.target.value)}
                  size="small"
                  fullWidth
                  required
                  helperText={
                    excedeSaldoAhorro
                      ? `Saldo insuficiente (disponible: S/ ${saldoDisponible.toFixed(2)})`
                      : ahorroSel
                        ? `Saldo disponible: S/ ${saldoDisponible.toFixed(2)}`
                        : ahorros.length === 0
                          ? 'No hay ahorros activos. Crea uno en Ahorros.'
                          : 'Selecciona el ahorro que financiará este gasto.'
                  }
                  slotProps={
                    excedeSaldoAhorro
                      ? { formHelperText: { sx: { color: colors.negative } } }
                      : undefined
                  }
                >
                  {ahorros.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.emoji ? `${a.emoji}  ` : ''}
                      {a.nombre} (S/ {a.montoAcumulado.toFixed(2)})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </>
          )}

          <TextField
            select
            label="Persona"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            size="small"
            fullWidth
            helperText="A quién se atribuye este movimiento. Opcional."
          >
            <MenuItem value="">— sin asignar —</MenuItem>
            {usuarios.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={esIngreso && montoDiferente ? 'Motivo / nota' : 'Nota (opcional)'}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            size="small"
            fullWidth
            placeholder={esIngreso && montoDiferente ? 'Ej. recibí menos por tardanza' : undefined}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!valido || guardando}>
            {guardando ? 'Guardando…' : 'Guardar movimiento'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
