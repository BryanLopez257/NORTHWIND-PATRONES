import { z } from 'zod';
import { EMOJI_REGEX } from '@/core/utils/inputFilters';

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del producto es obligatorio')
    .max(40, 'El nombre no puede superar los 40 caracteres')
    .refine((val) => !EMOJI_REGEX.test(val), 'El nombre no puede contener emojis ni pictogramas'),
  unitsInStock: z
    .coerce
    .number({ invalid_type_error: 'Las unidades deben ser un número' })
    .int('Las unidades deben ser un número entero')
    .min(0, 'Las unidades en stock no pueden ser negativas')
    .max(32767, 'El stock excede el límite máximo permitido'),
  unitPrice: z
    .coerce
    .number({ invalid_type_error: 'El precio debe ser un número válido' })
    .gt(0, 'El precio unitario debe ser mayor que 0'),
});

export type ProductFormData = z.infer<typeof productSchema>;
