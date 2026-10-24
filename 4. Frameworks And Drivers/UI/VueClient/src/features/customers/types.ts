import { PagedResult } from '@/shared/types/pagination';

export type { PagedResult };

export interface CustomerDto {
  id: string;
  name: string;
  currentBalance: number;
  customerType: string | number;
  identification?: string;
  firstName?: string | null;
  secondName?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;
  businessName?: string | null;
  tradeName?: string | null;
}

export interface CreateCustomerDto {
  id: string;
  name?: string;
  currentBalance: number;
  customerType: string | number;
  identification?: string;
  firstName?: string | null;
  secondName?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;
  businessName?: string | null;
  tradeName?: string | null;
}

export interface UpdateCustomerDto {
  id: string;
  name?: string;
  currentBalance: number;
  customerType: string | number;
  identification?: string;
  firstName?: string | null;
  secondName?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;
  businessName?: string | null;
  tradeName?: string | null;
}

export interface CustomerFilters {
  searchTerm?: string;
  customerType?: string;
  balanceFilter?: number; // 0 = Todos, 1 = Al día (Saldo == 0), 2 = Con saldo pendiente (> 0), 3 = Saldo alto (>= 100)
  minBalance?: number;
  maxBalance?: number;
  orderBy?: string; // "name", "id", "balance", "identification"
  ascending?: boolean;
  criteria?: string; // "all", "identification", "name", "lastname", "businessname", "tradename", "id"
  pageNumber?: number;
  pageSize?: number;
}
