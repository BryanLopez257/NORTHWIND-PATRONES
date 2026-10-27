import type { PagedResult } from '@/shared/types/pagination';

export interface InvoiceDetailResponseDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export type InvoiceDetailDto = InvoiceDetailResponseDto;

export interface InvoiceResponseDto {
  id: number;
  invoiceNumber: string;
  customerId: string;
  customerFullName: string;
  customerDocument: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  sellerName: string;
  subTotal: number;
  tax: number;
  total: number;
  createdDate: string;
  details: InvoiceDetailResponseDto[];
}

export interface InvoiceFilters {
  searchTerm?: string;
  invoiceNumber?: string;
  customerName?: string;
  customerId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export type { PagedResult };
