# Mis Finanzas — Sistema de Contabilidad Personal

> Documento base de concepto. Define el propósito, el alcance y las funcionalidades del sistema. Sirve como referencia única para el desarrollo del backend, el frontend y el diseño.

---

## 1. Propósito

Una aplicación web personal para llevar el control mensual del dinero: cuánto entra, cuánto sale, en qué se gasta, cuánto se ahorra y cuánto se debe. La idea central es comparar lo **presupuestado** contra lo **real** en cada categoría, mes a mes, y tener un histórico consultable.

Está inspirada en una hoja de cálculo de presupuesto mensual, pero llevada a una app con base de datos, gráficos interactivos y la posibilidad de navegar entre meses sin duplicar plantillas a mano.

**Para quién:** uso personal (un solo usuario al inicio). No es un sistema contable empresarial ni maneja facturación, impuestos ni conciliación bancaria.

---

## 2. Alcance

### Sí incluye
- Registro de ingresos, gastos y deudas por mes.
- Presupuesto por categoría y seguimiento de lo realmente gastado.
- Metas de ahorro con progreso.
- Dashboard general y panel mensual con gráficos.
- Histórico navegable por mes y año.

### No incluye (por ahora)
- Multiusuario / cuentas compartidas.
- Conexión automática con bancos.
- Manejo de impuestos o contabilidad formal.
- App móvil nativa (es web responsive).

---

## 3. Stack tecnológico

| Capa | Tecnología | Dónde se publica |
|------|------------|------------------|
| Frontend | React + TypeScript + Vite + MUI + MUI X Charts + TanStack Query | Cloudflare Pages (gratis) |
| Backend | ASP.NET Core 9 Web API + EF Core 9 + Npgsql | Render (free web service, Docker) |
| Base de datos | PostgreSQL | Neon (free, persistente) |

> El frontend se desarrolla en VS Code y el backend en Visual Studio 2026, como proyectos y repositorios separados. La comunicación es vía API REST sobre HTTPS (con CORS configurado en el backend). La moneda base es el Sol peruano (S/), con el símbolo y formato configurables.

---

## 4. Conceptos del dominio

El sistema gira en torno a un **periodo mensual**. Cada mes agrupa toda la información financiera de ese rango de fechas.

- **Periodo (Mes):** unidad principal. Tiene fecha de inicio, fecha de fin, moneda y un balance inicial heredado del mes anterior.
- **Ingreso:** dinero que entra (sueldo, extras). Tiene monto presupuestado y monto real.
- **Gasto:** dinero que sale. Se clasifica por **tipo** y por **categoría**.
  - **Gasto fijo:** recurrente y previsible (luz, agua, internet, comida, pasajes).
  - **Gasto necesario / variable:** puntual del mes (compras, regalos, delivery).
- **Deuda:** pagos a terceros o tarjetas (ej. cuotas de tarjeta), con su presupuesto y avance.
- **Ahorro:** dinero apartado, asociado opcionalmente a una **meta**.
- **Meta de ahorro:** objetivo con monto destino y progreso (ej. mudanza, cama, colchón).
- **Categoría:** etiqueta reutilizable para clasificar gastos e ingresos y poder desglosar.
- **Transacción / Registro:** cada movimiento concreto con fecha, categoría, monto y notas. Las transacciones alimentan los totales "reales" de cada categoría.

**Idea clave — Presupuesto vs. Actual:** para cada línea (ingreso, gasto, deuda, ahorro) se define un monto presupuestado y se acumula el monto realmente registrado. El sistema calcula automáticamente la diferencia ("queda" / sobrante o exceso).

---

## 5. Funcionalidades por módulo

### 5.1 Dashboard general
Vista de entrada con el panorama global (no solo del mes actual).
- KPIs principales: ingresos, gastos fijos, gastos necesarios, deudas y ahorros del periodo activo.
- Indicador de **"cuánto puedes gastar"**: dinero disponible tras descontar gastos comprometidos y ahorros.
- Gráfico de flujo de dinero (entradas vs. salidas).
- Gráfico de presupuesto vs. actual por tipo de gasto.
- Resumen de progreso de metas de ahorro.
- Selector para cambiar el periodo (mes) que se está viendo.

### 5.2 Panel de administración por mes
Vista detallada de un mes específico (equivalente a la hoja de la imagen de referencia). Reúne en un solo lugar:
- Resumen del periodo: fechas, moneda, balance inicial.
- **Resumen de flujo de dinero:** balance inicial, ingresos, gastos, ahorros, deudas, gasto restante (presupuesto vs. actual).
- **Resumen de ingresos:** cada fuente con presupuesto y actual.
- **Resumen de gastos fijos:** categoría, fecha, presupuesto, actual y cuánto queda.
- **Resumen de gastos necesarios:** mismo esquema, para gastos variables.
- **Resumen de deudas:** cada deuda con presupuesto, pagado y saldo.
- **Resumen de ahorros:** lo apartado vs. lo planeado.
- **Desglose de gastos:** tabla y gráfico de torta por categoría con porcentajes.
- Posibilidad de **crear un nuevo mes** copiando la estructura del anterior (categorías y presupuestos) para no empezar de cero.

### 5.3 Ahorros y metas
- Crear metas con nombre, monto objetivo y fecha límite opcional.
- Registrar aportes a cada meta.
- Ver progreso (monto acumulado, porcentaje y cuánto falta).
- Estado visual de cada meta (en progreso / cumplida).

### 5.4 Historial de gastos
- Lista de todos los gastos registrados, filtrable por mes, categoría y tipo (fijo / necesario).
- Búsqueda por nota o monto.
- Cada registro: fecha, categoría, monto, notas.
- Acciones: crear, editar, eliminar.
- Totales y desglose por categoría del rango filtrado.

### 5.5 Historial de ingresos
- Lista de todos los ingresos, filtrable por mes y categoría.
- Cada registro: fecha, fuente/categoría, monto, notas.
- Acciones: crear, editar, eliminar.
- Comparación de ingreso presupuestado vs. recibido.

---

## 6. Cálculos y métricas clave

- **Total por categoría (actual):** suma de las transacciones registradas en esa categoría dentro del periodo.
- **Diferencia / queda:** presupuesto − actual (positivo = sobra, negativo = exceso).
- **Cuánto puedes gastar:** balance inicial + ingresos reales − gastos fijos comprometidos − ahorros planeados − deudas.
- **Gasto restante del mes:** presupuesto total de gastos − gastos reales acumulados.
- **Porcentaje de desglose:** participación de cada categoría sobre el total de gastos.
- **Progreso de meta:** aportes acumulados / monto objetivo.
- **Tasa de ahorro:** ahorros / ingresos del periodo.

---

## 7. Modelo de datos (conceptual)

Entidades y relaciones principales (a refinar al implementar EF Core):

- **Periodo** (1) ──< **Ingreso** (N)
- **Periodo** (1) ──< **Gasto** (N) — con campo `tipo` (Fijo / Necesario)
- **Periodo** (1) ──< **Deuda** (N)
- **Periodo** (1) ──< **Ahorro** (N)
- **Categoria** (1) ──< **Gasto / Ingreso** (N)
- **MetaAhorro** (1) ──< **Ahorro** (N) *(aporte hacia la meta)*

Campos comunes de las líneas financieras: `nombre`, `categoriaId`, `montoPresupuestado`, `montoActual` (calculado o acumulado), `fecha`, `notas`.

> Nota de diseño: conviene separar la **línea presupuestada** (lo planeado para la categoría en el mes) de las **transacciones** (cada movimiento real). El "actual" de una línea es la suma de sus transacciones.

---

## 8. Pantallas y navegación

1. **Dashboard general** (inicio)
2. **Panel del mes** (detalle del periodo seleccionado)
3. **Ahorros y metas**
4. **Historial de gastos**
5. **Historial de ingresos**
6. **Configuración** (moneda, categorías, crear/cerrar mes)

Navegación lateral persistente + selector de periodo (mes/año) siempre visible en la barra superior.

---

## 9. Roadmap por fases

**Fase 1 — MVP**
- CRUD de periodos, ingresos y gastos.
- Panel mensual básico con totales y presupuesto vs. actual.
- Historiales de gastos e ingresos con filtros.

**Fase 2 — Visualización**
- Dashboard general con KPIs y gráficos (flujo, desglose, presupuesto vs. actual).
- Desglose por categoría con torta.

**Fase 3 — Ahorros y metas**
- Metas con progreso y aportes.
- Resumen de ahorros en el dashboard.

**Fase 4 — Comodidades**
- Crear mes nuevo copiando estructura del anterior.
- Categorías personalizables.
- Autenticación (login) si se quiere proteger el acceso.

---

## 10. Consideraciones técnicas

- **Moneda:** Sol peruano (S/) como base; formato y símbolo configurables.
- **Multi-mes:** los periodos no se borran; el histórico es permanente.
- **Balance encadenado:** el balance final de un mes alimenta el inicial del siguiente.
- **CORS:** el backend (Render) debe permitir el dominio del frontend (Cloudflare Pages).
- **Variables de entorno:** connection string y secretos viven en Render; la URL de la API vive como variable en el build del frontend (`VITE_API_URL`).
- **Migraciones:** el esquema se versiona con EF Core migrations; el Postgres local (Docker) y el de Neon comparten el mismo esquema.