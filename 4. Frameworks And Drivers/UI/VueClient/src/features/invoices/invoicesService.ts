import apiClient from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { InvoiceResponseDto, InvoiceFilters, PagedResult } from './types';

export const invoicesService = {
  async getInvoices(filters?: InvoiceFilters): Promise<PagedResult<InvoiceResponseDto>> {
    const params: Record<string, unknown> = {};
    if (filters) {
      if (filters.searchTerm?.trim()) params.searchTerm = filters.searchTerm.trim();
      if (filters.invoiceNumber?.trim()) params.invoiceNumber = filters.invoiceNumber.trim();
      if (filters.customerName?.trim()) params.customerName = filters.customerName.trim();
      if (typeof filters.pageNumber === 'number') params.pageNumber = filters.pageNumber;
      if (typeof filters.pageSize === 'number') params.pageSize = filters.pageSize;
    }

    const response = await apiClient.get<PagedResult<InvoiceResponseDto>>(ENDPOINTS.INVOICES.BASE, { params });
    return response.data;
  },

  async getInvoiceById(id: number): Promise<InvoiceResponseDto> {
    const response = await apiClient.get<InvoiceResponseDto>(ENDPOINTS.INVOICES.BY_ID(id));
    return response.data;
  },
};
