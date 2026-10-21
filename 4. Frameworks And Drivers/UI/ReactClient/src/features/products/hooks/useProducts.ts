import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../productsService';
import { ProductFilters, CreateProductDto, UpdateProductDto } from '../types';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, filters],
    queryFn: () => productsService.getProducts(filters),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, id],
    queryFn: () => productsService.getProductById(id),
    enabled: typeof id === 'number' && !isNaN(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.createProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProductDto) => productsService.updateProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}
