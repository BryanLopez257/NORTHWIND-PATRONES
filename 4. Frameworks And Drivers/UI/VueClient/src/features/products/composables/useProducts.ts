import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { productsService } from '../productsService';
import { ProductFilters, CreateProductDto, UpdateProductDto } from '../types';

export function useProducts(filters?: MaybeRefOrGetter<ProductFilters | undefined>) {
  return useQuery({
    queryKey: computed(() => ['products', toValue(filters)]),
    queryFn: () => productsService.getProducts(toValue(filters)),
  });
}

export function useProduct(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => ['products', toValue(id)]),
    queryFn: () => productsService.getProductById(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.createProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProductDto) => productsService.updateProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
