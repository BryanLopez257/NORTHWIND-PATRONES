import { ref, watch, type Ref } from 'vue';

export function useDebounce<T>(value: Ref<T>, delay: number = 350): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  watch(
    () => value.value,
    (newVal) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        debouncedValue.value = newVal;
      }, delay);
    }
  );

  return debouncedValue;
}
