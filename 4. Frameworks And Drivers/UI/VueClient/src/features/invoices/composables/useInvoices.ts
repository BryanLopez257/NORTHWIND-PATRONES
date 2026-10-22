import { useQuery } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { invoicesService } from '../invoicesService';
import { InvoiceFilters } from '../types';

export function useInvoices(filters?: MaybeRefOrGetter<InvoiceFilters | undefined>) {
  return useQuery({
    queryKey: computed(() => ['invoices', toValue(filters)]),
    queryFn: () => invoicesService.getInvoices(toValue(filters)),
  });
}

export function useInvoice(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => ['invoices', toValue(id)]),
    queryFn: () => invoicesService.getInvoiceById(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  });
}
