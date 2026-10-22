<script setup lang="ts">
import { cn } from '../utils/cn';
interface Props { class?: string; }
const props = withDefaults(defineProps<Props>(), { class: '' });
</script>
<template>
  <tbody :class="cn('divide-y divide-slate-100', props.class)">
    <slot />
  </tbody>
</template>
