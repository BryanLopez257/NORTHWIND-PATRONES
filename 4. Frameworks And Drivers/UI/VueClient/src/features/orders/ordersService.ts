import apiClient from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { CreateOrderDto, CreateOrderResultDto } from './types';

export const ordersService = {
  async createOrder(dto: CreateOrderDto): Promise<CreateOrderResultDto> {
    const response = await apiClient.post<CreateOrderResultDto>(ENDPOINTS.ORDERS.CREATE, dto);
    return response.data;
  },
};
