<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-vue-next';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Dialog } from '@/shared/ui';
import {
  allowOnlyLettersAndSpaces,
  sanitizeLettersAndSpaces,
  allowEmailChars,
  sanitizeEmail,
  handlePasteFilter,
} from '@/core/utils/inputFilters';
import { authService } from '../authService';
import { registerSchema, type RegisterFormData } from '../schemas';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.vue';

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

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showLeaveConfirmModal = ref(false);

const errors = ref<Record<string, string>>({});
const serverError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isLoading = ref(false);

const isFormDirtyOrFilled = computed(() => {
  return (
    Boolean(formData.value.firstName.trim()) ||
    Boolean(formData.value.secondName?.trim()) ||
    Boolean(formData.value.lastName.trim()) ||
    Boolean(formData.value.secondLastName?.trim()) ||
    Boolean(formData.value.email.trim()) ||
    Boolean(formData.value.password) ||
    Boolean(formData.value.confirmPassword)
  );
});

const handleGoToLogin = () => {
  if (isFormDirtyOrFilled.value) {
    showLeaveConfirmModal.value = true;
  } else {
    router.push('/login');
  }
};

const handleConfirmLeave = () => {
  showLeaveConfirmModal.value = false;
  router.push('/login');
};

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

const handleLettersPaste = (event: ClipboardEvent) => {
  handlePasteFilter(event, (text) => sanitizeLettersAndSpaces(text).slice(0, 50));
};

const handleEmailPaste = (event: ClipboardEvent) => {
  handlePasteFilter(event, (text) => sanitizeEmail(text, 254));
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
      email: formData.value.email.trim().toLowerCase(),
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
                @paste="handleLettersPaste"
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
                @paste="handleLettersPaste"
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
                @paste="handleLettersPaste"
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
                @paste="handleLettersPaste"
              />
              <p class="text-[11px] text-slate-500 mt-1">Opcional. 2 a 50 caracteres. Sin emojis.</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <Input
              id="reg-email"
              label="Correo electrónico *"
              type="email"
              placeholder="ejemplo@northwind.com"
              :max-length="254"
              auto-complete="email"
              :error="errors.email"
              v-model="formData.email"
              @keydown="allowEmailChars"
              @paste="handleEmailPaste"
            />
            <p class="text-[11px] text-slate-500 mt-1">Permite letras, números, '.', '+', '-', '_' y '@'. Máx. 254 caracteres.</p>
          </div>

          <!-- Contraseñas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                id="reg-password"
                label="Contraseña *"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                :max-length="100"
                auto-complete="new-password"
                :error="errors.password"
                v-model="formData.password"
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
              <PasswordStrengthIndicator
                v-if="formData.password.length > 0"
                :password="formData.password"
                class="mt-2"
              />
              <p v-else class="text-[11px] text-slate-500 mt-1">Mín. 6, mayúscula, dígito y símbolo. Sin emojis.</p>
            </div>

            <div>
              <Input
                id="reg-confirm-password"
                label="Confirmar contraseña *"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Repite la contraseña"
                :max-length="100"
                auto-complete="new-password"
                :error="errors.confirmPassword"
                v-model="formData.confirmPassword"
              >
                <template #suffix>
                  <button
                    type="button"
                    tabindex="-1"
                    class="text-slate-400 hover:text-slate-600 focus:outline-none"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                    <EyeOff v-else class="h-4 w-4" />
                  </button>
                </template>
              </Input>
            </div>
          </div>

          <Button type="submit" class="w-full mt-3" :is-loading="isLoading">
            <UserPlus class="h-4 w-4 mr-2" />
            Registrar
          </Button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
          ¿Ya tienes una cuenta registrada?
          <button
            type="button"
            @click="handleGoToLogin"
            class="inline-flex items-center font-medium text-sky-600 hover:text-sky-700 hover:underline ml-1 cursor-pointer focus:outline-none"
          >
            Iniciar sesión
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Modal de confirmación al salir con campos llenos/dirty -->
    <Dialog
      :open="showLeaveConfirmModal"
      @update:open="showLeaveConfirmModal = $event"
      title="¿Desea salir del registro?"
      description="Tiene datos ingresados en el formulario. Si va a iniciar sesión ahora, se perderán todos los datos completados. ¿Desea continuar?"
    >
      <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          @click="showLeaveConfirmModal = false"
        >
          Permanecer aquí
        </Button>
        <Button
          type="button"
          class="bg-sky-600 hover:bg-sky-700 text-white"
          @click="handleConfirmLeave"
        >
          Sí, ir a Iniciar sesión
        </Button>
      </div>
    </Dialog>
  </div>
</template>
