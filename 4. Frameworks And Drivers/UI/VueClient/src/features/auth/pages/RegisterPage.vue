<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-vue-next';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui';
import { allowOnlyLettersAndSpaces, sanitizeLettersAndSpaces } from '@/core/utils/inputFilters';
import { authService } from '../authService';
import { registerSchema, type RegisterFormData } from '../schemas';

const router = useRouter();

const formData = ref<RegisterFormData>({
  firstName: '',
  secondName: '',
  lastName: '',
  secondLastName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errors = ref<Record<string, string>>({});
const serverError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isLoading = ref(false);

const handleFirstNameInput = (val: string) => {
  formData.value.firstName = sanitizeLettersAndSpaces(val).slice(0, 50);
};

const handleSecondNameInput = (val: string) => {
  formData.value.secondName = sanitizeLettersAndSpaces(val).slice(0, 50);
};

const handleLastNameInput = (val: string) => {
  formData.value.lastName = sanitizeLettersAndSpaces(val).slice(0, 50);
};

const handleSecondLastNameInput = (val: string) => {
  formData.value.secondLastName = sanitizeLettersAndSpaces(val).slice(0, 50);
};

const validateAll = (): boolean => {
  errors.value = {};
  const result = registerSchema.safeParse(formData.value);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!errors.value[field]) {
        errors.value[field] = issue.message;
      }
    }
    return false;
  }
  return true;
};

const onSubmit = async () => {
  serverError.value = null;
  successMessage.value = null;

  if (!validateAll()) return;

  isLoading.value = true;
  try {
    await authService.register({
      email: formData.value.email.trim(),
      password: formData.value.password,
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      secondName: formData.value.secondName?.trim() || undefined,
      secondLastName: formData.value.secondLastName?.trim() || undefined,
    });

    successMessage.value = 'Usuario registrado exitosamente. Ya puede iniciar sesión con sus credenciales.';
    formData.value = {
      firstName: '',
      secondName: '',
      lastName: '',
      secondLastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    setTimeout(() => {
      router.replace({ path: '/login', state: { registered: true } });
    }, 2000);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      let hasMappedField = false;
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        const keys: Array<keyof RegisterFormData> = [
          'firstName',
          'secondName',
          'lastName',
          'secondLastName',
          'email',
          'password',
        ];

        for (const key of keys) {
          const fieldError =
            err.fieldErrors[key] || err.fieldErrors[key.charAt(0).toUpperCase() + key.slice(1)];
          if (fieldError) {
            errors.value[key] = fieldError;
            hasMappedField = true;
          }
        }
      }

      if (!hasMappedField || err.message) {
        serverError.value = err.message || 'Error al procesar el registro.';
      }
    } else {
      serverError.value = getErrorMessage(err, 'Error al registrar el usuario.');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
    <Card class="w-full max-w-xl shadow-xl border-slate-200/80 bg-white/95 backdrop-blur-xs my-8">
      <CardHeader class="text-center pb-2">
        <div class="mx-auto bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-3 rounded-2xl w-fit shadow-md mb-2">
          <UserPlus class="h-8 w-8" />
        </div>
        <CardTitle class="text-2xl font-bold tracking-tight text-slate-900">
          Registro de Usuario
        </CardTitle>
        <CardDescription class="text-slate-500 text-sm mt-1">
          Crea tu cuenta para comenzar a operar en NorthWind
        </CardDescription>
      </CardHeader>

      <CardContent class="pt-4">
        <div
          v-if="successMessage"
          class="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2"
        >
          <CheckCircle2 class="h-5 w-5 shrink-0 text-emerald-600" />
          <div class="flex-1 font-medium">{{ successMessage }}</div>
        </div>

        <div
          v-if="serverError"
          class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
        >
          <AlertCircle class="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <div class="flex-1 whitespace-pre-line leading-relaxed">{{ serverError }}</div>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
          <!-- Nombres -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                id="reg-first-name"
                label="Primer Nombre *"
                placeholder="Ej. Juan"
                :max-length="50"
                auto-complete="given-name"
                :error="errors.firstName"
                :model-value="formData.firstName"
                @update:model-value="handleFirstNameInput"
                @keydown="allowOnlyLettersAndSpaces"
              />
              <p class="text-[11px] text-slate-500 mt-1">Solo letras y espacios (2 a 50 caracteres). Sin emojis.</p>
            </div>

            <div>
              <Input
                id="reg-second-name"
                label="Segundo Nombre (Opcional)"
                placeholder="Ej. Carlos (opcional)"
                :max-length="50"
                auto-complete="additional-name"
                :error="errors.secondName"
                :model-value="formData.secondName"
                @update:model-value="handleSecondNameInput"
                @keydown="allowOnlyLettersAndSpaces"
              />
              <p class="text-[11px] text-slate-500 mt-1">Opcional. 2 a 50 caracteres. Sin emojis.</p>
            </div>
          </div>

          <!-- Apellidos -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                id="reg-last-name"
                label="Primer Apellido *"
                placeholder="Ej. Pérez"
                :max-length="50"
                auto-complete="family-name"
                :error="errors.lastName"
                :model-value="formData.lastName"
                @update:model-value="handleLastNameInput"
                @keydown="allowOnlyLettersAndSpaces"
              />
              <p class="text-[11px] text-slate-500 mt-1">Solo letras y espacios (2 a 50 caracteres). Sin emojis.</p>
            </div>

            <div>
              <Input
                id="reg-second-last-name"
                label="Segundo Apellido (Opcional)"
                placeholder="Ej. Gómez (opcional)"
                :max-length="50"
                auto-complete="family-name"
                :error="errors.secondLastName"
                :model-value="formData.secondLastName"
                @update:model-value="handleSecondLastNameInput"
                @keydown="allowOnlyLettersAndSpaces"
              />
              <p class="text-[11px] text-slate-500 mt-1">Opcional. 2 a 50 caracteres. Sin emojis.</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <Input
              id="reg-email"
              label="Correo *"
              type="email"
              placeholder="ejemplo@northwind.com"
              :max-length="100"
              auto-complete="email"
              :error="errors.email"
              v-model="formData.email"
            />
            <p class="text-[11px] text-slate-500 mt-1">Solo letras, números, punto (.) y arroba (@). Máx. 100 caracteres.</p>
          </div>

          <!-- Contraseñas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                id="reg-password"
                label="Contraseña *"
                type="password"
                placeholder="Mínimo 6 caracteres"
                :max-length="100"
                auto-complete="new-password"
                :error="errors.password"
                v-model="formData.password"
              />
              <p class="text-[11px] text-slate-500 mt-1">Mín. 6, mayúscula, dígito y símbolo. Sin emojis.</p>
            </div>

            <div>
              <Input
                id="reg-confirm-password"
                label="Confirmar contraseña *"
                type="password"
                placeholder="Repite la contraseña"
                :max-length="100"
                auto-complete="new-password"
                :error="errors.confirmPassword"
                v-model="formData.confirmPassword"
              />
            </div>
          </div>

          <Button type="submit" class="w-full mt-3" :is-loading="isLoading">
            <UserPlus class="h-4 w-4 mr-2" />
            Registrar
          </Button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
          ¿Ya tienes una cuenta registrada?
          <RouterLink
            to="/login"
            class="inline-flex items-center font-medium text-sky-600 hover:text-sky-700 hover:underline ml-1"
          >
            Iniciar sesión
          </RouterLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
