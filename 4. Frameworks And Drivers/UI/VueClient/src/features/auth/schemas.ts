import { z } from 'zod';

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const EMAIL_STRICT_REGEX = /^[a-zA-Z0-9.@]+$/;
const HAS_NO_EMOJI = (val: string) => !/[\uD800-\uDFFF]/.test(val);

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido.')
    .email('El formato de correo no es válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'El primer nombre es requerido.')
      .min(2, 'El primer nombre debe tener entre 2 y 50 caracteres.')
      .max(50, 'El primer nombre debe tener entre 2 y 50 caracteres.')
      .refine(HAS_NO_EMOJI, 'El primer nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).')
      .refine(
        (val) => NAME_REGEX.test(val),
        'El primer nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      ),
    secondName: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || (val.length >= 2 && val.length <= 50),
        'El segundo nombre debe tener entre 2 y 50 caracteres.'
      )
      .refine(
        (val) => !val || HAS_NO_EMOJI(val),
        'El segundo nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      )
      .refine(
        (val) => !val || NAME_REGEX.test(val),
        'El segundo nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      ),
    lastName: z
      .string()
      .trim()
      .min(1, 'El primer apellido es requerido.')
      .min(2, 'El primer apellido debe tener entre 2 y 50 caracteres.')
      .max(50, 'El primer apellido debe tener entre 2 y 50 caracteres.')
      .refine(HAS_NO_EMOJI, 'El primer apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).')
      .refine(
        (val) => NAME_REGEX.test(val),
        'El primer apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      ),
    secondLastName: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || (val.length >= 2 && val.length <= 50),
        'El segundo apellido debe tener entre 2 y 50 caracteres.'
      )
      .refine(
        (val) => !val || HAS_NO_EMOJI(val),
        'El segundo apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      )
      .refine(
        (val) => !val || NAME_REGEX.test(val),
        'El segundo apellido solo puede contener letras y espacios (sin emojis ni caracteres especiales).'
      ),
    email: z
      .string()
      .trim()
      .min(1, 'El correo es requerido.')
      .max(100, 'El correo no debe superar los 100 caracteres.')
      .email('El formato de correo no es válido.')
      .refine(
        (val) => EMAIL_STRICT_REGEX.test(val) && HAS_NO_EMOJI(val) && !/\s/.test(val),
        'El correo solo puede contener letras, números, punto (.) y arroba (@). No se permiten otros caracteres especiales, espacios ni emojis.'
      ),
    password: z
      .string()
      .min(1, 'La contraseña es requerida.')
      .min(6, 'Se requiere al menos 6 caracteres en la contraseña.')
      .max(100, 'La contraseña no debe superar los 100 caracteres.')
      .refine(
        (val) => !/\s/.test(val) && HAS_NO_EMOJI(val),
        'La contraseña no debe contener emojis ni espacios en blanco.'
      )
      .refine(
        (val) => /[A-Z]/.test(val),
        'La contraseña debe contener al menos una letra mayúscula.'
      )
      .refine(
        (val) => /[0-9]/.test(val),
        'La contraseña debe contener al menos un dígito.'
      )
      .refine(
        (val) => /[^a-zA-Z0-9\s]/.test(val),
        'La contraseña debe contener al menos un símbolo especial.'
      ),
    confirmPassword: z
      .string()
      .min(1, 'La contraseña y la confirmación no coinciden.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'La contraseña y la confirmación no coinciden.',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
