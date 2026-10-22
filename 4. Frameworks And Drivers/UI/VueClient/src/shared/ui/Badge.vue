<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../utils/cn';

interface Props {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  class: '',
});

const variantClasses = computed(() => {
  const map = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return map[props.variant];
});
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses,
        props.class
      )
    "
  >
    <slot />
  </span>
</template>
