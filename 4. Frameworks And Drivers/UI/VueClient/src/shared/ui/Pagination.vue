<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import Button from './Button.vue';
import { cn } from '../utils/cn';

interface Props {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  itemName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  itemName: 'registros',
});

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)));

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems);
});

const handlePrev = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1);
  }
};

const handleNext = () => {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1);
  }
};

const goToPage = (page: number) => {
  emit('update:currentPage', page);
};

// Generar números de página visibles de forma elegante
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = props.currentPage;
  const delta = 1;
  const range: number[] = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) {
    range.unshift(-1); // Separador suspensivo izquierdo
  }
  if (current + delta < total - 1) {
    range.push(-2); // Separador suspensivo derecho
  }

  range.unshift(1);
  if (total > 1) {
    range.push(total);
  }

  return range;
});
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 text-xs text-slate-600 select-none">
    <div>
      <span v-if="totalItems > 0">
        Mostrando <strong class="text-slate-900 font-semibold">{{ startItem }}</strong> a <strong class="text-slate-900 font-semibold">{{ endItem }}</strong> de <strong class="text-slate-900 font-semibold">{{ totalItems }}</strong> {{ itemName }}
      </span>
      <span v-else>
        No hay {{ itemName }} para mostrar
      </span>
    </div>

    <div v-if="totalPages > 1" class="flex items-center space-x-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="currentPage <= 1"
        @click="handlePrev"
        class="h-8 px-2.5 text-xs flex items-center space-x-1 disabled:opacity-40"
      >
        <ChevronLeft class="h-3.5 w-3.5 mr-0.5" />
        <span>Anterior</span>
      </Button>

      <template v-for="page in visiblePages" :key="page">
        <span v-if="page < 0" class="px-1 text-slate-400">...</span>
        <Button
          v-else
          type="button"
          :variant="currentPage === page ? 'default' : 'outline'"
          size="sm"
          @click="goToPage(page)"
          :class="
            cn(
              'h-8 w-8 p-0 text-xs font-medium',
              currentPage === page
                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            )
          "
        >
          {{ page }}
        </Button>
      </template>

      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="currentPage >= totalPages"
        @click="handleNext"
        class="h-8 px-2.5 text-xs flex items-center space-x-1 disabled:opacity-40"
      >
        <span>Siguiente</span>
        <ChevronRight class="h-3.5 w-3.5 ml-0.5" />
      </Button>
    </div>
  </div>
</template>
