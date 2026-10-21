import { InvoiceResponseDto } from '../invoices/types';

export interface CreateOrderDetailDto {
  productId: number;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: string;
  customerDocument: string;
  shipAddress: string;
  shipCity: string;
  shipCountry: string;
  shipPostalCode?: string;
  orderDetails: CreateOrderDetailDto[];
}

export interface CreateOrderResultDto {
  orderId: number;
  invoiceNumber: string;
  invoice: InvoiceResponseDto;
}

export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  unitsInStock: number;
  quantity: number;
  subTotal: number;
}
