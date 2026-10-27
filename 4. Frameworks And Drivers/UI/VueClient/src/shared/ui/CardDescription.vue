<script setup lang="ts">
import { cn } from '../utils/cn';
interface Props { class?: string; }
const props = withDefaults(defineProps<Props>(), { class: '' });
</script>
<template>
  <p :class="cn('text-sm text-slate-500 dark:text-slate-400', props.class)">
    <slot />
  </p>
</template>
