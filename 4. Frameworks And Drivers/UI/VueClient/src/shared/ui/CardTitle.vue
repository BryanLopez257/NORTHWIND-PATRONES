<script setup lang="ts">
import { cn } from '../utils/cn';
interface Props { class?: string; }
const props = withDefaults(defineProps<Props>(), { class: '' });
</script>
<template>
  <h3 :class="cn('text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100', props.class)">
    <slot />
  </h3>
</template>
