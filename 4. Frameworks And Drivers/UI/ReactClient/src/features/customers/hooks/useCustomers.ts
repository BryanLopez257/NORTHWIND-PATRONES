import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '../customersService';
import { CustomerFilters, CreateCustomerDto, UpdateCustomerDto } from '../types';

export const CUSTOMERS_QUERY_KEY = ['customers'] as const;

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, filters],
    queryFn: () => customersService.getCustomers(filters),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: () => customersService.getCustomerById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => customersService.createCustomer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCustomerDto) => customersService.updateCustomer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}
