<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../utils/cn';

interface Props {
  modelValue?: string | number;
  value?: string | number;
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  autoComplete?: string;
  class?: string;
  inputClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  value: undefined,
  label: '',
  error: '',
  helperText: '',
  id: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  autoComplete: 'off',
  class: '',
  inputClass: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'keydown', event: KeyboardEvent): void;
}>();

const inputId = computed(() => {
  if (props.id) return props.id;
  if (props.label) return props.label.toLowerCase().replace(/\s+/g, '-');
  return undefined;
});

const displayValue = computed(() => {
  if (props.value !== undefined) return props.value;
  if (props.modelValue !== undefined) return props.modelValue;
  return '';
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700 mb-1"
    >
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      :min="min"
      :max="max"
      :step="step"
      :autocomplete="autoComplete"
      :class="
        cn(
          'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          error && 'border-red-500 focus:ring-red-500',
          inputClass
        )
      "
      @input="handleInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
      @keydown="emit('keydown', $event)"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600 font-medium">{{ error }}</p>
    <p v-else-if="helperText" class="mt-1 text-xs text-slate-500">{{ helperText }}</p>
  </div>
</template>
