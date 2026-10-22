export interface CustomerDto {
  id: string;
  name: string;
  currentBalance: number;
  customerType: string;
}

export interface CreateCustomerDto {
  id: string;
  name: string;
  currentBalance: number;
  customerType: string;
}

export interface UpdateCustomerDto {
  id: string;
  name: string;
  currentBalance: number;
  customerType: string;
}

export interface CustomerFilters {
  searchTerm?: string;
  customerType?: string;
  balanceFilter?: number; // 0 = Todos, 1 = Al día (Saldo == 0), 2 = Con saldo pendiente (> 0), 3 = Saldo alto (>= 100)
  minBalance?: number;
  maxBalance?: number;
  orderBy?: string; // "name", "id", "balance"
  ascending?: boolean;
}
