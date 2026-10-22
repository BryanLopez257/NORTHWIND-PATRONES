import { ref, computed } from 'vue';

export type ThemeMode = 'light' | 'dark';

// Estado global reactivo para el modo de tema
const currentTheme = ref<ThemeMode>(
  (typeof window !== 'undefined' && localStorage.getItem('nw_theme') as ThemeMode) ||
    (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light')
);

// Sincronizar inmediatamente la clase 'dark' en el elemento raíz <html>
if (typeof document !== 'undefined') {
  if (currentTheme.value === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  const isDark = computed(() => currentTheme.value === 'dark');

  const applyTheme = (mode: ThemeMode) => {
    currentTheme.value = mode;
    localStorage.setItem('nw_theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = currentTheme.value === 'dark' ? 'light' : 'dark';
    applyTheme(nextMode);
  };

  return {
    theme: currentTheme,
    isDark,
    applyTheme,
    toggleTheme,
  };
}
