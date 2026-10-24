import { z } from 'zod';
import { validateCedula, validateRuc } from '@/core/validators/ecuadorianIdValidator';

const LETTERS_ONLY = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export const customerSchema = z
  .object({
    id: z
      .string()
      .trim()
      .length(5, 'El ID debe tener exactamente 5 letras')
      .regex(/^[a-zA-Z]{5}$/, 'El ID solo puede contener letras'),
    customerType: z.enum(['Persona Natural', 'Empresa'], {
      errorMap: () => ({ message: 'Seleccione un tipo de cliente válido' }),
    }),
    identification: z
      .string()
      .trim()
      .min(1, 'La identificación (Cédula o RUC) es obligatoria'),
    currentBalance: z.coerce
      .number({ invalid_type_error: 'El saldo debe ser un número válido' })
      .min(0, 'El saldo no puede ser negativo'),

    // Persona Natural
    firstName: z.string().trim().optional(),
    secondName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    secondLastName: z.string().trim().optional(),

    // Empresa
    businessName: z.string().trim().optional(),
    tradeName: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const isNatural = data.customerType === 'Persona Natural';
    const cleanId = data.identification.trim();

    if (isNatural) {
      if (!data.firstName || !data.firstName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['firstName'],
          message: 'El primer nombre es obligatorio',
        });
      } else if (!LETTERS_ONLY.test(data.firstName.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['firstName'],
          message: 'El nombre solo puede contener letras',
        });
      }

      if (data.secondName && data.secondName.trim() && !LETTERS_ONLY.test(data.secondName.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['secondName'],
          message: 'El segundo nombre solo puede contener letras',
        });
      }

      if (!data.lastName || !data.lastName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lastName'],
          message: 'El primer apellido es obligatorio',
        });
      } else if (!LETTERS_ONLY.test(data.lastName.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lastName'],
          message: 'El apellido solo puede contener letras',
        });
      }

      if (data.secondLastName && data.secondLastName.trim() && !LETTERS_ONLY.test(data.secondLastName.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['secondLastName'],
          message: 'El segundo apellido solo puede contener letras',
        });
      }

      if (cleanId.length === 10) {
        const res = validateCedula(cleanId);
        if (!res.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identification'],
            message: res.error || 'Cédula no válida según el algoritmo del SRI',
          });
        }
      } else if (cleanId.length === 13) {
        const res = validateRuc(cleanId);
        if (!res.isValid || res.type !== 'ruc_natural') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identification'],
            message: res.error || 'Para Persona Natural el RUC debe ser natural (tercer dígito entre 0 y 5)',
          });
        }
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identification'],
          message: 'La identificación debe contener 10 dígitos (Cédula) o 13 dígitos (RUC Natural)',
        });
      }
    } else {
      // Empresa
      if (!data.businessName || !data.businessName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['businessName'],
          message: 'La Razón Social es obligatoria para Empresas',
        });
      }

      if (cleanId.length !== 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identification'],
          message: 'Las empresas requieren obligatoriamente un RUC de 13 dígitos',
        });
      } else {
        const res = validateRuc(cleanId);
        if (!res.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identification'],
            message: res.error || 'RUC de empresa no válido según el SRI',
          });
        } else if (res.type === 'ruc_natural') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identification'],
            message: 'El RUC ingresado corresponde a Persona Natural, no a Empresa (sociedad jurídica)',
          });
        }
      }
    }
  });

export type CustomerFormData = z.infer<typeof customerSchema>;
