import { useQuery } from '@tanstack/react-query';
import { invoicesService } from '../invoicesService';
import { InvoiceFilters } from '../types';

export const INVOICES_QUERY_KEY = ['invoices'] as const;

export function useInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: [...INVOICES_QUERY_KEY, filters],
    queryFn: () => invoicesService.getInvoices(filters),
  });
}

export function useInvoice(id?: number) {
  return useQuery({
    queryKey: [...INVOICES_QUERY_KEY, id],
    queryFn: () => invoicesService.getInvoiceById(id!),
    enabled: typeof id === 'number' && id > 0,
  });
}
