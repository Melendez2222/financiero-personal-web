Vamos a construir el FRONTEND de una app de contabilidad personal. Lee el archivo
concepto-app-gastos.md en la raíz: ahí está el propósito, los módulos y el modelo
de datos. Respétalo como fuente de verdad.

Stack obligatorio:
- React + TypeScript con Vite (no Create React App)
- Material UI (MUI) como sistema de componentes
- MUI X Charts para gráficos (torta, barras)
- TanStack Query para data fetching y caché
- React Router para navegación
- axios para las llamadas HTTP
- La URL del backend se lee de import.meta.env.VITE_API_URL

Arquitectura del proyecto:
- Estructura por features: /features/dashboard, /features/mes, /features/ahorros,
  /features/gastos, /features/ingresos
- Una capa /api con el cliente axios y los hooks de TanStack Query por entidad
- Tipos TypeScript en /types que reflejen el modelo del concepto (Periodo, Ingreso,
  Gasto, Deuda, Ahorro, MetaAhorro, Categoria, Transaccion)
- Un layout con barra lateral de navegación y un selector de mes/año siempre visible arriba

Pantallas (según el concepto): Dashboard general, Panel del mes, Ahorros y metas,
Historial de gastos, Historial de ingresos, Configuración.

El backend aún no existe; lo haré en ASP.NET Core 9 aparte. Por ahora:
1. Define el contrato de la API REST que esperas (endpoints, métodos, DTOs de
   request/response) y documéntalo en un archivo api-contract.md.
2. Crea una capa de mock/fixtures para que el frontend funcione sin backend real,
   pero diseñada para reemplazarse fácil por las llamadas axios reales.

Empieza por la Fase 1 del roadmap (CRUD de periodos, ingresos y gastos + panel
mensual con presupuesto vs. actual + historiales con filtros). Moneda base S/ (Sol
peruano) con formato configurable. Hazlo responsive.

Antes de escribir código, propón la estructura de carpetas y el contrato de la API,
y espera mi confirmación.