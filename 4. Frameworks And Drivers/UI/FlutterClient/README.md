# NorthWind Sales - Frontend Flutter

Implementación multiplataforma (Web, Windows Desktop, Android, iOS, macOS, Linux) del frontend del sistema de ventas empresarial **NorthWind**, adaptado 1:1 desde la versión en **Blazor WebAssembly** respetando los principios de **Clean Architecture**, consumo de endpoints REST con autenticación **JWT** y compatibilidad con el backend en **ASP.NET Core (.NET 10)**.

---

## 🏗️ Arquitectura de la Solución en Flutter

Siguiendo Clean Architecture y separación de responsabilidades:

```text
lib/
├── core/
│   ├── config/api_config.dart          # Configuración dinámica del backend (localhost, 10.0.2.2 o IP remota)
│   ├── constants/
│   │   ├── app_colors.dart             # Paleta de colores oficial NorthWind (Primary #2563EB, etc.)
│   │   ├── app_theme.dart              # Tema Material 3 corporativo
│   │   ├── endpoints.dart              # Constantes de rutas (/user/Login, /CreateOrder, /products, etc.)
│   │   └── messages.dart               # Textos, etiquetas y mensajes de error idénticos a Blazor
│   ├── network/
│   │   ├── api_client.dart             # Cliente HTTP con delegación de Bearer Token y manejo de ProblemDetails
│   │   └── api_exception.dart          # Excepciones con lista de errores de validación de campo
│   ├── storage/token_storage.dart      # Persistencia de tokens de sesión con SharedPreferences
│   └── utils/
│       ├── ecuadorian_validator.dart   # Algoritmo de validación de Cédula (Mód. 10) y RUC ecuatoriano
│       └── jwt_decoder.dart            # Decodificador de tokens JWT y extracción de claims (FullName, email)
├── data/
│   ├── models/                         # DTOs de autenticación, clientes, productos, órdenes y facturas
│   └── repositories/                   # Implementación de llamadas a la Web API (Clean Architecture)
├── providers/                          # Manejo de estado reactivo (ChangeNotifier)
│   ├── auth_provider.dart              # Estado de sesión de usuario y claims
│   ├── customers_provider.dart         # Estado y CRUD de clientes con segmentación
│   ├── products_provider.dart          # Estado y CRUD de productos con stock
│   ├── orders_provider.dart            # Carrito de orden, validación de deudores y cálculo Subtotal/IVA 15%/Total
│   └── invoices_provider.dart          # Historial y filtrado de facturas
└── ui/
    ├── widgets/
    │   ├── app_navigation_scaffold.dart # Shell moderno responsivo (Navbar, avatar, drawer)
    │   ├── auth_restricted_view.dart    # Vista de acceso restringido para rutas no autorizadas
    │   └── status_badges.dart           # Badges de estado de balance, existencias y tipo de cliente
    └── pages/
        ├── home_page.dart              # Pantalla principal con banner Hero y tarjetas de características
        ├── auth/                       # Iniciar Sesión y Registro con validaciones completas
        ├── customers/                  # Listado con filtros en tiempo real, modales de Crear, Editar y Eliminar
        ├── products/                   # Listado con filtros de stock/precio, modales de Crear, Editar y Eliminar
        ├── orders/                     # Formulario de orden con búsqueda de clientes, validación de Cédula/RUC y productos
        ├── invoices/                   # Historial de facturas y Comprobante Legal Inmutable (Voucher)
        └── settings/                   # Configuración de URL del backend
```

---

## ✨ Características Implementadas (Paridad con Blazor)

1. **Módulo de Autenticación & Membresía (JWT)**:
   - Registro de usuario con nombres, apellidos, correo, contraseña y confirmación de contraseña, validaciones contra espacios y emojis.
   - Inicio de sesión con obtención y almacenamiento persistente del token JWT Bearer.
   - Extracción de claims (`FullName`, `email`) y avatar con iniciales en la barra de navegación.
   - Cierre de sesión y protección de rutas (`AuthRestrictedView`).

2. **Gestión de Clientes (CRUD & Segmentación)**:
   - Segmentación por tipo de cliente: *Persona Natural* vs *Empresa*.
   - Filtros en tiempo real por término de búsqueda, estado de saldo (*Al Día*, *Con Saldo Pendiente*, *Saldo Elevado*), rango de saldo y ordenamiento.
   - Creación y edición con validación de código de 5 letras mayúsculas (ej: `ALFKI`), nombre y saldo inicial.
   - Eliminación con modal de confirmación.

3. **Gestión de Productos (CRUD & Inventario)**:
   - Búsqueda en tiempo real por nombre de producto.
   - Filtros por nivel de existencias (*En Stock*, *Stock Bajo ≤ 10*, *Agotados*) y rango de precio.
   - Creación, edición y eliminación de productos.

4. **Emisión de Órdenes de Compra (`CreateOrder`)**:
   - Selección de cliente con autocompletado o modal de catálogo.
   - **Control de Saldo Deudor**: Si el cliente tiene deuda pendiente (`currentBalance > 0`), se bloquea la orden con alerta de advertencia.
   - **Validación Ecuatoriana de Cédula y RUC**: Algoritmo nativo de Módulo 10 y Módulo 11 que verifica la autenticidad del documento en tiempo real y muestra un distintivo verde o rojo.
   - Selección de productos con validación atómica de existencias.
   - **Insignia de Orden Especial**: Se activa automáticamente cuando se añaden más de 3 productos a la orden, indicando la notificación automática por Mailtrap.
   - Cálculo automático de **Subtotal Neto**, **IVA 15%** y **Total a Pagar**.
   - Al registrar la orden, apertura inmediata del comprobante de factura legal.

5. **Historial de Facturas & Comprobante Digital (Snapshot Inmutable)**:
   - Búsqueda de facturas por número (`FAC-000001`), nombre de cliente o código.
   - Modal de **Comprobante de Factura Legal**:
     - Membrete legal de **NorthWind Sales S.A.** (RUC: 1790012345001, Quito - Ecuador).
     - Datos del adquirente congelados al momento de emisión (Snapshot Pattern).
     - Detalle de productos y precios inmutables.
     - Liquidación fiscal con IVA 15%.
     - Nota de auditoría de integridad histórica.
     - Botón para imprimir o exportar comprobante.

6. **Configuración de Servidor**:
   - Permite alternar la URL de la Web API entre `http://localhost:5000` (Windows / Web), `http://10.0.2.2:5000` (Emulador Android) o la IP de red local para dispositivos físicos.

---

## 🚀 Cómo Ejecutar la Aplicación

### 1. Iniciar el Backend (.NET Web API)
En la carpeta del proyecto backend (`Northwind con blazor`):
```bash
dotnet run --project "4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi"
```
La Web API estará disponible en `http://localhost:5000`.

### 2. Ejecutar el Frontend en Flutter
En la carpeta del proyecto Flutter (`Northwind con flutter`):

#### En Windows Desktop:
```bash
flutter run -d windows
```

#### En el Navegador Web (Chrome / Edge):
```bash
flutter run -d chrome
```

#### En un Emulador Android:
```bash
flutter run -d android
```
*(En el emulador Android, la aplicación conectará por defecto a `http://10.0.2.2:5000`)*.

---

## 🧪 Pruebas Automatizadas

Para ejecutar las pruebas unitarias y de widgets:
```bash
flutter test
```

Para verificar que no existan advertencias ni errores de código:
```bash
flutter analyze
```
