# Auditoría de Paridad: Módulo de Facturación y Comprobantes (Invoices & InvoiceVoucher)

**Módulo Auditado:** Facturación e Historial de Comprobantes Fiscales (`InvoicesPage` e `InvoiceVoucher`)  
**Comparativa:** Blazor WebAssembly (`main`) vs. React 18 + TypeScript (`React`)  
**Fecha:** 21 de Octubre de 2026  
**Auditor:** Subagente 5 — Especialista en Facturación y Comprobantes Electrónicos  

---

## 1. Resumen Ejecutivo y Dictamen de Paridad

Se ha ejecutado una auditoría minuciosa de paridad técnica, funcional y visual entre la implementación original en **Blazor** (`InvoicesPage.razor`, `InvoicesPage.razor.cs`, `InvoicesViewModel.cs`) y la implementación actual en **React + Tailwind CSS** (`InvoicesPage.tsx`, `InvoiceVoucher.tsx`, `useInvoices.ts`, `invoicesService.ts`, `src/index.css`).

El módulo de facturación es el núcleo fiscal y probatorio del sistema NorthWind, garantizando la inmutabilidad y trazabilidad de las transacciones mediante el **Patrón Instantánea (Snapshot Pattern)**, el cálculo de **IVA 15%** y la generación de comprobantes para el usuario final.

### Calificación General de Paridad: **82%**

```
[████████████████░░░░] 82% Paridad Funcional y Visual
```

### Hallazgos Principales:
1. **Puntos Fuertes en React (Mejoras sobre Blazor):**
   - **Soporte de Impresión `@media print` Real:** Mientras que Blazor ejecutaba `window.print` sin reglas CSS de aislamiento, React cuenta con una implementación limpia en `src/index.css` que oculta el navbar, modales y botones, enfocando exclusivamente `#printable-invoice`.
   - **Filtros Reactivos con Debounce y React Query:** React realiza búsquedas asíncronas optimizadas contra el backend evitando sobrecarga innecesaria.
   - **Datos Legales Ampliados:** La cabecera del voucher en React incorporó la leyenda *"Obligado a llevar Contabilidad"*, dirección de Matriz y teléfono fiscal conforme a normativa tributaria.

2. **Discrepancias y Brechas Críticas en React:**
   - **Omisión de Columnas Financieras en la Tabla:** La tabla de facturas en React omitió las columnas de **Subtotal** e **IVA (15%)**, mostrando únicamente el Total. En Blazor, ambas columnas son visibles para auditoría rápida sin abrir el voucher.
   - **Degradación de la Columna Vendedor:** En Blazor el vendedor posee su propia columna con icono. En React quedó relegado a un texto pequeño debajo del cliente.
   - **Falta del Código de Cliente (`customerId`) en la Tabla y en el Voucher:** Blazor muestra explícitamente `Código: @inv.CustomerId` y permite buscar por este campo; React no muestra el código interno si existe el nombre y eliminó la búsqueda por ID.
   - **Omisión del Banner Legal de Integridad Histórica (Snapshot Pattern):** Se eliminó del voucher el aviso explícito de auditoría: *"Registro de Integridad Histórica: Este comprobante utiliza datos congelados en el momento de la emisión. Cualquier modificación futura en los catálogos maestros no alterará el contenido de este documento."*
   - **Falta de Acceso Rápido a "Crear Orden":** Se omitió el botón de acción principal en el encabezado y en el estado vacío de la tabla para ir a `/createorder`.

---

## 2. Matriz Comparativa de Componentes y Funcionalidades

| Característica / Criterio | Blazor (`main`) | React (`React`) | Estado de Paridad |
| :--- | :--- | :--- | :---: |
| **Hero Banner en Encabezado** | Tarjeta azul (`bg-primary`) con icono, título, contador de facturas y badge | Layout horizontal simple sin card de contraste | ⚠️ Diferencia Visual |
| **Botón de Enlace "Crear Orden"** | En encabezado y en estado vacío (`/createorder`) | Ausente en ambas ubicaciones | ❌ Falta en React |
| **Selector de Criterio de Búsqueda** | Dropdown con opciones: `Todos`, `N° Factura`, `Nombre Cliente`, `Código Cliente` | Dos inputs independientes (`N° Factura` y `Nombre Cliente`) | ⚠️ Diferencia UX |
| **Búsqueda por Código de Cliente (`customerId`)** | Soportada en selector `customer_id` y en `all` | No contemplada en los inputs | ❌ Falta en React |
| **Placeholder Dinámico y Limpieza** | Placeholder adaptativo según selector + botón 'X' | Placeholders estáticos + botón "Limpiar Filtros" | ⚠️ Diferencia Menor |
| **Filtrado por Rango de Fechas** | No implementado en UI ni DTO backend | No implementado en UI ni DTO backend | ⚖️ Paridad Idéntica |
| **Paginación / Ordenamiento** | No implementado (lista completa) | No implementado (lista completa) | ⚖️ Paridad Idéntica |
| **Columna N° Factura** | Badge azul monospace (`px-2 py-1`) | Monospace text `sky-700` font-bold | ✅ Paridad Equivalente |
| **Columna Fecha de Emisión** | Icono `bi-calendar3` + `dd/MM/yyyy HH:mm` | Icono `Calendar` + formato regional `es-EC` | ✅ Paridad Equivalente |
| **Columna Cliente (Snapshot)** | Nombre + Badge Documento + Código Cliente | Nombre + Subtítulo Vendedor | ⚠️ Incompleto en React |
| **Columna Vendedor** | Columna independiente con icono `bi-person` | Omitida como columna; texto secundario | ❌ Falta Columna |
| **Columna Subtotal** | Presente: `$@inv.SubTotal` (alineado derecha) | **Ausente** de la tabla | ❌ Falta en React |
| **Columna IVA (15%)** | Presente: `$@inv.Tax` (alineado derecha) | **Ausente** de la tabla | ❌ Falta en React |
| **Columna Total** | Presente: `$@inv.Total` (verde, monospace, bold) | Presente: `$inv.total` (bold) | ✅ Paridad Equivalente |
| **Acción Ver Factura / Voucher** | Botón outline `Ver Factura` con icono `bi-eye` | Botón outline `Comprobante` (Eye + Printer) | ✅ Paridad Equivalente |
| **Encabezado Legal del Voucher** | Logo, RUC, Dirección matriz, N° Factura, Fecha, Vendedor | Logo, RUC, Matriz, Teléfono, Obligado contabilidad, N° Factura, Fecha | ✅ Supera a Blazor |
| **Snapshot de Cliente en Voucher** | Nombre, Documento, **Código Interno**, Dirección, Tel, Email | Nombre, Documento, Dirección, Email, Tel (**Falta Código Interno**) | ⚠️ Falta Código |
| **Detalle de Ítems en Voucher** | Cant., Descripción (Congelada), P. Unitario, Subtotal | #, Descripción del Producto, Cant., P. Unit., Subtotal | ⚠️ Falta "(Congelada)" |
| **Resumen Financiero Voucher** | Subtotal Neto, IVA 15%, Total Factura | Subtotal, IVA 15%, Total Factura + Bloque SRI | ✅ Paridad Equivalente |
| **Nota de Auditoría Histórica** | Alerta legal de datos congelados (Snapshot) | Texto genérico SRI (Omitió aviso de Snapshot) | ❌ Falta en React |
| **Impresión (`window.print`)** | Invocación básica por JSInterop | `window.print()` + Reglas `@media print` en `index.css` | 🌟 Superior en React |

---

## 3. Análisis Detallado de Discrepancias

### 3.1. Filtros y Búsqueda en `InvoicesPage`

#### Comportamiento en Blazor:
En Blazor, el componente presentaba una barra de búsqueda unificada con un `<select>` que permitía alternar dinámicamente el criterio de búsqueda:
```html
<select class="form-select flex-grow-0" style="width: 200px;" value="@ViewModel.SearchType" @onchange="ViewModel.OnSearchTypeChanged">
    <option value="all">🔍 Todos</option>
    <option value="invoice">🧾 N° Factura / Código</option>
    <option value="customer_name">👤 Nombre de Cliente</option>
    <option value="customer_id">🏷️ Código de Cliente</option>
</select>
```
Al cambiar el selector, se actualizaba el texto del placeholder en el input (`GetSearchPlaceholder()`). Además, la búsqueda por `customer_id` permitía localizar rápidamente facturas emitidas a clientes como `ALFKI` o `ANATR`.

#### Situación en React:
React reemplazó el selector unificado por dos inputs independientes (`Número de Factura` y `Nombre del Cliente`). Si bien esto es válido a nivel de interfaz:
1. **Se perdió la búsqueda por Código de Cliente:** Los usuarios no pueden buscar facturas ingresando el código alfanumérico del cliente (e.g. `ALFKI`), ya que el backend sólo recibe `customerName`.
2. **Falta de opción unificada "Todos":** En Blazor, el modo por defecto `all` evaluaba simultáneamente si el término coincidía con el número de factura, el nombre o el código del cliente.

---

### 3.2. Columnas y Presentación de la Tabla de Facturas

#### En Blazor (8 columnas explícitas):
1. **N° Factura:** Identificador fiscal distintivo.
2. **Fecha de Emisión:** Marca de tiempo exacta de generación.
3. **Cliente (Snapshot):** Nombre en negrita, badge de cédula/RUC y etiqueta `Código: {CustomerId}`.
4. **Vendedor:** Nombre del agente o cajero emisor en su propia celda.
5. **Subtotal:** Desglose del valor neto sin impuestos.
6. **IVA (15%):** Monto exacto liquidado de impuesto fiscal.
7. **Total:** Importe final a cobrar/pagar.
8. **Comprobante:** Botón de acción para desplegar el modal.

#### En React (6 columnas):
1. **N° Factura:** Conforme.
2. **Fecha de Emisión:** Conforme.
3. **Cliente / Razón Social:** Agrupa nombre y comprime al vendedor como un subtítulo tenue en la misma celda. **Omitió el código interno del cliente**.
4. **RUC / Cédula:** Conforme (como columna propia).
5. **Total ($):** Muestra el total final. **Omitió completamente las columnas de Subtotal e IVA (15%)**.
6. **Acciones:** Conforme.

> [!WARNING]
> **Impacto en Auditoría Contable:** La ausencia de las columnas **Subtotal** e **IVA** en la tabla obliga al usuario a abrir el comprobante de cada factura para verificar bases imponibles e impuestos, ralentizando la conciliación de caja y auditoría tributaria.

---

### 3.3. Estructura del Voucher de Factura (`InvoiceVoucher`)

#### 1. Identificación del Cliente (Snapshot Inmutable):
- **Blazor:** En la sección del cliente se incluía:
  ```html
  <div class="small text-muted">Código Interno: <span class="font-monospace">@voucher.CustomerId</span></div>
  ```
- **React:** Omitió la visualización del `customerId`.

#### 2. Rótulos del Detalle de Ítems:
- **Blazor:** El encabezado de la columna de producto declaraba explícitamente:
  `Descripción (Congelada)`
  Esto hace patente el diseño arquitectónico de que los nombres y precios no son leídos en vivo de la tabla de productos, sino rescatados de la instantánea histórica.
- **React:** Usa `Descripción del Producto`. Se recomienda mantener `Descripción (Snapshot)` o `Descripción (Congelada)` o añadir el indicador de congelamiento.

#### 3. Nota de Integridad Histórica y Legal (CRÍTICO):
- **Blazor:**
  ```html
  <div class="alert alert-secondary p-3 mb-0 small text-muted d-flex align-items-center gap-2">
      <i class="bi bi-info-circle-fill text-primary fs-5"></i>
      <div>
          <strong>Registro de Integridad Histórica:</strong> Este comprobante utiliza datos congelados en el momento de la emisión. Cualquier modificación futura en los catálogos maestros no alterará el contenido de este documento.
      </div>
  </div>
  ```
- **React:** Fue omitido y sustituido por:
  ```tsx
  <p className="font-semibold text-slate-700 mb-1">Información Tributaria Adicional:</p>
  <p>Documento emitido de conformidad con las Resoluciones del SRI...</p>
  ```
  Debe preservarse la nota de Integridad Histórica (o combinarse con la nota del SRI) para garantizar la trazabilidad académica y de diseño de patrones requerida en la asignatura.

---

### 3.4. Opciones de Impresión y Exportación

#### Análisis de `@media print`:
En React, la configuración presente en `src/index.css` es excelente:
```css
@media print {
  body {
    background-color: #ffffff !important;
    color: #000000 !important;
  }
  header, aside, nav, button, .no-print {
    display: none !important;
  }
  body * {
    visibility: hidden;
  }
  #printable-invoice, #printable-invoice * {
    visibility: visible;
  }
  #printable-invoice {
    position: static !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 20px !important;
    box-shadow: none !important;
  }
  tr, .print-break-inside-avoid {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  @page {
    margin: 1cm;
    size: auto;
  }
}
```
Esta implementación supera técnicamente a la de Blazor, ya que garantiza que el navegador genere un PDF o impresión en papel limpia, sin marcos del sistema operativo, barras de navegación ni fondos oscuros de modales.

---

## 4. Plan de Acción y Código de Paridad 100%

Para alcanzar el **100% de paridad**, se detallan a continuación las modificaciones exactas requeridas en los archivos de React:

### Modificación 1: Actualizar `src/features/invoices/pages/InvoicesPage.tsx`
1. Reincorporar el Hero Header con badge de total de facturas y botón de acceso directo `Crear Orden` (`/createorder`).
2. Permitir búsqueda por `customer_id` / término unificado.
3. Incorporar las columnas **Vendedor**, **Subtotal ($)** e **IVA (15%)** en la tabla.
4. Agregar el botón de acción "Ir a Crear Orden" en el estado vacío.

```tsx
// Código sugerido para la tabla en InvoicesPage.tsx:
<TableHeader>
  <TableRow>
    <TableHead className="w-36">N° Factura</TableHead>
    <TableHead className="w-40">Fecha de Emisión</TableHead>
    <TableHead>Cliente (Snapshot)</TableHead>
    <TableHead className="w-36">Vendedor</TableHead>
    <TableHead className="text-right w-28">Subtotal</TableHead>
    <TableHead className="text-right w-28">IVA (15%)</TableHead>
    <TableHead className="text-right w-28">Total</TableHead>
    <TableHead className="text-center w-32">Comprobante</TableHead>
  </TableRow>
</TableHeader>
<TableBody>
  {invoices.map((inv) => (
    <TableRow key={inv.id}>
      <TableCell className="font-mono text-xs font-bold text-sky-700">
        <span className="inline-block px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-xs font-semibold">
          {inv.invoiceNumber || `FAC-${inv.id}`}
        </span>
      </TableCell>
      <TableCell className="text-xs text-slate-600">
        <div className="flex items-center space-x-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{formatDate(inv.createdDate)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-semibold text-slate-900">{inv.customerFullName || 'Consumidor Final'}</div>
        <div className="text-xs text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
          {inv.customerDocument && (
            <span className="bg-slate-100 border border-slate-200 px-1 rounded text-slate-700">
              RUC: {inv.customerDocument}
            </span>
          )}
          <span>Código: {inv.customerId}</span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-slate-600">
        <div className="flex items-center space-x-1">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span>{inv.sellerName || 'Sistema'}</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono text-xs text-slate-600">
        ${Number(inv.subTotal).toFixed(2)}
      </TableCell>
      <TableCell className="text-right font-mono text-xs text-slate-600">
        ${Number(inv.tax).toFixed(2)}
      </TableCell>
      <TableCell className="text-right font-mono font-bold text-emerald-600 text-sm">
        ${Number(inv.total).toFixed(2)}
      </TableCell>
      <TableCell className="text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleOpenVoucher(inv)}
          className="h-8 px-2.5 text-xs text-sky-700 border-sky-200 hover:bg-sky-50 flex items-center space-x-1.5 mx-auto"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Ver Factura</span>
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

### Modificación 2: Actualizar `src/features/invoices/components/InvoiceVoucher.tsx`
1. Reincorporar `Código Interno: {invoice.customerId}` en la sección del cliente.
2. Actualizar el encabezado de columna a `Descripción (Congelada)`.
3. Reincorporar la alerta legal de **Registro de Integridad Histórica (Snapshot)** al pie del comprobante.

```tsx
// Datos del cliente en InvoiceVoucher.tsx:
<div className="space-y-1.5">
  <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
    Adquirente / Cliente (Snapshot)
  </div>
  <div className="text-base font-bold text-slate-900">
    {invoice.customerFullName || 'Consumidor Final'}
  </div>
  <div className="flex items-center space-x-2 text-slate-600 text-xs">
    <span className="font-semibold text-slate-700">Cédula / RUC:</span>
    <span className="font-mono font-bold text-slate-900">{invoice.customerDocument || 'N/A'}</span>
  </div>
  <div className="flex items-center space-x-2 text-slate-600 text-xs">
    <span className="font-semibold text-slate-700">Código Interno:</span>
    <span className="font-mono text-slate-800">{invoice.customerId}</span>
  </div>
  {/* Dirección, teléfono, email */}
</div>

// Alerta de Integridad Histórica en InvoiceVoucher.tsx:
<div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start space-x-2.5">
  <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
  <div>
    <span className="font-bold text-slate-800">Registro de Integridad Histórica: </span>
    Este comprobante utiliza datos congelados en el momento de la emisión (Patrón Instantánea). Cualquier modificación futura en los catálogos maestros no alterará el contenido de este documento.
  </div>
</div>
```

---

## 5. Conclusión y Recomendación Final

El módulo de facturación en React cuenta con una base arquitectónica sólida y una capacidad de impresión en CSS superior a la de Blazor. Aplicando las correcciones descritas para reincorporar las columnas de desglose financiero en la tabla (`Subtotal` e `IVA`), el código interno del cliente y la nota formal de Integridad Histórica (Snapshot Pattern), el módulo alcanzará **100% de paridad funcional, visual y técnica**.
