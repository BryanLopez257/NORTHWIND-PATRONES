<script setup lang="ts">
import { cn } from '../utils/cn';
interface Props { class?: string; }
const props = withDefaults(defineProps<Props>(), { class: '' });
</script>
<template>
  <thead :class="cn('bg-slate-50 border-b border-slate-200 text-xs uppercase font-medium text-slate-500', props.class)">
    <slot />
  </thead>
</template>
