# Reporte de Auditoría: Formulario de Creación de Órdenes (`CreateOrder`)
**Paridad Arquitectural y Funcional: Blazor (`main`) vs. React (`React`)**

---

## 1. Información General y Alcance de la Auditoría

- **Módulo auditado:** Registro de Órdenes de Venta (`CreateOrder` / Nueva Orden)
- **Componente Origen (Blazor en `main`):**
  - `3. Interface Adapters/Views/NorthWind.Sales.Frontend.Views/Components/CreateOrderComponent.razor`
  - `3. Interface Adapters/Views/NorthWind.Sales.Frontend.Views/Components/CreateOrderComponent.razor.cs`
  - `3. Interface Adapters/Views/NorthWind.Sales.Frontend.Views/Pages/CreateOrder.razor`
  - `3. Interface Adapters/Views/NorthWind.Sales.Frontend.Views/Resources/CreateOrderMessages.cs`
  - `1. Enterprise Business Rules/NorthWind.Sales.Validators.Entities/CreateOrder/CreateOrderDtoValidator.cs`
- **Componente Destino (React en `React`):**
  - `4. Frameworks And Drivers/UI/ReactClient/src/features/orders/pages/CreateOrderPage.tsx`
  - `4. Frameworks And Drivers/UI/ReactClient/src/features/orders/components/CustomerSelectorModal.tsx`
  - `4. Frameworks And Drivers/UI/ReactClient/src/features/orders/components/ProductSelectorModal.tsx`
  - `4. Frameworks And Drivers/UI/ReactClient/src/features/orders/hooks/useCreateOrder.ts`
  - `4. Frameworks And Drivers/UI/ReactClient/src/features/orders/types.ts`
- **Fecha de Auditoría:** 21 de Octubre de 2026
- **Auditor Responsable:** Subagente 2 — Auditoría de Órdenes

---

## 2. Resumen Ejecutivo de Cumplimiento

| Aspecto Evaluado | Estado en React | Grado de Paridad | Severidad de Discrepancia |
| :--- | :---: | :---: | :---: |
| **1. Estado de `customerId` (readOnly)** | ⚠️ Parcial | 60% | **Media** (Permite escritura directa) |
| **2. Etiquetas y no redundancia de Cliente** | ❌ No Cumple | 50% | **Alta** (Existe dropdown `<select>` redundante) |
| **3. Datos de Envío (`shipAddress`, `shipCity`...)** | ⚠️ Parcial | 85% | **Baja** (Labels/placeholders y defaults) |
| **4. Tabla del Carrito y Detalle de Líneas** | ⚠️ Parcial | 80% | **Media** (Falta confirmación de borrado y columna `#`) |
| **5. Banners (Mailtrap, IVA 15%, Bloqueos)** | ✅ Cumple | 95% | **Baja** (Falta panel de trazabilidad) |
| **PROMEDIO GLOBAL DE PARIDAD** | **EN PROCESO** | **78%** | **Requiere ajustes puntuales** |

---

## 3. Análisis Exhaustivo por Aspectos

---

### Aspecto 1: Estado del Campo `customerId` (`readOnly`)

#### Análisis Blazor (`main`)
En Blazor, el campo `customerId` poseía un `@oninput="HandleCustomerIdInput"` restringido a letras (5 caracteres) y un botón adjunto `Buscar Cliente` que abría el modal `ShowCustomerPicker`. Adicionalmente, el ID de producto en las líneas de detalle estaba configurado como:
```razor
<input type="text" class="form-control font-monospace bg-light text-center fw-bold"
       readonly tabindex="-1"
       style="cursor: not-allowed; background-color: #f1f3f5;"
       title="El ID no es editable directamente. Usa el botón Buscar..." />
```
El requerimiento arquitectural de la migración especifica que para evitar que el operador ingrese códigos arbitrarios o esquive la verificación del modal de morosidad, **el cliente debe seleccionarse exclusivamente mediante el modal selector**.

#### Estado Actual en React (`CreateOrderPage.tsx`)
```tsx
// Líneas 412-421:
<Input
  id="customerId"
  type="text"
  placeholder="Ej. ALFKI"
  value={selectedCustomerId}
  onChange={handleCustomerIdChange}
  onKeyDown={allowOnlyAlpha}
  maxLength={5}
  className="font-mono uppercase tracking-wider"
  required
/>
```

#### Discrepancias Identificadas
1. **No es `readOnly`**: El input permite entrada por teclado (`onChange={handleCustomerIdChange}` y `onKeyDown={allowOnlyAlpha}`). El usuario puede tipear códigos a mano.
2. **Riesgo Operativo**: Si el usuario escribe manualmente un código de cliente moroso o inexistente, se requiere esperar a la validación tardía del formulario en lugar de garantizar la selección controlada desde el catálogo auditado.

#### Recomendación de Paridad
Hacer el campo estrictamente `readOnly`:
```tsx
<Input
  id="customerId"
  type="text"
  readOnly
  placeholder="Seleccione con 'Buscar Cliente'"
  value={selectedCustomerId}
  onClick={() => setShowCustomerModal(true)}
  className="font-mono uppercase tracking-wider cursor-pointer bg-slate-50 hover:bg-slate-100"
  required
/>
```

---

### Aspecto 2: Etiquetas de Cliente Seleccionado y Eliminación de Redundancias

#### Análisis Blazor (`main`)
En `CreateOrderComponent.razor` (líneas 63-107), la sección de cliente es limpia y directa:
- Una sola fila con 2 columnas:
  - `col-md-6`: Campo **Cliente:** (`CreateOrderMessages.CustomerIdLabel = "Cliente:"`) + botón `Buscar Cliente`.
    - Al seleccionar: Muestra `Cliente Habilitado: [Nombre]` con badge de `Persona Natural` o `Empresa`.
  - `col-md-6`: Campo **Cédula / RUC:** (`CreateOrderMessages.CustomerDocumentLabel = "Cédula / RUC:"`).
- **NO existe ningún dropdown `<select>`** que duplique la selección de clientes.

#### Estado Actual en React (`CreateOrderPage.tsx`)
En React se implementó un diseño de 3 columnas en la fila superior:
1. Columna 1: `ID Cliente * (5 letras)` + Botón `Buscar Cliente` (abre modal).
2. Columna 2: **`Seleccionar Cliente *`** (`<select>` dropdown con todos los clientes cargados en memoria).
3. Columna 3: `Cédula / RUC (Ecuador) *`.

Adicionalmente, debajo aparece una tarjeta con:
- `Razón Social / Nombre:`
- `Tipo de Cliente:`
- `Saldo en Cuenta:`

```tsx
{/* DROPDOWN REDUNDANTE DETECTADO EN CreateOrderPage.tsx (Líneas 435-455) */}
<div>
  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
    Seleccionar Cliente <span className="text-rose-500">*</span>
  </label>
  <select
    value={selectedCustomerId}
    onChange={handleCustomerChange}
    disabled={isLoadingCustomers}
    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ..."
  >
    <option value="">-- Seleccione un cliente --</option>
    {customers.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name} ({c.id}) - {c.customerType} [Saldo: ${Number(c.currentBalance).toFixed(2)}]
      </option>
    ))}
  </select>
</div>
```

#### Discrepancias Identificadas
1. **Redundancia Crítica de UI ("Seleccionar Cliente *")**: El usuario tiene dos maneras contradictorias de seleccionar el cliente en la misma pantalla: el botón modal `Buscar Cliente` y el `<select>` desplegable. Esto recarga visualmente el formulario y desordena el flujo de trabajo.
2. **Inconsistencia de Etiquetas**:
   - Blazor usa: `Cliente:`
   - React usa: `ID Cliente * (5 letras)` y `Seleccionar Cliente *`.

#### Recomendación de Paridad
1. **Eliminar por completo el `<select>` dropdown**.
2. Dejar la fila dividida en 2 columnas principales (50% Cliente, 50% Cédula / RUC) exactamente como en Blazor:
   - **Columna Izquierda**: Input de cliente en modo `readOnly` con el botón `Buscar Cliente`.
   - **Columna Derecha**: Input `customerDocument`.
3. Inmediatamente debajo del input de cliente, desplegar la insignia de cliente seleccionado:
   ```tsx
   {selectedCustomer && (
     <div className="flex items-center gap-2 mt-1.5 flex-wrap">
       <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
         <CheckCircle className="h-3.5 w-3.5" />
         Cliente Habilitado: {selectedCustomer.name}
       </span>
       <Badge variant={selectedCustomer.customerType === 'Empresa' ? 'info' : 'default'}>
         {selectedCustomer.customerType}
       </Badge>
     </div>
   )}
   ```

---

### Aspecto 3: Datos de Envío (`shipAddress`, `shipCity`, `shipCountry`, `shipPostalCode`)

#### Tabla Comparativa de Paridad

| Propiedad / Campo | Especificación Blazor (`main`) | Implementación React (`React`) | Evaluación / Discrepancia |
| :--- | :--- | :--- | :--- |
| **`shipAddress` Label** | `Dirección:` (`CreateOrderMessages.ShipAddressLabel`) | `Dirección de Entrega * (máx 60 caracteres)` | Discrepancia menor en label |
| **`shipAddress` Placeholder** | `Dirección completa (máx. 60 caracteres)` | `Ej. Av. 10 de Agosto N24-123 y Colón` | Placeholder diferente |
| **`shipAddress` Longitud** | `maxlength="60"` | `maxLength={60}`, `slice(0, 60)` | ✅ Paridad 100% |
| **`shipAddress` Caracteres** | Solo alfanumérico, acentos y signos `.,#- /°` | `allowAddressChars` y `sanitizeAddress` | ✅ Paridad 100% |
| **`shipAddress` Ayuda/Contador** | Texto explicativo de caracteres permitidos y badge `L/60` | Muestra `{shipAddress.length}/60 caracteres` | Falta texto de caracteres permitidos |
| **`shipCity` Label** | `Ciudad:` (`CreateOrderMessages.ShipCityLabel`) | `Ciudad *` | Discrepancia menor |
| **`shipCity` Placeholder** | `Ciudad (máx. 15 letras)` | `Ej. Quito` | Placeholder diferente |
| **`shipCity` Longitud** | Mínimo 3, Máximo 15 | Mínimo 3, Máximo 15 (`maxLength={15}`) | ✅ Paridad 100% |
| **`shipCity` Caracteres** | Solo letras y espacios (sin dígitos) | `allowOnlyLettersAndSpaces`, `sanitizeLettersAndSpaces` | ✅ Paridad 100% |
| **`shipCity` Contador/Ayuda** | `3 a 15 letras (sin números)` + badge dinámico | No muestra badge ni leyenda de ayuda | ⚠️ Falta feedback visual |
| **`shipCity` Valor Inicial** | Vacío (`""`) | `"Quito"` (Prellenado fijo) | Blazor no prellena valores |
| **`shipCountry` Label** | `País:` (`CreateOrderMessages.ShipCountryLabel`) | `País *` | Discrepancia menor |
| **`shipCountry` Placeholder**| `País (máx. 15 letras)` | `Ecuador` | Placeholder diferente |
| **`shipCountry` Longitud** | Mínimo 3, Máximo 15 | Mínimo 3, Máximo 15 (`maxLength={15}`) | ✅ Paridad 100% |
| **`shipCountry` Caracteres**| Solo letras y espacios | `allowOnlyLettersAndSpaces`, `sanitizeLettersAndSpaces` | ✅ Paridad 100% |
| **`shipCountry` Contador** | `3 a 15 letras (sin números)` + badge dinámico | No muestra badge ni leyenda de ayuda | ⚠️ Falta feedback visual |
| **`shipCountry` Valor Inicial**| Vacío (`""`) | `"Ecuador"` (Prellenado fijo) | Blazor no prellena valores |
| **`shipPostalCode` Label** | `Código Postal:` (`CreateOrderMessages.ShipPostalCodeLabel`) | `Código Postal` | Discrepancia menor |
| **`shipPostalCode` Placeholder**| `Código Postal (máx. 10)` | `Ej. 170150` | Placeholder diferente |
| **`shipPostalCode` Longitud** | `maxlength="10"` | `maxLength={10}` | ✅ Paridad 100% |
| **`shipPostalCode` Restricción**| Alfanumérico opcional hasta 10 chars | `allowOnlyDigits` (restringido a solo números) | ⚠️ Restricción excesiva en React |
| **`shipPostalCode` Valor Inicial**| Vacío (`""`) | `"170150"` (Prellenado fijo) | Blazor no prellena valores |

---

### Aspecto 4: Tabla del Carrito y Detalle de Productos

#### Comparación de Columnas de la Tabla

| Columna en Blazor (`main`) | Columna en React (`React`) | Estado de Paridad |
| :--- | :--- | :--- |
| `1. #` (Badge numérico `1`, `2`...) | *Inexistente* | ❌ Falta en React |
| `2. Id Producto` (con botón individual buscar) | Fusionado dentro de celda `Producto` | ⚠️ Diferente estructura |
| `3. Descripción Producto` | `Producto` (Nombre del ítem) | ✅ Cumple |
| `4. Stock` (`XX uds`) | `Stock Disp.` (`XX unid.`) | ✅ Cumple |
| `5. Precio Unitario` (Formato `$XX.XX`) | `Precio Unitario ($)` (Formato `$XX.XX`) | ✅ Cumple |
| `6. Cantidad` (`InputNumber` editable) | `Cantidad` (`<input type="number">`) | ✅ Cumple |
| `7. Subtotal` (`$XX.XX`) | `Subtotal ($)` (`$XX.XX`) | ✅ Cumple |
| `8. Acción` (Botón eliminar con Trash) | `Acción` (Botón eliminar con Trash) | ✅ Cumple |

#### Comportamiento del Botón Eliminar Ítem
- **Blazor (`CreateOrderComponent.razor.cs` línea 290):**
  ```csharp
  bool confirmed = await JSRuntime.InvokeAsync<bool>("confirm", CreateOrderMessages.ConfirmDeleteDetailMessage);
  if (confirmed) {
      Order.RemoveOrderDetailItem(Item);
  }
  ```
  Exige confirmación interactiva: *"¿Está seguro de que desea eliminar este producto?"*.
- **React (`CreateOrderPage.tsx` línea 201):**
  ```tsx
  const handleRemoveItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };
  ```
  Elimina el producto **inmediatamente sin confirmación**. Esto viola la paridad con la experiencia de usuario de Blazor.

#### Totales y Liquidación Financiera
- **Blazor:**
  - `Total de Unidades:` `Order.TotalUnits uds`
  - `Subtotal Base Imponible:` `$Order.SubTotal`
  - `IVA (Tarifa 15%):` `$Order.Tax` (Badge `Ecuador`)
  - `TOTAL A LIQUIDAR:` `$Order.Total`
- **React:**
  - `Subtotal Estimado:` `$financialTotals.subtotal`
  - `IVA Estimado (15%):` `$financialTotals.tax`
  - `Total Estimado:` `$financialTotals.total USD`
  - **Falta en React**: Contador consolidado de **`Total de Unidades`** (suma de todas las cantidades).
  - La terminología legal ecuatoriana en Blazor usa *"Subtotal Base Imponible"* y *"TOTAL A LIQUIDAR"*, en vez de *"Estimado"*.

---

### Aspecto 5: Banners Informativos y Avisos

#### 1. Banner de Mailtrap / Orden Especial
- **Blazor:**
  - En el encabezado principal de la página:
    > *"Registra una nueva orden de venta para un cliente. Las órdenes con más de 3 productos serán tratadas como órdenes especiales y notificarán al administrador mediante Mailtrap."*
  - En la cabecera de la sección de productos cuando `Order.OrderDetails.Count > 3`:
    > Badge destacado: `Orden Especial (> 3 productos) 👉 Se notificará vía Mailtrap`
- **React:**
  - Posee un banner condicional cuando `cartItems.length > 3` en la sección del carrito (Líneas 632-641).
  - **Diferencia menor**: La descripción de cabecera en React no menciona la regla de Mailtrap para órdenes de más de 3 productos.

#### 2. Desglose y Mensaje de IVA (15%)
- **Blazor:**
  - Título con badge: `Facturación Inmutable con IVA 15%`.
  - Caja izquierda: `Condiciones y Trazabilidad` (Facturación Inmediata, Instantánea Histórica de Precios, Descuento Automático de Stock).
  - En el modal de Comprobante: `Nota de Auditoría Legal: Registro de Integridad Histórica...`.
- **React:**
  - Texto al pie de la tabla:
    > *"• El IVA aplicado corresponde a la tarifa vigente en Ecuador (15%)."*
    > *"• Al emitirse, se actualizará automáticamente el inventario de existencias."*
  - Falta el panel formal de *Condiciones y Trazabilidad*.

#### 3. Bloqueo de Envío de Orden
- **Blazor:**
  - Botón deshabilitado si `Order.OrderDetails.Count == 0`.
  - Bloqueo en `HandleValidSubmit` si el cliente posee saldo pendiente (`CustomerSelectedError`).
- **React:**
  - `isSubmitDisabled` verifica exhaustivamente:
    `createOrderMutation.isPending || !selectedCustomerId || hasPendingBalance || !documentValidation.isValid || cartItems.length === 0 || !shipAddress.trim()`.
  - Excelente implementación, incluso superior a Blazor en reactividad en el cliente.

---

## 4. Matriz de Discrepancias y Recomendaciones Exactas

| # | Discrepancia Detectada | Ubicación en React | Solución / Recomendación de Código Exacta |
| :- | :--- | :--- | :--- |
| **D1** | Campo `customerId` editable por teclado. | `CreateOrderPage.tsx:411-421` | Añadir propiedad `readOnly`, cambiar placeholder a `"Seleccione del catálogo"`, cursor pointer y abrir modal al hacer clic. |
| **D2** | Dropdown `<select>` redundante ("Seleccionar Cliente *"). | `CreateOrderPage.tsx:434-455` | **Eliminar bloque `<select>` completo**. Dejar diseño de 2 columnas (Cliente y Cédula/RUC) con visualización de estado de cliente. |
| **D3** | Eliminación de ítem del carrito sin confirmación. | `CreateOrderPage.tsx:201-203` | Incorporar `window.confirm('¿Está seguro de que desea eliminar este producto?')` antes de filtrar el array. |
| **D4** | Falta de columna `#` (Ítem secuencial) en tabla de carrito. | `CreateOrderPage.tsx:656-663` | Agregar columna `<TableHead className="w-12 text-center">#</TableHead>` y renderizar `index + 1`. |
| **D5** | Falta de `Total de Unidades` en el resumen financiero. | `CreateOrderPage.tsx:719-734` | Calcular `totalUnits = cartItems.reduce((acc, i) => acc + i.quantity, 0)` y mostrar fila `"Total de Unidades: {totalUnits} uds"`. |
| **D6** | `shipPostalCode` restringe letras/guiones. | `CreateOrderPage.tsx:603` | Eliminar `onKeyDown={allowOnlyDigits}` y `sanitizeDigits`, permitiendo caracteres postales generales hasta 10 caracteres. |
| **D7** | Valores prellenados no existentes en Blazor (`Quito`, `Ecuador`, `170150`). | `CreateOrderPage.tsx:56-58` | Inicializar `shipCity`, `shipCountry` y `shipPostalCode` como strings vacíos `""` o mantener como sugerencia editable pero sin forzar. |
| **D8** | Textos de totales usan *"Estimado"* en lugar de terminología contable Blazor. | `CreateOrderPage.tsx:720-730` | Reemplazar por `"Subtotal Base Imponible"`, `"IVA (Tarifa 15%)"` y `"TOTAL A LIQUIDAR"`. |

---

## 5. Conclusión y Dictamen Técnico

El componente React `CreateOrderPage.tsx` y sus subcomponentes modales asociados (`CustomerSelectorModal` y `ProductSelectorModal`) implementan con solidez la lógica de negocio central (cálculo de IVA al 15%, validación estricta de cédula/RUC ecuatoriano por módulo 10/11, bloqueo de clientes morosos y generación de comprobante de factura con snapshot inmutable).

Sin embargo, para alcanzar el **100% de paridad formal y ergonomía operativa**:
1. **Es imperativo remover el dropdown redundante de clientes** y convertir el campo `customerId` en estrictamente `readOnly`.
2. **Debe restaurarse el diálogo de confirmación** al eliminar productos de la orden.
3. **Debe incluirse la columna de numeración `#`** y el desglose de **`Total de Unidades`** en la liquidación.

---
*Reporte generado y archivado para el plan de refactorización y aseguramiento de calidad de NorthWind Sales.*
