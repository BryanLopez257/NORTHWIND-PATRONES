<script setup lang="ts">
import { ref } from 'vue';
import { Settings, Save, RotateCcw, CheckCircle2, AlertCircle, Globe, Shield } from 'lucide-vue-next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
} from '@/shared/ui';
import {
  currentApiBaseUrl,
  DEFAULT_API_URL,
  setApiBaseUrl,
  resetApiBaseUrl,
} from '@/core/config/apiConfig';

const inputUrl = ref(currentApiBaseUrl.value);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const handleSave = () => {
  successMessage.value = null;
  errorMessage.value = null;

  if (!inputUrl.value.trim()) {
    errorMessage.value = 'La URL del Backend no puede estar vacía.';
    return;
  }

  const saved = setApiBaseUrl(inputUrl.value);
  if (saved) {
    successMessage.value = `¡Configuración guardada! Nueva URL activa: ${currentApiBaseUrl.value}`;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } else {
    errorMessage.value = 'Formato de URL inválido. Asegúrese de incluir http:// o https://';
  }
};

const handleReset = () => {
  resetApiBaseUrl();
  inputUrl.value = DEFAULT_API_URL;
  successMessage.value = `Se restableció la URL predeterminada: ${DEFAULT_API_URL}`;
  errorMessage.value = null;
  setTimeout(() => {
    successMessage.value = null;
  }, 4000);
};
</script>

<template>
  <div class="space-y-6 w-full max-w-4xl pb-12">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
        <Settings class="h-6 w-6 text-sky-600" />
        <span>Configuración del Sistema</span>
      </h1>
      <p class="text-sm text-slate-500 mt-0.5">
        Gestión dinámica de conexiones, endpoints y parámetros globales de la aplicación.
      </p>
    </div>

    <!-- Alert Feedback -->
    <div
      v-if="successMessage"
      class="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-center space-x-2 animate-fade-in"
    >
      <CheckCircle2 class="h-5 w-5 text-emerald-600 shrink-0" />
      <span class="font-medium">{{ successMessage }}</span>
    </div>

    <div
      v-if="errorMessage"
      class="p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-center space-x-2 animate-fade-in"
    >
      <AlertCircle class="h-5 w-5 text-rose-600 shrink-0" />
      <span class="font-medium">{{ errorMessage }}</span>
    </div>

    <!-- Card: Backend API URL Configuration -->
    <Card class="border-slate-200 shadow-xs">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <Globe class="h-5 w-5 text-sky-600" />
            <CardTitle class="text-base text-slate-900">
              Conexión al Servidor Web API
            </CardTitle>
          </div>
          <Badge variant="info">En caliente / Reactivo</Badge>
        </div>
        <CardDescription class="text-xs text-slate-500 mt-1">
          Modifique la dirección base a la que apuntan todas las peticiones HTTP (Axios / TanStack Query). El cambio surte efecto inmediatamente sin necesidad de recargar la página.
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            URL Base del Backend (BaseURL) *
          </label>
          <Input
            id="api-url"
            v-model="inputUrl"
            placeholder="http://localhost:5000"
            class="font-mono text-sm"
          />
          <p class="text-[11px] text-slate-400 mt-1">
            Valor por defecto configurado: <code class="font-mono text-sky-700">{{ DEFAULT_API_URL }}</code>
          </p>
        </div>

        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
          <div class="flex items-center space-x-1.5 font-semibold text-slate-800">
            <Shield class="h-4 w-4 text-sky-600" />
            <span>Información de Estado</span>
          </div>
          <p>
            URL Base Activa: <strong class="font-mono text-sky-700">{{ currentApiBaseUrl }}</strong>
          </p>
        </div>
      </CardContent>

      <CardFooter class="flex justify-between items-center bg-slate-50/50 border-t border-slate-100 py-3 px-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          @click="handleReset"
          class="text-slate-600 hover:text-slate-900"
        >
          <RotateCcw class="h-4 w-4 mr-1.5" />
          Restablecer Predeterminado
        </Button>

        <Button
          type="button"
          size="sm"
          @click="handleSave"
          class="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Save class="h-4 w-4 mr-1.5" />
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
