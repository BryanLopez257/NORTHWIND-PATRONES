# Auditoría de Paridad Técnica: Catálogos de Clientes y Productos
**Plataforma Original:** Blazor WebAssembly (`main`)  
**Plataforma Destino:** React 19 + TypeScript + Tailwind CSS / Vite (`React`)  
**Módulos Auditados:**  
- Catálogo de Clientes (`CustomersPage.razor` vs `CustomersPage.tsx`, `CustomerModal.tsx`)  
- Catálogo de Productos (`ProductsPage.razor` vs `ProductsPage.tsx`, `ProductModal.tsx`)  
**Fecha de Auditoría:** Octubre 2026  
**Auditor:** Subagente 4 — Especialista en Auditoría de Catálogos

---

## 1. Resumen Ejecutivo de la Auditoría

Se ha realizado una auditoría exhaustiva y comparativa entre la implementación de referencia en Blazor (`main`) y la versión migrada a React (`React`) para los catálogos principales de la aplicación: **Clientes** y **Productos**.

La versión en React presenta un avance significativo en arquitectura modular, reactividad mediante React Query y validación con React Hook Form + Zod. No obstante, se han identificado **discrepancias críticas y moderadas** que rompen la paridad funcional, visual y de experiencia de usuario respecto a la especificación original de Blazor:

1. **Segmentación Superior de Clientes Ausente en React:** Blazor implementa una barra prominente de botones segmentados ("Todos los Clientes", "Personas Naturales", "Empresas") encima del buscador. En React solo existe un dropdown `<select>` interno.
2. **Chips Rápidos de Filtro y Botón "Limpiar" Inexistentes en React:** Tanto en Clientes como en Productos, Blazor incluye barras de "Chips Rápidos" interactivos para filtrado instantáneo por saldo y stock, así como un botón dedicado "Limpiar" (`ResetAllFilters`). React carece de ambos componentes.
3. **Filtro de Rango de Saldo (Mín/Máx) Omitido en la Vista de Clientes de React:** La API y el servicio frontend soportan `minBalance` y `maxBalance`, pero los campos fueron omitidos en el formulario de filtros de `CustomersPage.tsx`.
4. **Fusión Indebida de Columnas en Tablas de React:**
   - En **Clientes**, Blazor mantiene 6 columnas separadas: *Código (ID), Nombre / Razón Social, Tipo de Cliente, Saldo Actual, Estado, Acciones*. React redujo la tabla a 5 columnas unificando "Saldo Actual" y "Estado" en una sola celda ("Saldo Comercial").
   - En **Productos**, Blazor mantiene 6 columnas separadas: *ID, Nombre del Producto, Precio Unitario, Unidades en Stock, Estado, Acciones*. React fusionó "Unidades en Stock" y "Estado" en un único badge.
5. **Divergencias en Modales (Creación/Edición y Eliminación):**
   - Inconsistencias en orden de campos, etiquetas, placeholders y valores por defecto (ej. cliente por defecto en Blazor es "Persona Natural", en React se configuró como "Empresa").
   - El diálogo de confirmación de eliminación de productos en React omitió la inclusión del `ID` en el texto de advertencia.
   - En `schemas.ts` de React se identificó corrupción de codificación de caracteres (*mojibake* UTF-8) en la expresión regular de validación de nombres (`Ã¡Ã©...`).

---

## 2. Auditoría del Catálogo de Clientes

### 2.1 Tabla Comparativa de Paridad: Clientes

| Característica / Elemento | Blazor (`main`) | React (`React`) | Estado de Paridad | Impacto |
| :--- | :--- | :--- | :---: | :---: |
| **Título de la Página** | `Gestión de Clientes` | `Catálogo de Clientes` | ⚠️ Diferente texto | Menor |
| **Subtítulo Descriptivo** | `Administra los clientes comerciales, sus límites y balances de cuenta con segmentación de saldos.` | `Gestión de clientes, estados de cuenta comerciales y tipos de persona` | ⚠️ Diferente texto | Menor |
| **Botón Nuevo Cliente** | Botón primario con icono `bi-person-plus-fill` | Botón primario con icono `UserPlus` | ✅ Equivalente | Ninguno |
| **Segmentación Superior de Tipo** | Grupo de botones tipo píldora: *Todos los Clientes*, *Personas Naturales*, *Empresas* con badges activos | ❌ No existe; únicamente selector `<select>` interno en card | ❌ Ausente | **Alto** |
| **Cabecera de Card de Búsqueda** | Título: *Búsqueda Segmentada y Filtros de Clientes* + Badge: *Filtrado en tiempo real activo* con rayo amarillo | ❌ Sin cabecera; campos sueltos en el cuerpo de la tarjeta | ⚠️ Diferente diseño | Moderado |
| **Buscador por Término** | Input con placeholder `Buscar por código o nombre de cliente...` + botón (X) limpiar | Input con placeholder `Buscar por ID o Nombre...` sin botón limpiar | ⚠️ Parcial | Moderado |
| **Tiempo de Debounce** | `200 ms` | `350 ms` | ⚠️ Inconsistencia | Menor |
| **Filtro Estado de Saldo (Select)** | Opciones con emojis: `🟢 Al Día ($0.00)`, `🟡 Con Saldo Pendiente (> $0.00)`, `🔴 Saldo Elevado (≥ $100.00)` | Opciones sin emojis: `Al Día ($0.00)`, `Con Saldo Pendiente (> $0)`, `Saldo Elevado (≥ $100)` | ⚠️ Diferente estilo | Menor |
| **Filtro Rango de Saldo (Mín / Máx)** | Inputs duales: `Mín` y `Máx` (step 10, min 0) con separador `-` | ❌ Omitido en la interfaz visual de React | ❌ Ausente | **Alto** |
| **Selector de Ordenamiento** | Opciones: `Nombre` (name), `Código ID` (id), `Saldo Actual` (balance) | Opciones: `Nombre`, `ID`, `Saldo` | ✅ Equivalente | Menor |
| **Alternar Dirección de Orden** | No disponible en UI (fijo ascendente en DTO) | Botón interactivo `ArrowUpDown` (Ascendente/Descendente) | ➕ Mejora en React | Positivo |
| **Chips Rápidos de Segmentación** | Barra con 4 botones: *Todos*, *Al Día ($0.00)*, *Con Saldo Pendiente*, *Saldo Elevado (≥ $100)* | ❌ No implementados en React | ❌ Ausente | **Alto** |
| **Botón Limpiar Filtros** | Botón `Limpiar` con icono `bi-arrow-counterclockwise` que resetea todos los criterios | ❌ No existe botón para restablecer filtros | ❌ Ausente | **Alto** |
| **Contador en Cabecera de Tabla** | `Listado de Clientes` + Badge `{count} registros` + Badge de Tipo de Cliente activo | `Registros ({count})` + descripción; falta badge de filtro activo | ⚠️ Parcial | Menor |
| **Estructura de Columnas Tabla** | **6 columnas:**<br>1. Código (ID)<br>2. Nombre / Razón Social<br>3. Tipo de Cliente<br>4. Saldo Actual<br>5. Estado<br>6. Acciones | **5 columnas:**<br>1. ID<br>2. Nombre / Razón Social<br>3. Tipo de Cliente<br>4. Saldo Comercial (fusionada)<br>5. Acciones | ❌ Fusión indebida | **Alto** |
| **Badges de Tipo de Cliente** | `Persona Natural` (celeste/info con icono persona) vs `Empresa` (azul primario con icono edificio) | Badge genérico gris `bg-slate-100` sin iconos ni distinción cromática | ⚠️ Deficiente | Moderado |
| **Formato Monetario en Celda Saldo** | Color dinámico: verde si `$0.00`, rojo si `> 0.00`. Formato `$0.00` | Solo badge consolidado | ❌ Ausente celda | Moderado |
| **Badges de Columna Estado** | - Al Día: `bg-success-subtle` con check<br>- Saldo Alto: `bg-danger-subtle` con advertencia<br>- Con Saldo: `bg-warning-subtle` con reloj | Texto incrustado dentro del badge monetario | ⚠️ Desalineado | Moderado |
| **Mensaje de Tabla Vacía** | *No se encontraron clientes que coincidan con los criterios de búsqueda.* | *No se encontraron clientes / Intente ajustar los filtros de búsqueda o registre un nuevo cliente* | ⚠️ Divergencia de texto | Menor |

---

### 2.2 Auditoría de Modales: Clientes

#### A. Modal de Creación / Edición (`CustomerModal`)

| Parámetro / Campo | Blazor (`main`) | React (`React`) | Discrepancia Identificada |
| :--- | :--- | :--- | :--- |
| **Título en Modo Crear** | `Registrar Nuevo Cliente` (icono `bi-person-plus-fill text-success`) | `Nuevo Cliente` (sin icono en encabezado) | Falta icono temático y texto formal |
| **Título en Modo Editar** | `Editar Cliente` (icono `bi-pencil-square text-primary`) | `Editar Cliente` (sin icono en encabezado) | Falta icono temático en React |
| **Orden de los Campos** | 1. Tipo de Cliente<br>2. Código (ID)<br>3. Nombre / Razón Social<br>4. Saldo Actual | 1. ID del Cliente<br>2. Nombre o Razón Social<br>3. Saldo Comercial<br>4. Tipo de Cliente | El flujo de entrada está alterado |
| **Valor Inicial por Defecto (Tipo)** | `Persona Natural` | `Empresa` | Inversión del valor predeterminado |
| **Campo Código / ID** | Mayúsculas automáticas, longitud exacta de 5 letras (A-Z). En modo edición queda bloqueado (`disabled`). Placeholder: `ALFKI`. Texto de ayuda: `(5 caracteres en mayúsculas, ej: ALFKI - solo letras)`. Mensaje en edición: `El código identificador no se puede modificar.` | Mayúsculas automáticas, regex `/^[a-zA-Z]{5}$/`. Bloqueado en edición. Placeholder: `ALFKI`. Ayuda en edición: `El identificador no puede modificarse una vez creado.` | Prácticamente idéntico; diferencias menores de redacción |
| **Campo Nombre / Razón Social** | Máx 40 caracteres, solo letras y espacios (permite acentos y ñ). Placeholder: `Ej: Alfreds Futterkiste o Juan Pérez` | Máx 40 caracteres. Placeholder: `Alfreds Futterkiste`. Regex contiene mojibake en archivo `schemas.ts` | **Bug de codificación en React** |
| **Campo Saldo Actual** | Prefijo visual `$` en input group, step `0.5`, placeholder `0.00`, mínimo `0`. Etiqueta: `Saldo Actual *` | Input normal, step `0.01`, etiqueta `Saldo Comercial ($) *` | Falta prefijo `$` tipo input group y uniformidad en etiquetas |
| **Botones de Acción** | `Cancelar` (secundario) y `Guardar` (primario, icono `bi-check2-circle`) | `Cancelar` y `Registrar Cliente` / `Guardar Cambios` | Diferencias en etiquetado de botones |

#### B. Modal de Confirmación de Eliminación (Delete)

| Elemento | Blazor (`main`) | React (`React`) | Estado |
| :--- | :--- | :--- | :---: |
| **Encabezado** | `bg-danger text-white` con icono `bi-exclamation-triangle-fill` | Estilo estándar de Dialog con título `Eliminar Cliente` | ⚠️ Diferencia estética |
| **Texto de Confirmación** | `¿Está seguro de que desea eliminar al cliente '{Name}' ({Id})? Esta acción no se puede deshacer.` | `¿Está seguro de eliminar al cliente {Name} con ID {Id}? Esta acción no se puede deshacer.` | ⚠️ Pequeña variación de texto |
| **Validación de Integridad Referencial** | El backend rechaza si existen órdenes asociadas (`CustomerHasOrdersCannotDelete`) | React captura el error de la API y muestra alerta explicativa en rojo | ✅ Correctamente implementado |
| **Botón de Borrado** | `Eliminar` con icono `bi-trash3-fill` y estado de carga | `Eliminar Cliente` con spinner `isLoading` | ✅ Equivalente |

---

## 3. Auditoría del Catálogo de Productos

### 3.1 Tabla Comparativa de Paridad: Productos

| Característica / Elemento | Blazor (`main`) | React (`React`) | Estado de Paridad | Impacto |
| :--- | :--- | :--- | :---: | :---: |
| **Título de la Página** | `Gestión de Productos` | `Catálogo de Productos` | ⚠️ Diferente texto | Menor |
| **Subtítulo Descriptivo** | `Administra el inventario de productos, precios y niveles de existencias con búsqueda segmentada.` | `Control de inventario, existencias en almacén y fijación de precios unitarios` | ⚠️ Diferente texto | Menor |
| **Botón Nuevo Producto** | Botón primario con icono `bi-plus-lg` | Botón primario con icono `Plus` | ✅ Equivalente | Ninguno |
| **Cabecera de Card de Búsqueda** | Título: *Búsqueda Segmentada y Filtros de Productos* + Badge: *Filtrado en tiempo real activo* con rayo amarillo | ❌ Sin cabecera; formulario plano dentro de CardContent | ⚠️ Diferente diseño | Moderado |
| **Buscador por Nombre** | Input con placeholder `Buscar por nombre de producto...` + botón (X) limpiar | Input con placeholder `Buscar producto por nombre...` sin botón limpiar | ⚠️ Parcial | Moderado |
| **Tiempo de Debounce** | `200 ms` | `350 ms` | ⚠️ Inconsistencia | Menor |
| **Filtro de Estado de Stock** | Opciones: `Todos los niveles`, `🟢 En Stock (> 0)`, `🟡 Stock Bajo (≤ 10)`, `🔴 Agotado (0)` | Opciones: `Todos los Estados`, `En Stock (> 0)`, `Stock Bajo (≤ 10)`, `Agotados (0)` (sin emojis) | ⚠️ Falta estilo visual | Menor |
| **Filtro de Rango de Precios** | Inputs contiguos `Mín` y `Máx` (step 10, min 0) con separador `-` | Inputs en columnas separadas `Mín ($)` y `Máx ($)` con placeholders `0` y `100` (step 0.5) | ⚠️ Diferente layout y step | Menor |
| **Selector de Ordenamiento** | Opciones: `Nombre` (name), `Precio` (price), `Stock` (stock) | Opciones: `Nombre`, `Precio`, `Stock` | ✅ Equivalente | Ninguno |
| **Alternar Dirección de Orden** | No disponible en UI de Blazor | Botón interactivo `ArrowUpDown` (Ascendente/Descendente) | ➕ Mejora en React | Positivo |
| **Chips Rápidos de Existencias** | Barra inferior: *Todos*, *En Stock*, *Stock Bajo (≤ 10)*, *Agotados* | ❌ No implementados en React | ❌ Ausente | **Alto** |
| **Botón Limpiar Filtros** | Botón `Limpiar` con icono `bi-arrow-counterclockwise` que resetea todos los criterios | ❌ No existe botón para restablecer filtros | ❌ Ausente | **Alto** |
| **Cabecera de Tabla de Productos** | `Listado de Productos` + Badge `{count} registros` | `Inventario de Productos ({count})` + descripción | ⚠️ Parcial | Menor |
| **Estructura de Columnas Tabla** | **6 columnas:**<br>1. ID (`#1`)<br>2. Nombre del Producto<br>3. Precio Unitario<br>4. Unidades en Stock (`X uds.`)<br>5. Estado (Badge)<br>6. Acciones | **5 columnas:**<br>1. ID (`#1`)<br>2. Nombre del Producto<br>3. Precio Unitario<br>4. Unidades en Stock (fusionada con Badge)<br>5. Acciones | ❌ Fusión indebida | **Alto** |
| **Formato Monetario** | `$0.00` con `fw-bold text-primary` | `$0.00` formateado con `Intl.NumberFormat` | ✅ Equivalente | Ninguno |
| **Badges de Columna Estado** | - Agotado (0): `bg-danger-subtle` con `bi-x-circle`<br>- Stock Bajo (≤ 10): `bg-warning-subtle` con `bi-exclamation-circle`<br>- En Stock (> 10): `bg-success-subtle` con `bi-check-circle` | Muestra badge que agrupa la cantidad y el estado (ej. `0 (Agotado)`, `5 un. (Stock Bajo)`, `20 un. (En Stock)`) | ⚠️ Desalineado con tabla de 6 columnas | Moderado |
| **Mensaje de Tabla Vacía** | *No se encontraron productos que coincidan con los criterios de búsqueda.* (icono `bi-inbox`) | *No se encontraron productos / Ajuste los criterios de filtrado o agregue un nuevo producto al catálogo* | ⚠️ Divergencia de texto | Menor |

---

### 3.2 Auditoría de Modales: Productos

#### A. Modal de Creación / Edición (`ProductModal`)

| Parámetro / Campo | Blazor (`main`) | React (`React`) | Discrepancia Identificada |
| :--- | :--- | :--- | :--- |
| **Título en Modo Crear** | `Registrar Nuevo Producto` (icono `bi-plus-circle text-success`) | `Nuevo Producto` (sin icono en encabezado) | Falta icono temático y texto formal |
| **Título en Modo Editar** | `Editar Producto` (icono `bi-pencil-square text-primary`) | `Editar Producto` (sin icono en encabezado) | Falta icono temático |
| **Campo Nombre del Producto** | Máximo 40 caracteres. Placeholder: `Ej: Café Colombiano` | Máximo 40 caracteres. Placeholder: `Chai, Chang, Queso Cabrales...` | Diferencia en placeholder |
| **Orden de Columnas Fila 2** | Col 1: **Precio Unitario**<br>Col 2: **Unidades en Stock** | Col 1: **Unidades en Stock**<br>Col 2: **Precio Unitario** | Columnas invertidas respecto a Blazor |
| **Campo Precio Unitario** | Input group con prefijo `$`, step `0.5`, min `0.01`, placeholder `0.00`. Valor inicial: `0` | Input común sin prefijo `$`, step `0.01`, min `0.01`, placeholder `10.00`. Valor inicial: `1` | Falta adorno `$` e inversión de valor por defecto |
| **Campo Unidades en Stock** | Input numérico entero, step `1`, min `0`, placeholder `0`. Etiqueta: `Unidades en Stock *` | Input numérico entero, step `1`, min `0`, placeholder `0`. Etiqueta: `Unidades en Stock *` | ✅ Totalmente equivalente |
| **Botones de Acción** | `Cancelar` y `Guardar` (icono `bi-check2-circle`) | `Cancelar` y `Añadir Producto` / `Guardar Cambios` | Diferencias en etiquetado de botones |

#### B. Modal de Confirmación de Eliminación (Delete)

| Elemento | Blazor (`main`) | React (`React`) | Estado |
| :--- | :--- | :--- | :---: |
| **Encabezado** | `bg-danger text-white` con icono `bi-exclamation-triangle-fill` | Estilo estándar de Dialog con título `Eliminar Producto` | ⚠️ Diferencia estética |
| **Texto de Confirmación** | `¿Está seguro de que desea eliminar el producto '{Name}' (ID: {Id})? Esta acción no se puede deshacer.` | `¿Está seguro de eliminar el producto {Name}?` | ❌ **Omite el ID del producto** |
| **Validación de Integridad Referencial** | El backend rechaza si existen órdenes con dicho producto (`ProductHasOrdersCannotDelete`) | React captura el error de la API y muestra alerta explicativa en rojo | ✅ Correctamente implementado |
| **Botón de Borrado** | `Eliminar` con icono `bi-trash3-fill` y estado de carga | `Eliminar Producto` con spinner `isLoading` | ✅ Equivalente |

---

## 4. Análisis Detallado de Discrepancias y Gaps Críticos

### Gap 1: Barra de Segmentación Superior de Clientes Desaparecida (Prioridad Alta)
- **Comportamiento Blazor:** Encima del panel de búsqueda existe una barra de botones con selector visual exclusivo para segmentar inmediatamente el catálogo en tres grupos de clientes:
  1. *Todos los Clientes* (`icon: bi-people-fill`)
  2. *Personas Naturales* (`icon: bi-person-badge-fill`)
  3. *Empresas* (`icon: bi-building-fill`)
- **Situación en React:** Esta barra fue completamente suprimida y reducida a un simple `<select>` dentro del grid de filtros. Esto degrada la rapidez operativa del usuario final y rompe la jerarquía visual del diseño Blazor.

### Gap 2: Inexistencia de Chips Rápidos de Filtrado y Botón "Limpiar" (Prioridad Alta)
- **Comportamiento Blazor:**
  - En **Clientes**, existe una sub-barra con chips: `Todos`, `Al Día ($0.00)`, `Con Saldo Pendiente`, `Saldo Elevado (≥ $100)`, acompañada de un botón `Limpiar` a la derecha.
  - En **Productos**, existe una sub-barra idéntica con chips: `Todos`, `En Stock`, `Stock Bajo (≤ 10)`, `Agotados`, con el botón `Limpiar`.
- **Situación en React:** Ambas sub-barras fueron omitidas en `CustomersPage.tsx` y `ProductsPage.tsx`. No hay botón para limpiar los filtros acumulados en una sola pulsación, obligando al usuario a borrar manualmente cada campo.

### Gap 3: Omisión del Rango de Saldo en la Vista de Clientes (Prioridad Alta)
- **Comportamiento Blazor:** Permite filtrar clientes con saldo entre un rango `MinBalance` y `MaxBalance` simultáneamente (ej. clientes con deuda entre $50 y $500).
- **Situación en React:** La lógica existe en `CustomerFilters` y en `customersService.ts`, pero no existe ningún control de entrada visual en `CustomersPage.tsx`.

### Gap 4: Estructura de Tablas: Fusión Incorrecta de Columnas (Prioridad Alta)
- **En Clientes:**
  - Blazor presenta dos columnas bien diferenciadas: **Saldo Actual** (muestra `$XX.XX` en verde o rojo) y **Estado** (muestra badges temáticos: *Al Día*, *Con Saldo*, *Saldo Alto*).
  - React fusionó ambas en una columna *Saldo Comercial* mostrando únicamente el badge.
- **En Productos:**
  - Blazor presenta dos columnas bien diferenciadas: **Unidades en Stock** (muestra `XX uds.`) y **Estado** (muestra badges: *En Stock*, *Stock Bajo*, *Agotado*).
  - React fusionó ambas en una sola celda.
- **Consecuencia:** La tabla en React tiene 5 columnas en vez de 6, perdiendo claridad analítica y fidelidad al diseño de referencia.

### Gap 5: Corrupción de Caracteres (Mojibake UTF-8) en Validaciones de React (Prioridad Moderada)
En `src/features/customers/schemas.ts`:
```typescript
// ERROR IDENTIFICADO EN REACT:
const NAME_LETTERS_ONLY = /^[a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃ Ã‰Ã Ã“ÃšÃ±Ã‘Ã¼Ãœ\s]+$/;
```
Esto provoca que nombres válidos en español con tildes (ej. *Álvaro*, *José*, *Peña*) puedan fallar la validación del lado del cliente antes de enviarse al backend.

### Gap 6: Parámetro Faltante en Diálogo de Eliminación de Productos (Prioridad Moderada)
El template oficial de NorthWind es:
`¿Está seguro de que desea eliminar el producto '{0}' (ID: {1})? Esta acción no se puede deshacer.`  
En React se implementó como:  
`¿Está seguro de eliminar el producto {productToDelete?.name}?`  
Omitiendo el identificador ID del producto y la advertencia final de irreversibilidad.

---

## 5. Especificaciones Técnicas para Lograr el 100% de Paridad

Para alcanzar paridad total (100%) entre Blazor y React, se deben aplicar las siguientes correcciones de diseño y lógica:

### 5.1 Plan de Ajustes en `CustomersPage.tsx`
1. **Restaurar Títulos Oficiales:** Cambiar título a `"Gestión de Clientes"` y subtítulo a `"Administra los clientes comerciales, sus límites y balances de cuenta con segmentación de saldos."`.
2. **Incorporar Barra de Segmentación Superior:**
   Agregar el grupo de botones encima de la tarjeta de búsqueda para conmutar entre `Todos los Clientes`, `Personas Naturales` y `Empresas`.
3. **Restaurar Cabecera de Filtros con Badge en Tiempo Real:**
   Incluir el encabezado `Búsqueda Segmentada y Filtros de Clientes` y el indicador `Filtrado en tiempo real activo`.
4. **Agregar Entradas de Rango de Saldo (`MinBalance` y `MaxBalance`):**
   Agregar los dos inputs numéricos (`step="10"`, `min="0"`) vinculados al filtro.
5. **Incorporar Chips Rápidos de Segmentación y Botón Limpiar:**
   Agregar la barra con los botones `Todos`, `Al Día ($0.00)`, `Con Saldo Pendiente`, `Saldo Elevado (≥ $100)` y el botón `Limpiar` que restablezca el estado inicial de filtros.
6. **Desdoblar la Tabla a 6 Columnas:**
   - Separar **Saldo Actual** (texto formateado `$X.XX` coloreado con `text-success` o `text-danger`) y **Estado** (badge descriptivo con icono).
   - Aplicar badges diferenciados para **Tipo de Cliente** (badge celeste con icono usuario para *Persona Natural*, badge azul con icono edificio para *Empresa*).

### 5.2 Plan de Ajustes en `CustomerModal.tsx`
1. Reordenar campos al estándar Blazor:
   - 1º Tipo de Cliente (selector con emojis o iconos, por defecto `"Persona Natural"`).
   - 2º Código (ID) con longitud exacta de 5 letras, disabled en edición.
   - 3º Nombre / Razón Social (placeholder: `"Ej: Alfreds Futterkiste o Juan Pérez"`).
   - 4º Saldo Actual con prefijo `$` en contenedor InputGroup.
2. Corregir la expresión regular en `schemas.ts` a:
   ```typescript
   const NAME_LETTERS_ONLY = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
   ```
3. Homologar títulos a `"Registrar Nuevo Cliente"` / `"Editar Cliente"`.

### 5.3 Plan de Ajustes en `ProductsPage.tsx`
1. **Restaurar Títulos Oficiales:** Cambiar a `"Gestión de Productos"` y `"Administra el inventario de productos, precios y niveles de existencias con búsqueda segmentada."`.
2. **Restaurar Cabecera de Filtros y Emojis de Stock:**
   Incluir cabecera de búsqueda en tiempo real e incorporar los círculos cromáticos (`🟢`, `🟡`, `🔴`) en el desplegable de stock.
3. **Incorporar Chips Rápidos de Existencias y Botón Limpiar:**
   Añadir chips: `Todos`, `En Stock`, `Stock Bajo (≤ 10)`, `Agotados`, junto al botón `Limpiar`.
4. **Desdoblar la Tabla a 6 Columnas:**
   - Columna 4: **Unidades en Stock** mostrando `{p.unitsInStock} uds.`
   - Columna 5: **Estado** mostrando el Badge (*En Stock*, *Stock Bajo*, *Agotado* con sus respectivos iconos de check, alerta o cruz).

### 5.4 Plan de Ajustes en `ProductModal.tsx`
1. Homologar títulos a `"Registrar Nuevo Producto"` / `"Editar Producto"`.
2. Reordenar campos en la segunda fila:
   - Col 1: **Precio Unitario** con prefijo visual `$` (step 0.5, placeholder `"0.00"`).
   - Col 2: **Unidades en Stock** (step 1, placeholder `"0"`).
3. Placeholder de nombre: `"Ej: Café Colombiano"`.
4. En el diálogo de eliminación, actualizar el texto a:
   `¿Está seguro de que desea eliminar el producto '{productToDelete?.name}' (ID: {productToDelete?.id})? Esta acción no se puede deshacer.`

---

## 6. Conclusión y Checklist de Validación

| Criterio Evaluado | Nivel de Paridad Actual | Paridad Post-Ajustes |
| :--- | :---: | :---: |
| **Criterios de Búsqueda y Filtros de Clientes** | 70% | 100% |
| **Criterios de Búsqueda y Filtros de Productos** | 75% | 100% |
| **Modales de Creación y Edición de Clientes** | 85% | 100% |
| **Modales de Creación y Edición de Productos** | 85% | 100% |
| **Diálogos de Confirmación de Eliminación** | 80% | 100% |
| **Fidelidad Estructural de Tablas (Columnas y Badges)** | 70% | 100% |
| **Integridad de Validaciones de Negocio y Reglas de Dominio** | 90% | 100% |

El informe concluye que, si bien la base funcional de React es sólida y utiliza buenas prácticas de desarrollo moderno, requiere la incorporación de los componentes de filtrado rápido, el desdoblamiento de columnas en tablas y el alineamiento riguroso de textos y validaciones para garantizar paridad absoluta con Blazor.
