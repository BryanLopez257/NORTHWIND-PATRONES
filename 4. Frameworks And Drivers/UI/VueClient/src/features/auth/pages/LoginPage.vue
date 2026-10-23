<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { LogIn, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-vue-next';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui';
import { allowEmailChars, handlePasteFilter, sanitizeEmail } from '@/core/utils/inputFilters';
import { authService } from '../authService';
import { loginSchema, type LoginFormData } from '../schemas';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const formData = ref<LoginFormData>({
  email: '',
  password: '',
});

const showPassword = ref(false);
const errors = ref<Record<string, string>>({});
const serverError = ref<string | null>(null);
const isLoading = ref(false);

const registrationSuccess = computed(() => {
  return history.state?.registered === true || route.query.registered === 'true';
});

const handleEmailPaste = (event: ClipboardEvent) => {
  handlePasteFilter(event, (text) => sanitizeEmail(text, 100));
};

const validateField = (field: keyof LoginFormData) => {
  const result = loginSchema.safeParse(formData.value);
  if (!result.success) {
    const formatted = result.error.format();
    errors.value[field] = formatted[field]?._errors?.[0] || '';
  } else {
    errors.value[field] = '';
  }
};

const onSubmit = async () => {
  serverError.value = null;
  errors.value = {};

  const validation = loginSchema.safeParse(formData.value);
  if (!validation.success) {
    const formatted = validation.error.format();
    if (formatted.email?._errors?.[0]) errors.value.email = formatted.email._errors[0];
    if (formatted.password?._errors?.[0]) errors.value.password = formatted.password._errors[0];
    return;
  }

  isLoading.value = true;
  try {
    const response = await authService.login(validation.data);
    authStore.login(response.accessToken);

    const redirectPath = (route.query.from as string) || (history.state?.from?.pathname as string) || '/createorder';
    router.replace(redirectPath);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        if (err.fieldErrors.email) errors.value.email = err.fieldErrors.email;
        if (err.fieldErrors.password) errors.value.password = err.fieldErrors.password;
      }
      serverError.value = err.message || 'Credenciales inválidas. Por favor verifique sus datos.';
    } else {
      serverError.value = getErrorMessage(err, 'Error al iniciar sesión. Inténtelo más tarde.');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
    <Card class="w-full max-w-md shadow-xl border-slate-200/80 bg-white/95 backdrop-blur-xs">
      <CardHeader class="text-center pb-2">
        <div class="mx-auto bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-3 rounded-2xl w-fit shadow-md mb-2">
          <ShieldCheck class="h-8 w-8" />
        </div>
        <CardTitle class="text-2xl font-bold tracking-tight text-slate-900">
          Iniciar sesión
        </CardTitle>
        <CardDescription class="text-slate-500 text-sm mt-1">
          Ingresa tus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>

      <CardContent class="pt-4">
        <div
          v-if="registrationSuccess"
          class="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2"
        >
          <span class="font-semibold">¡Cuenta creada con éxito!</span> Ya puede iniciar sesión.
        </div>

        <div
          v-if="serverError"
          class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
        >
          <AlertCircle class="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <div class="flex-1 whitespace-pre-line leading-relaxed">{{ serverError }}</div>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
          <div>
            <Input
              id="login-email"
              label="Correo"
              type="text"
              auto-complete="email"
              placeholder="ejemplo@northwind.com"
              :max-length="100"
              :error="errors.email"
              v-model="formData.email"
              @keydown="allowEmailChars"
              @paste="handleEmailPaste"
              @blur="validateField('email')"
            />
          </div>

          <div>
            <Input
              id="login-password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              auto-complete="current-password"
              placeholder="••••••••"
              :error="errors.password"
              v-model="formData.password"
              @blur="validateField('password')"
            >
              <template #suffix>
                <button
                  type="button"
                  tabindex="-1"
                  class="text-slate-400 hover:text-slate-600 focus:outline-none"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </template>
            </Input>
          </div>

          <Button type="submit" class="w-full mt-2" :is-loading="isLoading">
            <LogIn class="h-4 w-4 mr-2" />
            Iniciar sesión
          </Button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
          ¿No tienes una cuenta aún?
          <RouterLink to="/register" class="font-semibold text-sky-600 hover:text-sky-700 hover:underline ml-1">
            Crear cuenta
          </RouterLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
