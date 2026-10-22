# NorthWind Sales - Frontend Vue 3 (Clean Architecture)

Cliente Web SPA desarrollado con **Vue 3**, **TypeScript**, **Vite** y **Tailwind CSS**, implementado siguiendo los principios de Clean Architecture y logrando paridad 1:1 con la versión React.

## 🚀 Tecnologías

* **Core:** Vue 3 (Composition API con `<script setup>` y TypeScript estricto)
* **Build Tool:** Vite 6
* **Estilos:** Tailwind CSS 3, clsx, tailwind-merge
* **Enrutamiento:** Vue Router 4 con guardias de navegación (`router.beforeEach`)
* **Estado Global & JWT:** Pinia (`useAuthStore`) con decodificación de claims y persistencia en localStorage
* **Peticiones & Caché:** TanStack Vue Query v5 (`@tanstack/vue-query`) y Axios
* **Validación:** Zod v3 y validador de cédula/RUC ecuatoriana (`ecuadorianIdValidator.ts`)
* **Iconos:** Lucide Vue Next (`lucide-vue-next`)

## 🛠️ Ejecución en Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

## 📦 Paridad de Módulos

* **Autenticación (`features/auth`):** Login, Registro con filtros de entrada en tiempo real, validación estricta y redirecciones protegidas.
* **Clientes (`features/customers`):** Listado con segmentación de tipos (Empresa / Persona Natural), rangos de saldo comercial, ordenación y modal de edición.
* **Productos (`features/products`):** Catálogo con búsqueda por nombre, filtros de existencias (Agotado, Stock Bajo, En Stock) y modal de administración.
* **Órdenes de Venta (`features/orders`):** Formulario integral con selección modal de clientes (validación de saldo al día $0.00), catálogo de productos, carrito de compras dinámico, cálculo de IVA (15%) y emisión de órdenes.
* **Facturas (`features/invoices`):** Historial de facturas emitidas y modal de comprobante oficial (`InvoiceVoucher`) con soporte completo de impresión limpia (`window.print()`).
