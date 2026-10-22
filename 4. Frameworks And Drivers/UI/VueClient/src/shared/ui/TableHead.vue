<script setup lang="ts">
import { cn } from '../utils/cn';
interface Props { class?: string; }
const props = withDefaults(defineProps<Props>(), { class: '' });
</script>
<template>
  <th :class="cn('h-10 px-4 text-left align-middle font-semibold text-slate-600 [&:has([role=checkbox])]:pr-0', props.class)">
    <slot />
  </th>
</template>
