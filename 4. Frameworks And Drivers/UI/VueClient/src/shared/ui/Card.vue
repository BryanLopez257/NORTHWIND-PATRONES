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
  <div :class="cn('rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm', props.class)">
    <slot />
  </div>
</template>
