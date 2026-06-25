# Contrato de API — Mis Finanzas

Contrato REST que el frontend espera del backend (ASP.NET Core). Mientras no exista el backend,
la **capa mock (MSW)** en `src/mocks/` implementa exactamente estos endpoints, de modo que pasar a
producción solo requiere apagar `VITE_USE_MOCKS` y apuntar `VITE_API_URL` al servidor real.

## Convenciones

- **Base URL:** `import.meta.env.VITE_API_URL` (p.ej. `http://localhost:5080/api`). Todas las rutas
  de abajo son relativas a esa base.
- **Formato:** JSON (`Content-Type: application/json`). Fechas en ISO `yyyy-MM-dd`.
- **Moneda:** montos como `number` decimal (no centavos). Moneda base PEN, símbolo `S/`.
- **IDs:** `string` (en el mock son cuid/uuid; en EF Core pueden ser `Guid` serializados como string).
- **Auth:** JWT Bearer. Header `Authorization: Bearer <token>` en todos los endpoints excepto
  `POST /auth/login` y `POST /auth/register`.
- **Errores:** códigos HTTP estándar + cuerpo `{ "code": string, "message": string }`.
  - `400` validación · `401` no autenticado · `403` prohibido · `404` no encontrado · `409` conflicto.

## Enums

```
Tipo           = "Ingreso" | "Fijo" | "Necesario" | "Deuda" | "Ahorro"
EstadoMeta     = "NoIniciado" | "Pendiente" | "Iniciado" | "Suspendido" | "Finalizado"
EstadoPeriodo  = "Borrador" | "Iniciado" | "Cerrado"
```

---

## 1. Auth

### POST /auth/login
Request:
```json
{ "email": "ana@correo.com", "password": "secreta" }
```
Response `200`:
```json
{ "token": "jwt...", "usuario": { "id": "u1", "email": "ana@correo.com", "nombre": "Ana" } }
```
Errores: `401 { code: "credenciales_invalidas" }`.

### POST /auth/register
Alta inicial (la app es para 2 personas; sin roles). Request:
```json
{ "email": "ana@correo.com", "nombre": "Ana", "password": "secreta" }
```
Response `201`: igual que login (`{ token, usuario }`). Error `409 { code: "email_en_uso" }`.

### GET /auth/me
Response `200`: `{ "id": "u1", "email": "...", "nombre": "..." }`. Error `401`.

---

## 2. Categorías (catálogo — fuente única del presupuesto)

`Categoria`:
```json
{
  "id": "c1", "nombre": "Alquiler", "tipo": "Fijo", "presupuesto": 200,
  "emoji": "🏠", "fechaVencimiento": "15", "activo": true, "orden": 1
}
```
> **Regla del activador:** `activo` controla si la categoría se incluye en los periodos que se
> **inicien de aquí en adelante**. Un periodo ya `Iniciado` conserva su snapshot (ver §3), así que
> desactivar una categoría no la elimina del mes en curso.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categorias?tipo={Tipo}` | Lista (filtro opcional por tipo). `200 Categoria[]` |
| GET | `/categorias/{id}` | `200 Categoria` / `404` |
| POST | `/categorias` | Crea. Body `CrearCategoriaRequest`. `201 Categoria` |
| PUT | `/categorias/{id}` | Actualiza. Body `ActualizarCategoriaRequest`. `200 Categoria` |
| PATCH | `/categorias/{id}/activo` | Body `{ "activo": boolean }`. `200 Categoria` |
| DELETE | `/categorias/{id}` | `204`. `409` si tiene movimientos (sugerir desactivar). |

```
CrearCategoriaRequest      { nombre, tipo, presupuesto, emoji?, fechaVencimiento?, activo? }
ActualizarCategoriaRequest { nombre?, presupuesto?, emoji?, fechaVencimiento?, activo? }
```

---

## 3. Periodos (meses)

`Periodo`:
```json
{
  "id": "p1", "anio": 2026, "mes": 6, "fechaInicio": "2026-06-01", "fechaFin": "2026-06-30",
  "moneda": "PEN", "balanceInicial": 0, "estado": "Iniciado"
}
```

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/periodos` | `200 Periodo[]` (orden desc por año/mes). |
| GET | `/periodos/{id}` | `200 Periodo` / `404` |
| POST | `/periodos` | Crea un mes. Body `CrearPeriodoRequest`. `201 Periodo` |
| PUT | `/periodos/{id}` | Body `ActualizarPeriodoRequest`. `200 Periodo` |
| POST | `/periodos/{id}/iniciar` | Cambia estado a `Iniciado` y **toma snapshot** de las categorías activas en `PeriodoCategoria`. `200 Periodo` |
| GET | `/periodos/{id}/resumen` | Datos del Panel del mes (ver abajo). `200 ResumenPeriodo` |

```
CrearPeriodoRequest      { anio, mes, balanceInicial?, moneda?, heredarBalance? }
ActualizarPeriodoRequest { balanceInicial?, moneda?, estado? }
```
> Al **crear** un periodo se generan sus `PeriodoCategoria` a partir de las categorías activas
> (presupuesto copiado). Si `heredarBalance=true`, `balanceInicial` = balance final del periodo
> anterior. Los periodos no se borran (histórico permanente).

### GET /periodos/{id}/resumen → `ResumenPeriodo`
```json
{
  "periodo": { /* Periodo */ },
  "secciones": [
    {
      "tipo": "Fijo",
      "lineas": [
        { "categoriaId": "c1", "nombre": "Alquiler", "tipo": "Fijo",
          "montoPresupuestado": 200, "actual": 200, "queda": 0,
          "fechaVencimiento": "15", "emoji": "🏠" }
      ],
      "totalPresupuestado": 905, "totalActual": 911.78
    }
  ],
  "flujo": {
    "balanceInicial": 0,
    "ingresosPresupuesto": 2100, "ingresosActual": 2100,
    "fijosPresupuesto": 905, "fijosActual": 911.78,
    "necesariosPresupuesto": 240, "necesariosActual": 83.10,
    "deudasPresupuesto": 160, "deudasActual": 160.44,
    "ahorrosPresupuesto": 450, "ahorrosActual": 0,
    "totalRestante": 209.68
  },
  "disponible": 575
}
```

---

## 4. Movimientos (transacciones)

`Movimiento`:
```json
{ "id": "m1", "periodoId": "p1", "categoriaId": "c1", "tipo": "Fijo",
  "fecha": "2026-06-24", "monto": 200, "nota": "Pago alquiler" }
```
> `monto` siempre positivo; el signo en la UI se deriva del tipo (Ingreso = +, gastos = −).

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/movimientos?periodoId=&tipo=&categoriaId=&desde=&hasta=&q=` | Lista filtrada. `200 Movimiento[]` |
| GET | `/movimientos/{id}` | `200 Movimiento` / `404` |
| POST | `/movimientos` | Body `CrearMovimientoRequest`. `201 Movimiento` |
| PUT | `/movimientos/{id}` | Body `ActualizarMovimientoRequest`. `200 Movimiento` |
| DELETE | `/movimientos/{id}` | `204` |

```
CrearMovimientoRequest      { periodoId, categoriaId, tipo, fecha, monto, nota? }
ActualizarMovimientoRequest { categoriaId?, tipo?, fecha?, monto?, nota? }
```
Query params todos opcionales: `q` busca en nota; `desde`/`hasta` filtran por fecha.

---

## 5. Metas de ahorro (Fase 3 — contrato documentado)

`MetaAhorro`:
```json
{ "id": "g1", "nombre": "Mudanza", "emoji": "📦", "montoObjetivo": 3000,
  "aporteMensual": 200, "montoAcumulado": 1800, "aporteMes": 0,
  "fechaLimite": null, "estado": "Iniciado", "activo": true }
```

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/metas` | `200 MetaAhorro[]` (incluye `aporteMes` del periodo activo si se pasa `?periodoId=`). |
| POST | `/metas` | Body `CrearMetaRequest`. `201 MetaAhorro` |
| PUT | `/metas/{id}` | Body `ActualizarMetaRequest`. `200 MetaAhorro` |
| PATCH | `/metas/{id}/activo` | Body `{ "activo": boolean }`. Alterna `Iniciado`⇄`Suspendido`. `200 MetaAhorro` |
| POST | `/metas/{id}/aportes` | Registra aporte. Body `AporteMetaRequest`. `201 MetaAhorro` |

```
CrearMetaRequest  { nombre, emoji, montoObjetivo, aporteMensual, estado? }
AporteMetaRequest { monto, fecha, periodoId }
```
> Reglas: `pct = montoAcumulado / montoObjetivo`; al llegar a 100% `estado="Finalizado"`.

---

## 6. Configuración

`Configuracion`:
```json
{ "moneda": "PEN", "simbolo": "S/", "locale": "es-PE", "decimales": 2 }
```

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/configuracion` | `200 Configuracion` |
| PUT | `/configuracion` | Body `Configuracion`. `200 Configuracion` |

---

## 7. Dashboard (Fase 2 — contrato documentado)

### GET /dashboard?periodoId={id} → `DashboardData`
```json
{
  "kpis": {
    "ingresos": { "actual": 2100, "deltaPct": 0 },
    "fijos": { "actual": 911.78, "deltaPct": 0.7 },
    "necesarios": { "actual": 83.10, "deltaPct": -44 },
    "deudas": { "actual": 160.44, "deltaPct": 0 },
    "ahorros": { "actual": 0, "deltaPct": -100 }
  },
  "flujoMeses": [ { "mes": "Ene", "ingresos": 2100, "gastos": 1305 } ],
  "desglose": [ { "categoria": "Comida", "tipo": "Fijo", "monto": 300, "pct": 28 } ],
  "disponible": 575,
  "metas": [ { "id": "g1", "nombre": "Mudanza", "pct": 60, "actual": 1800, "objetivo": 3000 } ]
}
```

---

## Reglas de cálculo (resumen)

- **`actual` por línea** = Σ `monto` de los movimientos de esa categoría en el periodo.
- **`queda`** = `montoPresupuestado − actual`. Gasto: `>0` sobra (verde "Queda"), `<0` excede (rojo).
  Ingreso/Ahorro: igualar o superar lo planeado = favorable.
- **¿Cuánto puedes gastar?** = `ingresos − fijos − deudas − ahorro programado (Σ aporteMensual de metas activas)`.
- **Gasto restante del mes** = presupuesto total de gastos − gastos reales acumulados.
- **Progreso de meta** = `montoAcumulado / montoObjetivo`.
