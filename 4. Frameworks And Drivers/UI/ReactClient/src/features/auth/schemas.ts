import { z } from 'zod';

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingrese un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'El primer nombre debe tener al menos 2 caracteres')
      .max(50, 'El primer nombre no puede exceder 50 caracteres')
      .regex(NAME_REGEX, 'El nombre solo puede contener letras y espacios'),
    secondName: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || (val.length >= 2 && val.length <= 50),
        'El segundo nombre debe tener entre 2 y 50 caracteres'
      )
      .refine(
        (val) => !val || NAME_REGEX.test(val),
        'El segundo nombre solo puede contener letras y espacios'
      ),
    lastName: z
      .string()
      .trim()
      .min(2, 'El primer apellido debe tener al menos 2 caracteres')
      .max(50, 'El primer apellido no puede exceder 50 caracteres')
      .regex(NAME_REGEX, 'El apellido solo puede contener letras y espacios'),
    secondLastName: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || (val.length >= 2 && val.length <= 50),
        'El segundo apellido debe tener entre 2 y 50 caracteres'
      )
      .refine(
        (val) => !val || NAME_REGEX.test(val),
        'El segundo apellido solo puede contener letras y espacios'
      ),
    email: z
      .string()
      .trim()
      .min(1, 'El correo electrónico es requerido')
      .max(100, 'El correo no puede exceder 100 caracteres')
      .email('Ingrese un formato de correo electrónico válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirme su contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
