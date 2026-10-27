<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../utils/cn';

interface Props {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  isLoading: false,
  disabled: false,
  type: 'button',
  class: '',
});

const baseStyles =
  'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

const variants = {
  default: 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm active:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:bg-red-800',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

const computedClass = computed(() =>
  cn(baseStyles, variants[props.variant], sizes[props.size], props.class)
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || isLoading"
    :class="computedClass"
  >
    <svg
      v-if="isLoading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>
