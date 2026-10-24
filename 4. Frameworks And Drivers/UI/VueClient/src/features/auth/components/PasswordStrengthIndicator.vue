<script setup lang="ts">
import { computed } from 'vue';
import { ShieldAlert, ShieldCheck } from 'lucide-vue-next';
import { EMOJI_REGEX } from '@/core/utils/inputFilters';

interface Props {
  password?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  password: '',
  class: '',
});

const analysis = computed(() => {
  const pwd = props.password;
  const rules = [
    pwd.length >= 6 && pwd.length <= 100, // longitud
    /[A-Z]/.test(pwd),                    // mayúscula
    /[0-9]/.test(pwd),                    // número
    /[^a-zA-Z0-9\s]/.test(pwd),           // símbolo o carácter especial
    !/\s/.test(pwd) && !EMOJI_REGEX.test(pwd), // sin espacios ni emojis
  ];

  const isValid = rules.every(Boolean);

  let label = 'Débil';
  let score = 1;
  let colorClass = 'text-rose-600';
  let barColor = 'bg-rose-500';
  let borderClass = 'border-rose-200';
  let bgBadge = 'bg-rose-50 text-rose-700 border-rose-200';

  if (pwd.length === 0) {
    score = 0;
    label = 'Sin ingresar';
    colorClass = 'text-slate-400';
    barColor = 'bg-slate-200';
    borderClass = 'border-slate-200';
    bgBadge = 'bg-slate-100 text-slate-500 border-slate-200';
  } else if (isValid) {
    label = 'Fuerte';
    score = 3;
    colorClass = 'text-emerald-600';
    barColor = 'bg-emerald-500';
    borderClass = 'border-emerald-200';
    bgBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else {
    const complexityCount = [rules[1], rules[2], rules[3]].filter(Boolean).length;
    if (rules[0] && rules[4] && complexityCount >= 2) {
      label = 'Medio';
      score = 2;
      colorClass = 'text-amber-600';
      barColor = 'bg-amber-500';
      borderClass = 'border-amber-200';
      bgBadge = 'bg-amber-50 text-amber-700 border-amber-200';
    } else {
      label = 'Débil';
      score = 1;
      colorClass = 'text-rose-600';
      barColor = 'bg-rose-500';
      borderClass = 'border-rose-200';
      bgBadge = 'bg-rose-50 text-rose-700 border-rose-200';
    }
  }

  return {
    label,
    score,
    colorClass,
    barColor,
    borderClass,
    bgBadge,
  };
});
</script>

<template>
  <div
    v-if="password"
    :class="[
      'rounded-lg border bg-slate-50/80 px-2.5 py-1.5 text-xs transition-all duration-200',
      analysis.borderClass,
      props.class
    ]"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <span class="font-medium text-slate-700 text-[11px] sm:text-xs">Fortaleza de contraseña:</span>
        <span
          :class="[
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
            analysis.bgBadge
          ]"
        >
          <ShieldCheck v-if="analysis.score === 3" class="w-3 h-3 text-emerald-600" />
          <ShieldAlert v-else class="w-3 h-3" />
          {{ analysis.label }}
        </span>
      </div>

      <!-- Sensor de colores (3 segmentos) -->
      <div class="flex items-center gap-1 w-20 sm:w-24 h-1.5" :title="`Fortaleza: ${analysis.label}`">
        <div
          :class="[
            'h-full flex-1 rounded-full transition-colors duration-300',
            analysis.score >= 1 ? analysis.barColor : 'bg-slate-200'
          ]"
        />
        <div
          :class="[
            'h-full flex-1 rounded-full transition-colors duration-300',
            analysis.score >= 2 ? analysis.barColor : 'bg-slate-200'
          ]"
        />
        <div
          :class="[
            'h-full flex-1 rounded-full transition-colors duration-300',
            analysis.score >= 3 ? analysis.barColor : 'bg-slate-200'
          ]"
        />
      </div>
    </div>
  </div>
</template>
