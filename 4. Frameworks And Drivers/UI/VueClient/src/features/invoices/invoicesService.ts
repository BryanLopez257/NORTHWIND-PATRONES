import apiClient from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { InvoiceResponseDto, InvoiceFilters } from './types';

export const invoicesService = {
  async getInvoices(filters?: InvoiceFilters): Promise<InvoiceResponseDto[]> {
    const params: Record<string, unknown> = {};
    if (filters) {
      if (filters.invoiceNumber?.trim()) params.invoiceNumber = filters.invoiceNumber.trim();
      if (filters.customerName?.trim()) params.customerName = filters.customerName.trim();
    }

    const response = await apiClient.get<InvoiceResponseDto[]>(ENDPOINTS.INVOICES.BASE, { params });
    return response.data;
  },

  async getInvoiceById(id: number): Promise<InvoiceResponseDto> {
    const response = await apiClient.get<InvoiceResponseDto>(ENDPOINTS.INVOICES.BY_ID(id));
    return response.data;
  },
};
