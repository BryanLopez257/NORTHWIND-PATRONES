import apiClient from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { CustomerDto, CreateCustomerDto, UpdateCustomerDto, CustomerFilters } from './types';

export const customersService = {
  async getCustomers(filters?: CustomerFilters): Promise<CustomerDto[]> {
    const params: Record<string, unknown> = {};
    if (filters) {
      if (filters.searchTerm?.trim()) params.searchTerm = filters.searchTerm.trim();
      if (filters.customerType && filters.customerType !== 'Todos') {
        params.customerType = filters.customerType;
      }
      if (typeof filters.balanceFilter === 'number' && filters.balanceFilter > 0) {
        params.balanceFilter = filters.balanceFilter;
      }
      if (typeof filters.minBalance === 'number') params.minBalance = filters.minBalance;
      if (typeof filters.maxBalance === 'number') params.maxBalance = filters.maxBalance;
      if (filters.orderBy) params.orderBy = filters.orderBy;
      if (typeof filters.ascending === 'boolean') params.ascending = filters.ascending;
    }

    const response = await apiClient.get<CustomerDto[]>(ENDPOINTS.CUSTOMERS.BASE, { params });
    return response.data;
  },

  async getCustomerById(id: string): Promise<CustomerDto> {
    const response = await apiClient.get<CustomerDto>(ENDPOINTS.CUSTOMERS.BY_ID(id));
    return response.data;
  },

  async createCustomer(dto: CreateCustomerDto): Promise<CustomerDto> {
    const response = await apiClient.post<CustomerDto>(ENDPOINTS.CUSTOMERS.BASE, dto);
    return response.data;
  },

  async updateCustomer(dto: UpdateCustomerDto): Promise<CustomerDto> {
    const response = await apiClient.put<CustomerDto>(ENDPOINTS.CUSTOMERS.BASE, dto);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const response = await apiClient.delete<boolean>(ENDPOINTS.CUSTOMERS.BY_ID(id));
    return response.data;
  },
};
