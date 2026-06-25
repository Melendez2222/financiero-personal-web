# Mis Cuentas — Frontend

Frontend de la app de contabilidad personal (moneda base **S/** Sol peruano). Construido con
**React + TypeScript + Vite + MUI + MUI X Charts + TanStack Query + React Router + axios**.

Funciona **sin backend** gracias a una capa de mocks (MSW) con datos en memoria. El día que exista
el backend ASP.NET Core, solo se cambia una variable de entorno.

## Requisitos
- Node 20+ (probado con Node 22).

## Puesta en marcha
```bash
npm install
cp .env.example .env   # ajusta si hace falta
npm run dev            # http://localhost:5173
```
Inicia sesión con el usuario demo: **ana@correo.com** / **123456** (también `luis@correo.com`).

## Scripts
- `npm run dev` — servidor de desarrollo.
- `npm run build` — type-check (`tsc -b`) + build de producción.
- `npm run preview` — sirve el build.
- `npm run lint` — oxlint.

## Variables de entorno
| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend (sin barra final). Ej: `http://localhost:5080/api`. |
| `VITE_USE_MOCKS` | `true` usa la capa MSW (sin backend). `false` apunta a `VITE_API_URL`. |

## Pasar a backend real
La capa axios (`src/api/`) ya hace las llamadas REST reales. MSW solo las intercepta en desarrollo.
Para conectar el backend:
1. `VITE_USE_MOCKS=false`
2. `VITE_API_URL=https://tu-backend/api`

No hay que reescribir la capa de datos. El contrato esperado está en [`api-contract.md`](./api-contract.md).

## Estructura
```
src/
  api/         cliente axios + funciones por entidad + hooks TanStack Query
  components/   ui/ (reutilizables) + layout/ (sidebar, topbar, selector de mes) + ProtectedRoute
  context/      Auth, Settings (moneda), Periodo activo
  features/     dashboard, mes, ahorros, gastos, ingresos, configuracion, auth
  mocks/        MSW: fixtures (semilla) + db (estado + cálculos) + handlers
  theme/        tokens del design handoff + tema MUI
  types/        modelo del dominio (Periodo, Categoria, Movimiento, MetaAhorro, ...)
  lib/          format (moneda S/), queryClient, authStorage
```

## Alcance (Fase 1 + extras)
- **Fase 1 (completa):** CRUD de periodos, ingresos y gastos · panel mensual presupuesto vs. actual ·
  historiales con filtros · catálogo con activador · login.
- **Adelanto:** Dashboard (KPIs, flujo, desglose, disponible) y Ahorros y metas también funcionan.

> **Presupuesto:** el monto vive en el catálogo (global). El interruptor de cada categoría controla
> si se aplica a los **meses nuevos**; un mes ya iniciado conserva su *snapshot* de categorías.
