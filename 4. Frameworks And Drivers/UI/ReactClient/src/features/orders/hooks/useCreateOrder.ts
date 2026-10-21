import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../ordersService';
import { CreateOrderDto, CreateOrderResultDto } from '../types';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResultDto, Error, CreateOrderDto>({
    mutationFn: (dto: CreateOrderDto) => ordersService.createOrder(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
