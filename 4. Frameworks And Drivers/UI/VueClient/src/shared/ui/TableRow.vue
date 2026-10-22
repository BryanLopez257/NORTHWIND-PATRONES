<script setup lang="ts">
import { cn } from '../utils/cn';
interface Props { class?: string; }
const props = withDefaults(defineProps<Props>(), { class: '' });
</script>
<template>
  <tr :class="cn('transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100', props.class)">
    <slot />
  </tr>
</template>
