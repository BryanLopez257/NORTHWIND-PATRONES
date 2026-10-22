/**
 * ============================================================================
 * ARCHIVO: src/main.ts
 * PROPÓSITO: Punto de entrada principal (Bootstrap) de la aplicación Vue 3.
 * ============================================================================
 * Aquí se inicializa la instancia de Vue y se registran los plugins globales:
 * 1. Pinia: Gestión de estado global (autenticación y tokens JWT).
 * 2. Vue Router: Manejador de rutas y guardias de seguridad de navegación.
 * 3. VueQueryPlugin (TanStack Query): Gestión de caché, peticiones asíncronas y refetching.
 * 4. Tailwind CSS: Estilos globales y reglas de impresión en index.css.
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import router from './app/router';
import { queryClient } from './app/providers/queryClient';
import './index.css';

// 1. Crear la instancia de la aplicación
const app = createApp(App);

// 2. Instanciar Pinia para estado global reactivo
const pinia = createPinia();

// 3. Conectar plugins fundamentales a la aplicación
app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, { queryClient });

// 4. Montar la app en el contenedor raíz del DOM (#app en index.html)
app.mount('#app');
