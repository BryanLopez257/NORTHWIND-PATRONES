export interface ProductDto {
  id: number;
  name: string;
  unitsInStock: number;
  unitPrice: number;
}

export interface CreateProductDto {
  name: string;
  unitsInStock: number;
  unitPrice: number;
}

export interface UpdateProductDto {
  id: number;
  name: string;
  unitsInStock: number;
  unitPrice: number;
}

export interface ProductFilters {
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  stockFilter?: number; // 0 = Todos, 1 = En Stock (> 0), 2 = Stock Bajo (<= 10 y > 0), 3 = Agotado (== 0)
  orderBy?: string; // "name", "price", "stock"
  ascending?: boolean;
}
