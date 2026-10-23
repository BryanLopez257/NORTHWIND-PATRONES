import apiClient from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { ProductDto, CreateProductDto, UpdateProductDto, ProductFilters, PagedResult } from './types';

export const productsService = {
  async getProducts(filters?: ProductFilters): Promise<PagedResult<ProductDto>> {
    const params: Record<string, unknown> = {};
    if (filters) {
      if (filters.searchTerm?.trim()) params.searchTerm = filters.searchTerm.trim();
      if (typeof filters.minPrice === 'number') params.minPrice = filters.minPrice;
      if (typeof filters.maxPrice === 'number') params.maxPrice = filters.maxPrice;
      if (typeof filters.stockFilter === 'number' && filters.stockFilter > 0) {
        params.stockFilter = filters.stockFilter;
      }
      if (filters.orderBy) params.orderBy = filters.orderBy;
      if (typeof filters.ascending === 'boolean') params.ascending = filters.ascending;
      if (typeof filters.pageNumber === 'number') params.pageNumber = filters.pageNumber;
      if (typeof filters.pageSize === 'number') params.pageSize = filters.pageSize;
    }

    const response = await apiClient.get<PagedResult<ProductDto>>(ENDPOINTS.PRODUCTS.BASE, { params });
    return response.data;
  },

  async getProductById(id: number): Promise<ProductDto> {
    const response = await apiClient.get<ProductDto>(ENDPOINTS.PRODUCTS.BY_ID(id));
    return response.data;
  },

  async createProduct(dto: CreateProductDto): Promise<ProductDto> {
    const response = await apiClient.post<ProductDto>(ENDPOINTS.PRODUCTS.BASE, dto);
    return response.data;
  },

  async updateProduct(dto: UpdateProductDto): Promise<ProductDto> {
    const response = await apiClient.put<ProductDto>(ENDPOINTS.PRODUCTS.BASE, dto);
    return response.data;
  },

  async deleteProduct(id: number): Promise<boolean> {
    const response = await apiClient.delete<boolean>(ENDPOINTS.PRODUCTS.BY_ID(id));
    return response.data;
  },
};
