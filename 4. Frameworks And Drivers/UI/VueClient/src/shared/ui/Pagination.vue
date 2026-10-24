<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import Button from './Button.vue';
import { cn } from '../utils/cn';

interface Props {
  currentPage: number;
  totalItems?: number;
  totalCount?: number;
  totalPages?: number;
  pageSize?: number;
  itemName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  totalItems: undefined,
  totalCount: undefined,
  totalPages: undefined,
  pageSize: 10,
  itemName: 'registros',
});

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'page-change', page: number): void;
}>();

const resolvedTotalCount = computed(() => {
  if (props.totalCount !== undefined) return props.totalCount;
  if (props.totalItems !== undefined) return props.totalItems;
  return 0;
});

const resolvedTotalPages = computed(() => {
  if (props.totalPages !== undefined) return Math.max(1, props.totalPages);
  return Math.max(1, Math.ceil(resolvedTotalCount.value / props.pageSize));
});

const startItem = computed(() => {
  if (resolvedTotalCount.value === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, resolvedTotalCount.value);
});

const handlePrev = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1);
    emit('page-change', props.currentPage - 1);
  }
};

const handleNext = () => {
  if (props.currentPage < resolvedTotalPages.value) {
    emit('update:currentPage', props.currentPage + 1);
    emit('page-change', props.currentPage + 1);
  }
};

const goToPage = (page: number) => {
  emit('update:currentPage', page);
  emit('page-change', page);
};

// Generar números de página visibles
const visiblePages = computed(() => {
  const total = resolvedTotalPages.value;
  const current = props.currentPage;
  const delta = 1;
  const range: number[] = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) {
    range.unshift(-1);
  }
  if (current + delta < total - 1) {
    range.push(-2);
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
      <span v-if="resolvedTotalCount > 0">
        Mostrando <strong class="text-slate-900 font-semibold">{{ startItem }}</strong> a <strong class="text-slate-900 font-semibold">{{ endItem }}</strong> de <strong class="text-slate-900 font-semibold">{{ resolvedTotalCount }}</strong> {{ itemName }}
      </span>
      <span v-else>
        No hay {{ itemName }} para mostrar
      </span>
    </div>

    <div v-if="resolvedTotalPages > 1" class="flex items-center space-x-1.5">
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
        <span v-if="page < 0" class="px-1.5 text-slate-400">...</span>
        <button
          v-else
          type="button"
          @click="goToPage(page)"
          :class="
            cn(
              'h-8 min-w-[32px] px-2 rounded-lg text-xs font-medium transition-colors',
              page === currentPage
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            )
          "
        >
          {{ page }}
        </button>
      </template>

      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="currentPage >= resolvedTotalPages"
        @click="handleNext"
        class="h-8 px-2.5 text-xs flex items-center space-x-1 disabled:opacity-40"
      >
        <span>Siguiente</span>
        <ChevronRight class="h-3.5 w-3.5 ml-0.5" />
      </Button>
    </div>
  </div>
</template>
