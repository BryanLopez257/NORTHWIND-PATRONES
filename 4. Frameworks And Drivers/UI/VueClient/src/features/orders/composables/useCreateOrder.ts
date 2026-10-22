import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ordersService } from '../ordersService';
import { CreateOrderDto } from '../types';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDto) => ordersService.createOrder(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
