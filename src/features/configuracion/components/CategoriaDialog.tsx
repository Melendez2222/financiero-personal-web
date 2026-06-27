import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Checkbox,
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
import { useActualizarCategoria, useCrearCategoria } from '../../../api/hooks/useCategorias';
import { useUsuarios } from '../../../api/hooks/useUsuarios';
import {
  COBERTURA_LABEL,
  COBERTURAS,
  ESTADO_DEUDA_LABEL,
  ESTADOS_DEUDA,
  MESES,
  TIPO_DEUDA_LABEL,
  TIPO_LABEL_PLURAL,
  TIPOS_DEUDA,
} from '../../../types/common';
import type { Categoria, CoberturaIngreso, EstadoDeuda, Tipo, TipoDeuda } from '../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  tipo: Tipo;
  categoria?: Categoria | null;
}

function etiquetaPresupuesto(tipo: Tipo): string {
  if (tipo === 'Ingreso') return 'Monto presupuestado (S/)';
  if (tipo === 'Ahorro') return 'Aporte mensual (S/)';
  return 'Presupuesto mensual (S/)';
}

/** 'YYYY-MM-DD' → { anio, mes } (strings); vacío si no hay fecha. */
function parseYM(s?: string | null): { anio: string; mes: string } {
  if (!s) return { anio: '', mes: '' };
  const [y, m] = s.split('-');
  return { anio: y, mes: String(Number(m)) };
}

/** { anio, mes } → 'YYYY-MM-01'; null si falta alguno. */
function aFecha(anio: string, mes: string): string | null {
  if (!anio || !mes) return null;
  return `${anio}-${String(Number(mes)).padStart(2, '0')}-01`;
}

export function CategoriaDialog({ open, onClose, tipo, categoria }: Props) {
  const editando = !!categoria;
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const { data: usuarios = [] } = useUsuarios();

  const [nombre, setNombre] = useState(categoria?.nombre ?? '');
  const [presupuesto, setPresupuesto] = useState(categoria ? String(categoria.presupuesto) : '');
  const [emoji, setEmoji] = useState(categoria?.emoji ?? '');
  const [fechaVencimiento, setFechaVencimiento] = useState(categoria?.fechaVencimiento ?? '');
  const [cuotasRestantes, setCuotasRestantes] = useState(
    categoria?.cuotasRestantes != null ? String(categoria.cuotasRestantes) : '',
  );
  const [montoTotal, setMontoTotal] = useState(
    categoria?.montoTotal != null ? String(categoria.montoTotal) : '',
  );
  const [tieneInteres, setTieneInteres] = useState(categoria?.capitalPorCuota != null);
  const [capitalPorCuota, setCapitalPorCuota] = useState(
    categoria?.capitalPorCuota != null ? String(categoria.capitalPorCuota) : '',
  );
  const [tipoDeuda, setTipoDeuda] = useState<TipoDeuda>(categoria?.tipoDeuda ?? 'Prestamo');
  const [estadoDeuda, setEstadoDeuda] = useState<EstadoDeuda>(categoria?.estadoDeuda ?? 'Pendiente');
  const [usuarioId, setUsuarioId] = useState(categoria?.usuarioId ?? '');
  const [cobertura, setCobertura] = useState<'' | CoberturaIngreso>(categoria?.cobertura ?? '');
  const vigIni = parseYM(categoria?.vigenciaDesde);
  const vigFin = parseYM(categoria?.vigenciaHasta);
  const [vigenciaSiempre, setVigenciaSiempre] = useState(
    !(categoria?.vigenciaDesde || categoria?.vigenciaHasta),
  );
  const [desdeMes, setDesdeMes] = useState(vigIni.mes);
  const [desdeAnio, setDesdeAnio] = useState(vigIni.anio);
  const [hastaMes, setHastaMes] = useState(vigFin.mes);
  const [hastaAnio, setHastaAnio] = useState(vigFin.anio);
  const [activo, setActivo] = useState(categoria?.activo ?? true);

  // Cobertura (quincena/fin de mes): ingresos y gastos fijos/necesarios. Vigencia: solo gastos.
  const usaCobertura = tipo === 'Ingreso' || tipo === 'Fijo' || tipo === 'Necesario';
  const usaVigencia = tipo === 'Fijo' || tipo === 'Necesario';
  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 7 }, (_, i) => anioActual - 1 + i);

  const guardando = crear.isPending || actualizar.isPending;
  const valido = nombre.trim().length > 0 && Number(presupuesto) >= 0;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    const base = {
      nombre: nombre.trim(),
      presupuesto: Number(presupuesto),
      emoji: emoji || undefined,
      fechaVencimiento: fechaVencimiento || undefined,
      cuotasRestantes: tipo === 'Deuda' && cuotasRestantes !== '' ? Number(cuotasRestantes) : null,
      montoTotal: tipo === 'Deuda' && montoTotal !== '' ? Number(montoTotal) : null,
      capitalPorCuota:
        tipo === 'Deuda' && tieneInteres && capitalPorCuota !== '' ? Number(capitalPorCuota) : null,
      tipoDeuda: tipo === 'Deuda' ? tipoDeuda : null,
      usuarioId: usuarioId || null,
      cobertura: usaCobertura ? (cobertura || null) : null,
      vigenciaDesde: usaVigencia && !vigenciaSiempre ? aFecha(desdeAnio, desdeMes) : null,
      vigenciaHasta: usaVigencia && !vigenciaSiempre ? aFecha(hastaAnio, hastaMes) : null,
      // Solo se envía para deudas; en otros tipos queda undefined y el backend no lo toca.
      estadoDeuda: tipo === 'Deuda' ? estadoDeuda : undefined,
      activo,
    };
    if (editando && categoria) {
      await actualizar.mutateAsync({ id: categoria.id, body: base });
    } else {
      await crear.mutateAsync({ ...base, tipo });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        {editando ? 'Editar categoría' : `Agregar a ${TIPO_LABEL_PLURAL[tipo]}`}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={enviar}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 2 }}>
            <TextField
              label="Ícono"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              size="small"
              placeholder="🏠"
              slotProps={{ htmlInput: { maxLength: 2, style: { textAlign: 'center', fontSize: 18 } } }}
            />
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              size="small"
              fullWidth
              required
              autoFocus
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label={etiquetaPresupuesto(tipo)}
              type="number"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              required
            />
            <TextField
              label="Día de vencimiento"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              size="small"
              placeholder="15"
              slotProps={{ htmlInput: { maxLength: 2 } }}
            />
          </Box>

          {tipo === 'Deuda' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                select
                label="Tipo de deuda"
                value={tipoDeuda}
                onChange={(e) => setTipoDeuda(e.target.value as TipoDeuda)}
                size="small"
                fullWidth
              >
                {TIPOS_DEUDA.map((t) => (
                  <MenuItem key={t} value={t}>
                    {TIPO_DEUDA_LABEL[t]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Estado"
                value={estadoDeuda}
                onChange={(e) => setEstadoDeuda(e.target.value as EstadoDeuda)}
                size="small"
                fullWidth
                helperText="Solo las iniciadas cuentan en el mes."
              >
                {ESTADOS_DEUDA.map((s) => (
                  <MenuItem key={s} value={s}>
                    {ESTADO_DEUDA_LABEL[s]}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          {tipo === 'Deuda' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Monto total (S/)"
                type="number"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value)}
                size="small"
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                helperText="Total de la deuda."
              />
              <TextField
                label="Número de cuotas (plazo)"
                type="number"
                value={cuotasRestantes}
                onChange={(e) => setCuotasRestantes(e.target.value)}
                size="small"
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                helperText="Total de cuotas (ej. 48)."
              />
            </Box>
          )}

          {tipo === 'Deuda' && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tieneInteres}
                    onChange={(e) => setTieneInteres(e.target.checked)}
                    size="small"
                  />
                }
                label="Esta deuda tiene interés (cuota con parte fija a capital)"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
              />
              {tieneInteres && (
                <TextField
                  label="Capital por cuota (S/)"
                  type="number"
                  value={capitalPorCuota}
                  onChange={(e) => setCapitalPorCuota(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  helperText="Valor referencial; lo podrás ajustar en cada abono."
                />
              )}
            </Box>
          )}

          {usaCobertura && (
            <TextField
              select
              label={tipo === 'Ingreso' ? 'Bolsa de este ingreso' : 'Cubierto por'}
              value={cobertura}
              onChange={(e) => setCobertura(e.target.value as '' | CoberturaIngreso)}
              size="small"
              fullWidth
              helperText={
                tipo === 'Ingreso'
                  ? 'A qué sueldo pertenece (quincena / fin de mes). Opcional.'
                  : 'Con qué sueldo se cubre este gasto. Opcional.'
              }
            >
              <MenuItem value="">— sin asignar —</MenuItem>
              {COBERTURAS.map((c) => (
                <MenuItem key={c} value={c}>
                  {COBERTURA_LABEL[c]}
                </MenuItem>
              ))}
            </TextField>
          )}

          {usaVigencia && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={vigenciaSiempre}
                    onChange={(e) => setVigenciaSiempre(e.target.checked)}
                    size="small"
                  />
                }
                label="Aplica siempre (todos los meses)"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
              />
              {!vigenciaSiempre && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <TextField
                      select
                      label="Desde mes"
                      value={desdeMes}
                      onChange={(e) => setDesdeMes(e.target.value)}
                      size="small"
                    >
                      {MESES.map((m, i) => (
                        <MenuItem key={m} value={String(i + 1)}>
                          {m}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Desde año"
                      value={desdeAnio}
                      onChange={(e) => setDesdeAnio(e.target.value)}
                      size="small"
                    >
                      {anios.map((a) => (
                        <MenuItem key={a} value={String(a)}>
                          {a}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <TextField
                      select
                      label="Hasta mes"
                      value={hastaMes}
                      onChange={(e) => setHastaMes(e.target.value)}
                      size="small"
                    >
                      {MESES.map((m, i) => (
                        <MenuItem key={m} value={String(i + 1)}>
                          {m}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Hasta año"
                      value={hastaAnio}
                      onChange={(e) => setHastaAnio(e.target.value)}
                      size="small"
                    >
                      {anios.map((a) => (
                        <MenuItem key={a} value={String(a)}>
                          {a}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <TextField
            select
            label="Persona por defecto"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            size="small"
            fullWidth
            helperText="A quién se atribuye al registrar movimientos de esta categoría. Opcional."
          >
            <MenuItem value="">— sin asignar —</MenuItem>
            {usuarios.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.nombre}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={<Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />}
            label="Activa (se aplica a los meses nuevos)"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!valido || guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
