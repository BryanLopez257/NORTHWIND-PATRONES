<script setup lang="ts">
import { cn } from '../utils/cn';

interface Props {
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
});
</script>

<template>
  <div :class="cn('rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm', props.class)">
    <slot />
  </div>
</template>
