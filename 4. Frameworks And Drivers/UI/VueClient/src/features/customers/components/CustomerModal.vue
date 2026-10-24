<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { AlertCircle, CheckCircle2, Building2, User } from 'lucide-vue-next';
import { Dialog, Input, Button } from '@/shared/ui';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import {
  allowOnlyAlpha,
  allowOnlyLettersAndSpaces,
  allowOnlyDigits,
  sanitizeAlphaUpper,
  sanitizeLettersAndSpaces,
  sanitizeDigits,
  handlePasteFilter,
} from '@/core/utils/inputFilters';
import { validateCedula, validateRuc } from '@/core/validators/ecuadorianIdValidator';
import type { CustomerDto } from '../types';
import { customerSchema, type CustomerFormData } from '../schemas';
import { useCreateCustomer, useUpdateCustomer } from '../composables/useCustomers';

interface Props {
  open: boolean;
  customerToEdit?: CustomerDto | null;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  customerToEdit: null,
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const isEditing = computed(() => Boolean(props.customerToEdit));
const serverError = ref<string | null>(null);
const errors = ref<Record<string, string>>({});

const formData = ref<CustomerFormData>({
  id: '',
  customerType: 'Persona Natural',
  identification: '',
  currentBalance: 0,
  firstName: '',
  secondName: '',
  lastName: '',
  secondLastName: '',
  businessName: '',
  tradeName: '',
});

const createCustomerMutation = useCreateCustomer();
const updateCustomerMutation = useUpdateCustomer();

const isSubmitting = computed(
  () => createCustomerMutation.isPending.value || updateCustomerMutation.isPending.value
);

// Validación en tiempo real del documento para feedback visual
const idValidationFeedback = computed(() => {
  const clean = formData.value.identification.trim();
  if (!clean) return null;

  if (formData.value.customerType === 'Persona Natural') {
    if (clean.length === 10) {
      const res = validateCedula(clean);
      return {
        isValid: res.isValid,
        message: res.isValid ? 'Cédula Ecuatoriana Válida (SRI)' : res.error,
      };
    }
    if (clean.length === 13) {
      const res = validateRuc(clean);
      return {
        isValid: res.isValid && res.type === 'ruc_natural',
        message:
          res.isValid && res.type === 'ruc_natural'
            ? 'RUC Natural Válido (SRI)'
            : res.error || 'RUC no corresponde a Persona Natural',
      };
    }
    return {
      isValid: false,
      message: 'Debe contener 10 dígitos (Cédula) o 13 dígitos (RUC)',
    };
  } else {
    // Empresa
    if (clean.length !== 13) {
      return {
        isValid: false,
        message: 'Las empresas requieren obligatoriamente un RUC de 13 dígitos',
      };
    }
    const res = validateRuc(clean);
    const isLegal = res.isValid && res.type !== 'ruc_natural';
    return {
      isValid: isLegal,
      message: isLegal
        ? 'RUC de Empresa Válido (SRI)'
        : res.error || 'El RUC debe pertenecer a una sociedad o ente jurídico',
    };
  }
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      serverError.value = null;
      errors.value = {};
      if (props.customerToEdit) {
        const isNatural =
          props.customerToEdit.customerType === 'Persona Natural' ||
          props.customerToEdit.customerType === 1 ||
          String(props.customerToEdit.customerType) === '1';

        formData.value = {
          id: props.customerToEdit.id.toUpperCase(),
          customerType: isNatural ? 'Persona Natural' : 'Empresa',
          identification: props.customerToEdit.identification || '',
          currentBalance: props.customerToEdit.currentBalance,
          firstName: props.customerToEdit.firstName || '',
          secondName: props.customerToEdit.secondName || '',
          lastName: props.customerToEdit.lastName || '',
          secondLastName: props.customerToEdit.secondLastName || '',
          businessName: props.customerToEdit.businessName || (!isNatural ? props.customerToEdit.name : ''),
          tradeName: props.customerToEdit.tradeName || '',
        };
      } else {
        formData.value = {
          id: '',
          customerType: 'Persona Natural',
          identification: '',
          currentBalance: 0,
          firstName: '',
          secondName: '',
          lastName: '',
          secondLastName: '',
          businessName: '',
          tradeName: '',
        };
      }
    }
  },
  { immediate: true }
);

const handleIdInput = (val: string) => {
  formData.value.id = sanitizeAlphaUpper(val, 5);
};

const handleIdPaste = (e: ClipboardEvent) => {
  handlePasteFilter(e, (text) => sanitizeAlphaUpper(text, 5));
};

const handleIdentificationInput = (val: string) => {
  const max = formData.value.customerType === 'Persona Natural' ? 13 : 13;
  formData.value.identification = sanitizeDigits(val).slice(0, max);
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

const handleLettersPaste = (e: ClipboardEvent, field: 'firstName' | 'secondName' | 'lastName' | 'secondLastName') => {
  handlePasteFilter(e, (text) => {
    const clean = sanitizeLettersAndSpaces(text).slice(0, 50);
    formData.value[field] = clean;
    return clean;
  });
};

const onSubmit = async () => {
  serverError.value = null;
  errors.value = {};

  const validation = customerSchema.safeParse(formData.value);
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors.value[field]) {
        errors.value[field] = issue.message;
      }
    }
    return;
  }

  const normalizedId = validation.data.id.trim().toUpperCase();
  const isNatural = validation.data.customerType === 'Persona Natural';

  const payload = {
    id: normalizedId,
    customerType: isNatural ? 1 : 2,
    identification: validation.data.identification.trim(),
    currentBalance: validation.data.currentBalance,
    firstName: isNatural ? validation.data.firstName?.trim() || null : null,
    secondName: isNatural ? validation.data.secondName?.trim() || null : null,
    lastName: isNatural ? validation.data.lastName?.trim() || null : null,
    secondLastName: isNatural ? validation.data.secondLastName?.trim() || null : null,
    businessName: !isNatural ? validation.data.businessName?.trim() || null : null,
    tradeName: validation.data.tradeName?.trim() || null,
  };

  try {
    if (isEditing.value) {
      await updateCustomerMutation.mutateAsync(payload);
    } else {
      await createCustomerMutation.mutateAsync(payload);
    }
    emit('update:open', false);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([key, val]) => {
          const lower = key.charAt(0).toLowerCase() + key.slice(1);
          errors.value[lower] = val;
        });
      }
      serverError.value = err.message || 'Error al guardar el cliente';
    } else {
      serverError.value = getErrorMessage(err, 'Ocurrió un error al procesar la solicitud');
    }
  }
};
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
    :title="isEditing ? 'Editar Cliente' : 'Nuevo Cliente'"
    :description="
      isEditing
        ? `Modifique los datos del cliente ${customerToEdit?.id}`
        : 'Ingrese la información tributaria y comercial para registrar un nuevo cliente en el sistema'
    "
    class="max-w-2xl"
  >
    <div
      v-if="serverError"
      class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
    >
      <AlertCircle class="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
      <div class="flex-1 whitespace-pre-line leading-relaxed">{{ serverError }}</div>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- Fila 1: Código ID y Tipo de Cliente -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Código ID (5 letras) <span class="text-rose-500">*</span>
          </label>
          <Input
            id="customer-id"
            placeholder="ALFKI"
            :disabled="isEditing"
            :max-length="5"
            :error="errors.id"
            @keydown="allowOnlyAlpha"
            @paste="handleIdPaste"
            class="font-mono uppercase tracking-wider"
            :model-value="formData.id"
            @update:model-value="handleIdInput"
          />
          <p v-if="isEditing" class="text-[11px] text-slate-400 mt-1">
            El identificador no puede modificarse una vez creado.
          </p>
          <p v-else class="text-[11px] text-slate-500 mt-1">
            Exactamente 5 letras en mayúsculas (A-Z).
          </p>
        </div>

        <div>
          <label for="customer-type" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Tipo de Contribuyente <span class="text-rose-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              @click="formData.customerType = 'Persona Natural'"
              :class="[
                'flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border text-xs font-medium transition-colors',
                formData.customerType === 'Persona Natural'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              ]"
            >
              <User class="h-4 w-4" />
              <span>Natural</span>
            </button>
            <button
              type="button"
              @click="formData.customerType = 'Empresa'"
              :class="[
                'flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border text-xs font-medium transition-colors',
                formData.customerType === 'Empresa'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              ]"
            >
              <Building2 class="h-4 w-4" />
              <span>Empresa</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Fila 2: Cédula o RUC -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Identificación SRI (Cédula o RUC) <span class="text-rose-500">*</span>
        </label>
        <Input
          id="customer-identification"
          :placeholder="formData.customerType === 'Persona Natural' ? '1710000000 o 1710000000001' : '1790012345001'"
          :max-length="13"
          :disabled="isEditing && Boolean(customerToEdit?.identification)"
          :error="errors.identification"
          @keydown="allowOnlyDigits"
          :model-value="formData.identification"
          @update:model-value="handleIdentificationInput"
        />
        <div v-if="idValidationFeedback" class="mt-1 flex items-center gap-1.5 text-xs">
          <CheckCircle2 v-if="idValidationFeedback.isValid" class="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <AlertCircle v-else class="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <span :class="idValidationFeedback.isValid ? 'text-emerald-700 font-medium' : 'text-rose-600'">
            {{ idValidationFeedback.message }}
          </span>
        </div>
      </div>

      <!-- Campos para Persona Natural -->
      <div v-if="formData.customerType === 'Persona Natural'" class="space-y-3 p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
        <span class="text-xs font-semibold text-slate-600 flex items-center gap-1">
          <User class="h-3.5 w-3.5 text-sky-600" />
          <span>Datos Personales (Persona Natural)</span>
        </span>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">
              Primer Nombre <span class="text-rose-500">*</span>
            </label>
            <Input
              id="customer-firstname"
              placeholder="Ej. Ana"
              :max-length="50"
              :error="errors.firstName"
              @keydown="allowOnlyLettersAndSpaces"
              @paste="handleLettersPaste($event, 'firstName')"
              :model-value="formData.firstName ?? ''"
              @update:model-value="handleFirstNameInput"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">
              Segundo Nombre (Opcional)
            </label>
            <Input
              id="customer-secondname"
              placeholder="Ej. María"
              :max-length="50"
              :error="errors.secondName"
              @keydown="allowOnlyLettersAndSpaces"
              @paste="handleLettersPaste($event, 'secondName')"
              :model-value="formData.secondName ?? ''"
              @update:model-value="handleSecondNameInput"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">
              Primer Apellido <span class="text-rose-500">*</span>
            </label>
            <Input
              id="customer-lastname"
              placeholder="Ej. Trujillo"
              :max-length="50"
              :error="errors.lastName"
              @keydown="allowOnlyLettersAndSpaces"
              @paste="handleLettersPaste($event, 'lastName')"
              :model-value="formData.lastName ?? ''"
              @update:model-value="handleLastNameInput"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">
              Segundo Apellido (Opcional)
            </label>
            <Input
              id="customer-secondlastname"
              placeholder="Ej. Pérez"
              :max-length="50"
              :error="errors.secondLastName"
              @keydown="allowOnlyLettersAndSpaces"
              @paste="handleLettersPaste($event, 'secondLastName')"
              :model-value="formData.secondLastName ?? ''"
              @update:model-value="handleSecondLastNameInput"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">
            Nombre Comercial (Opcional)
          </label>
          <Input
            id="customer-tradename-natural"
            placeholder="Ej. Emparedados y helados"
            :max-length="150"
            :error="errors.tradeName"
            v-model="formData.tradeName"
          />
        </div>
      </div>

      <!-- Campos para Empresa -->
      <div v-else class="space-y-3 p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
        <span class="text-xs font-semibold text-slate-600 flex items-center gap-1">
          <Building2 class="h-3.5 w-3.5 text-sky-600" />
          <span>Datos Corporativos (Empresa)</span>
        </span>

        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">
            Razón Social / Denominación Legal <span class="text-rose-500">*</span>
          </label>
          <Input
            id="customer-businessname"
            placeholder="Ej. ALFREDS FUTTERKISTE CIA. LTDA."
            :max-length="150"
            :error="errors.businessName"
            v-model="formData.businessName"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">
            Nombre Comercial (Opcional)
          </label>
          <Input
            id="customer-tradename-legal"
            placeholder="Ej. Alfreds Futterkiste"
            :max-length="150"
            :error="errors.tradeName"
            v-model="formData.tradeName"
          />
        </div>
      </div>

      <!-- Saldo Comercial -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Saldo Comercial ($) <span class="text-rose-500">*</span>
        </label>
        <Input
          id="customer-balance"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          :error="errors.currentBalance"
          class="font-mono"
          v-model="formData.currentBalance"
        />
        <p class="text-[11px] text-slate-400 mt-1">
          Clientes con saldo mayor a $0.00 tendrán bloqueada la emisión de nuevas órdenes.
        </p>
      </div>

      <!-- Acciones -->
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          @click="emit('update:open', false)"
          :disabled="isSubmitting"
        >
          Cancelar
        </Button>
        <Button type="submit" :is-loading="isSubmitting">
          {{ isEditing ? 'Guardar Cambios' : 'Registrar Cliente' }}
        </Button>
      </div>
    </form>
  </Dialog>
</template>
