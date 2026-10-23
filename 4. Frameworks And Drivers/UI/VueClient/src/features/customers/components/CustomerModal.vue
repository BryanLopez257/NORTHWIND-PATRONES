<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import { Dialog, Input, Button } from '@/shared/ui';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import {
  allowOnlyAlpha,
  allowOnlyLettersAndSpaces,
  sanitizeAlphaUpper,
  sanitizeLettersAndSpaces,
  handlePasteFilter,
} from '@/core/utils/inputFilters';
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
  name: '',
  currentBalance: 0,
  customerType: 'Empresa',
});

const createCustomerMutation = useCreateCustomer();
const updateCustomerMutation = useUpdateCustomer();

const isSubmitting = computed(
  () => createCustomerMutation.isPending.value || updateCustomerMutation.isPending.value
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      serverError.value = null;
      errors.value = {};
      if (props.customerToEdit) {
        formData.value = {
          id: props.customerToEdit.id.toUpperCase(),
          name: props.customerToEdit.name,
          currentBalance: props.customerToEdit.currentBalance,
          customerType: (props.customerToEdit.customerType as 'Persona Natural' | 'Empresa') || 'Empresa',
        };
      } else {
        formData.value = {
          id: '',
          name: '',
          currentBalance: 0,
          customerType: 'Empresa',
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

const handleNameInput = (val: string) => {
  formData.value.name = sanitizeLettersAndSpaces(val).slice(0, 40);
};

const handleNamePaste = (e: ClipboardEvent) => {
  handlePasteFilter(e, (text) => sanitizeLettersAndSpaces(text).slice(0, 40));
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

  try {
    if (isEditing.value) {
      await updateCustomerMutation.mutateAsync({
        id: normalizedId,
        name: validation.data.name.trim(),
        currentBalance: validation.data.currentBalance,
        customerType: validation.data.customerType,
      });
    } else {
      await createCustomerMutation.mutateAsync({
        id: normalizedId,
        name: validation.data.name.trim(),
        currentBalance: validation.data.currentBalance,
        customerType: validation.data.customerType,
      });
    }
    emit('update:open', false);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      if (err.fieldErrors) {
        if (err.fieldErrors.id || err.fieldErrors.Id) {
          errors.value.id = err.fieldErrors.id || err.fieldErrors.Id;
        }
        if (err.fieldErrors.name || err.fieldErrors.Name) {
          errors.value.name = err.fieldErrors.name || err.fieldErrors.Name;
        }
        if (err.fieldErrors.currentBalance || err.fieldErrors.CurrentBalance) {
          errors.value.currentBalance =
            err.fieldErrors.currentBalance || err.fieldErrors.CurrentBalance;
        }
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
        : 'Ingrese la información para registrar un nuevo cliente en el sistema'
    "
  >
    <div
      v-if="serverError"
      class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
    >
      <AlertCircle class="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
      <div class="flex-1 whitespace-pre-line leading-relaxed">{{ serverError }}</div>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <Input
          id="customer-id"
          label="ID del Cliente (5 letras) *"
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
        <p v-if="isEditing" class="text-xs text-slate-400 mt-1">
          El identificador no puede modificarse una vez creado (modo solo lectura).
        </p>
        <p v-else class="text-[11px] text-slate-500 mt-1">
          Exactamente 5 letras en mayúsculas (A-Z).
        </p>
      </div>

      <div>
        <Input
          id="customer-name"
          label="Nombre o Razón Social *"
          placeholder="Alfreds Futterkiste"
          :max-length="40"
          :error="errors.name"
          @keydown="allowOnlyLettersAndSpaces"
          @paste="handleNamePaste"
          :model-value="formData.name"
          @update:model-value="handleNameInput"
        />
        <p class="text-[11px] text-slate-500 mt-1">
          Solo letras y espacios en español (máx. 40 caracteres).
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="customer-balance"
          label="Saldo Comercial ($) *"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          :error="errors.currentBalance"
          v-model="formData.currentBalance"
        />

        <div>
          <label for="customer-type" class="block text-sm font-medium text-slate-700 mb-1">
            Tipo de Cliente *
          </label>
          <select
            id="customer-type"
            v-model="formData.customerType"
            class="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="Empresa">Empresa</option>
            <option value="Persona Natural">Persona Natural</option>
          </select>
          <p v-if="errors.customerType" class="mt-1 text-xs text-red-600 font-medium">
            {{ errors.customerType }}
          </p>
        </div>
      </div>

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
