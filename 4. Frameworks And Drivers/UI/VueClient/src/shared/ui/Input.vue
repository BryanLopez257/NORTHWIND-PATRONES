<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../utils/cn';
import { EMOJI_REGEX, EMOJI_GLOBAL_REGEX } from '@/core/utils/inputFilters';

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
  rejectEmojis?: boolean;
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
  rejectEmojis: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'keydown', event: KeyboardEvent): void;
  (e: 'paste', event: ClipboardEvent): void;
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

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.rejectEmojis && event.key && EMOJI_REGEX.test(event.key)) {
    event.preventDefault();
    return;
  }
  emit('keydown', event);
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let val = target.value;
  if (props.rejectEmojis && val && EMOJI_REGEX.test(val)) {
    val = val.replace(EMOJI_GLOBAL_REGEX, '');
    target.value = val;
  }
  emit('update:modelValue', val);
};

const handlePaste = (event: ClipboardEvent) => {
  if (props.rejectEmojis) {
    const text = event.clipboardData?.getData('text') || '';
    if (EMOJI_REGEX.test(text)) {
      event.preventDefault();
      const sanitized = text.replace(EMOJI_GLOBAL_REGEX, '');
      const target = event.target as HTMLInputElement;
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const current = target.value;
      const updated = current.slice(0, start) + sanitized + current.slice(end);
      target.value = updated;
      emit('update:modelValue', updated);
      emit('paste', event);
      return;
    }
  }
  emit('paste', event);
};
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
    >
      {{ label }}
    </label>
    <div class="relative">
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
            'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50',
            $slots.suffix && 'pr-10',
            error && 'border-red-500 focus:ring-red-500 dark:border-red-500',
            inputClass
          )
        "
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
        @keydown="handleKeyDown"
        @paste="handlePaste"
      />
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{{ error }}</p>
    <p v-else-if="helperText" class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ helperText }}</p>
  </div>
</template>
