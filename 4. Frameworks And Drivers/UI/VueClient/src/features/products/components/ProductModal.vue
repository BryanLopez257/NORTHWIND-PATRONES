<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import { Dialog, Input, Button } from '@/shared/ui';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import {
  blockEmojis,
  sanitizeRejectEmojis,
  allowOnlyDigits,
  sanitizeDigits,
  handlePasteFilter,
} from '@/core/utils/inputFilters';
import type { ProductDto } from '../types';
import { productSchema, type ProductFormData } from '../schemas';
import { useCreateProduct, useUpdateProduct } from '../composables/useProducts';

interface Props {
  open: boolean;
  productToEdit?: ProductDto | null;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  productToEdit: null,
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const isEditing = computed(() => Boolean(props.productToEdit));
const serverError = ref<string | null>(null);
const errors = ref<Record<string, string>>({});

const formData = ref<ProductFormData>({
  name: '',
  unitsInStock: 0,
  unitPrice: 0,
});

const createProductMutation = useCreateProduct();
const updateProductMutation = useUpdateProduct();

const isSubmitting = computed(
  () => createProductMutation.isPending.value || updateProductMutation.isPending.value
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      serverError.value = null;
      errors.value = {};
      if (props.productToEdit) {
        formData.value = {
          name: props.productToEdit.name,
          unitsInStock: props.productToEdit.unitsInStock,
          unitPrice: props.productToEdit.unitPrice,
        };
      } else {
        formData.value = {
          name: '',
          unitsInStock: 0,
          unitPrice: 0,
        };
      }
    }
  },
  { immediate: true }
);

const handleNameInput = (val: string) => {
  formData.value.name = sanitizeRejectEmojis(val).slice(0, 40);
};

const handleNamePaste = (e: ClipboardEvent) => {
  handlePasteFilter(e, (text) => sanitizeRejectEmojis(text).slice(0, 40));
};

const handleStockInput = (val: string | number) => {
  const digits = sanitizeDigits(String(val));
  formData.value.unitsInStock = digits ? parseInt(digits, 10) : 0;
};

const handleStockPaste = (e: ClipboardEvent) => {
  handlePasteFilter(e, (text) => sanitizeDigits(text));
};

const onSubmit = async () => {
  serverError.value = null;
  errors.value = {};

  const validation = productSchema.safeParse(formData.value);
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors.value[field]) {
        errors.value[field] = issue.message;
      }
    }
    return;
  }

  try {
    if (isEditing.value && props.productToEdit) {
      await updateProductMutation.mutateAsync({
        id: props.productToEdit.id,
        name: validation.data.name.trim(),
        unitsInStock: validation.data.unitsInStock,
        unitPrice: validation.data.unitPrice,
      });
    } else {
      await createProductMutation.mutateAsync({
        name: validation.data.name.trim(),
        unitsInStock: validation.data.unitsInStock,
        unitPrice: validation.data.unitPrice,
      });
    }
    emit('update:open', false);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      if (err.fieldErrors) {
        if (err.fieldErrors.name || err.fieldErrors.Name) {
          errors.value.name = err.fieldErrors.name || err.fieldErrors.Name;
        }
        if (err.fieldErrors.unitsInStock || err.fieldErrors.UnitsInStock) {
          errors.value.unitsInStock =
            err.fieldErrors.unitsInStock || err.fieldErrors.UnitsInStock;
        }
        if (err.fieldErrors.unitPrice || err.fieldErrors.UnitPrice) {
          errors.value.unitPrice = err.fieldErrors.unitPrice || err.fieldErrors.UnitPrice;
        }
      }
      serverError.value = err.message || 'Error al guardar el producto';
    } else {
      serverError.value = getErrorMessage(err, 'Ocurrió un error al procesar el producto');
    }
  }
};
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
    :title="isEditing ? 'Editar Producto' : 'Nuevo Producto'"
    :description="
      isEditing
        ? `Modifique los datos del producto #${productToEdit?.id}`
        : 'Ingrese la información para registrar un nuevo producto en el catálogo'
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
          id="product-name"
          label="Nombre del Producto *"
          placeholder="Chai"
          :max-length="40"
          :error="errors.name"
          :model-value="formData.name"
          @update:model-value="handleNameInput"
          @keydown="blockEmojis"
          @paste="handleNamePaste"
        />
        <p class="text-[11px] text-slate-500 mt-1">Máx. 40 caracteres. Sin emojis ni pictogramas.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="product-price"
          label="Precio Unitario ($) *"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="18.00"
          :error="errors.unitPrice"
          v-model="formData.unitPrice"
        />

        <div>
          <Input
            id="product-stock"
            label="Unidades en Stock *"
            type="text"
            placeholder="39"
            :error="errors.unitsInStock"
            :model-value="formData.unitsInStock"
            @update:model-value="handleStockInput"
            @keydown="allowOnlyDigits"
            @paste="handleStockPaste"
          />
          <p class="text-[11px] text-slate-500 mt-1">Entero mayor o igual a 0.</p>
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
          {{ isEditing ? 'Guardar Cambios' : 'Registrar Producto' }}
        </Button>
      </div>
    </form>
  </Dialog>
</template>
