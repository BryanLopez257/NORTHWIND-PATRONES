<script setup lang="ts">
import { cn } from '../utils/cn';
interface Props { class?: string; }
const props = withDefaults(defineProps<Props>(), { class: '' });
</script>
<template>
  <div :class="cn('flex flex-col space-y-1.5 p-6 border-b border-slate-100', props.class)">
    <slot />
  </div>
</template>
