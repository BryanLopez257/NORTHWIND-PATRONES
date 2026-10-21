import { z } from 'zod';

const NAME_LETTERS_ONLY = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export const customerSchema = z.object({
  id: z
    .string()
    .trim()
    .length(5, 'El ID debe tener exactamente 5 letras')
    .regex(/^[a-zA-Z]{5}$/, 'El ID solo puede contener letras'),
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(40, 'El nombre no puede superar los 40 caracteres')
    .regex(NAME_LETTERS_ONLY, 'El nombre no puede contener números ni caracteres especiales'),
  currentBalance: z
    .coerce
    .number({ invalid_type_error: 'El saldo debe ser un número válido' })
    .min(0, 'El saldo no puede ser negativo'),
  customerType: z
    .enum(['Persona Natural', 'Empresa'], {
      errorMap: () => ({ message: 'Seleccione un tipo de cliente válido' }),
    }),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
