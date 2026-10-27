<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';
import { cn } from '../utils/cn';
import Button from './Button.vue';

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  class?: string;
  showCloseButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: '',
  description: '',
  class: '',
  showCloseButton: true,
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'close'): void;
}>();

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('update:open', false);
    emit('close');
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (typeof window !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
      } else {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleKeyDown);
  }
});

const handleClose = () => {
  emit('update:open', false);
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden print:static print:p-0 print:overflow-visible print:z-auto print:block"
    >
      <!-- Backdrop estático (NO se cierra al hacer clic fuera, idéntico a React) -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity no-print"
        aria-hidden="true"
      />

      <!-- Content -->
      <div
        role="dialog"
        aria-modal="true"
        :class="
          cn(
            'relative z-50 w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 transition-all text-slate-900 dark:text-slate-100',
            'animate-in fade-in zoom-in-95 duration-200',
            'print:static print:max-h-none print:shadow-none print:border-none print:p-0 print:w-full print:block',
            props.class
          )
        "
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3 shrink-0 border-b border-slate-200 dark:border-slate-800 pb-3.5 no-print">
          <div>
            <h2 v-if="title" class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {{ title }}
            </h2>
            <p v-if="description" class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {{ description }}
            </p>
          </div>
          <Button
            v-if="showCloseButton"
            variant="ghost"
            size="icon"
            @click="handleClose"
            aria-label="Cerrar modal"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 -mr-2 -mt-2 shrink-0"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>

        <!-- Scrollable body content -->
        <div class="flex-1 overflow-y-auto pt-2.5 pb-1 px-0.5 space-y-4 print:overflow-visible print:p-0">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
