import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { customersService } from '../customersService';
import { CustomerFilters, CreateCustomerDto, UpdateCustomerDto } from '../types';

export function useCustomers(filters?: MaybeRefOrGetter<CustomerFilters | undefined>) {
  return useQuery({
    queryKey: computed(() => ['customers', toValue(filters)]),
    queryFn: () => customersService.getCustomers(toValue(filters)),
  });
}

export function useCustomer(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => ['customers', toValue(id)]),
    queryFn: () => customersService.getCustomerById(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => customersService.createCustomer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCustomerDto) => customersService.updateCustomer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
