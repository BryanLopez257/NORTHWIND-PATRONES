<script setup lang="ts">
import { cn } from '../utils/cn';
interface Props { class?: string; }
const props = withDefaults(defineProps<Props>(), { class: '' });
</script>
<template>
  <tfoot :class="cn('border-t border-slate-200 bg-slate-50/50 font-medium', props.class)">
    <slot />
  </tfoot>
</template>
