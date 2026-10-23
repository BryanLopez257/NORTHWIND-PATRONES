import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import {
  allowOnlyAlpha,
  allowOnlyLettersAndSpaces,
  allowOnlyDigits,
  sanitizeAlpha,
  sanitizeLettersAndSpaces,
  sanitizeDigits,
} from '@/core/utils/inputFilters';
import { CustomerDto, CreateCustomerDto, UpdateCustomerDto } from '../types';
import { customerSchema, CustomerFormData } from '../schemas';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { validateCedula, validateRuc } from '@/core/validators/ecuadorianIdValidator';
import { AlertCircle, CheckCircle2, Building2, User } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface CustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerToEdit?: CustomerDto | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  open,
  onOpenChange,
  customerToEdit,
}) => {
  const isEditing = Boolean(customerToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    mode: 'onTouched',
    resolver: zodResolver(customerSchema),
    defaultValues: {
      id: '',
      customerType: 'Persona Natural',
      identification: '',
      currentBalance: 0,
      firstName: '',
      secondName: '',
      lastName: '',
      secondLastName: '',
      businessName: '',
      tradeName: '',
    },
  });

  const selectedType = watch('customerType');
  const currentIdentification = watch('identification') || '';

  // Validación en tiempo real del documento para feedback visual
  const idValidationFeedback = useMemo(() => {
    const clean = currentIdentification.trim();
    if (!clean) return null;

    if (selectedType === 'Persona Natural') {
      if (clean.length === 10) {
        const res = validateCedula(clean);
        return {
          isValid: res.isValid,
          message: res.isValid ? 'Cédula Ecuatoriana Válida (SRI)' : res.error,
        };
      }
      if (clean.length === 13) {
        const res = validateRuc(clean);
        return {
          isValid: res.isValid && res.type === 'ruc_natural',
          message:
            res.isValid && res.type === 'ruc_natural'
              ? 'RUC Natural Válido (SRI)'
              : res.error || 'RUC no corresponde a Persona Natural',
        };
      }
      return {
        isValid: false,
        message: 'Debe contener 10 dígitos (Cédula) o 13 dígitos (RUC)',
      };
    } else {
      // Empresa
      if (clean.length !== 13) {
        return {
          isValid: false,
          message: 'Las empresas requieren obligatoriamente un RUC de 13 dígitos',
        };
      }
      const res = validateRuc(clean);
      const isLegal = res.isValid && res.type !== 'ruc_natural';
      return {
        isValid: isLegal,
        message: isLegal
          ? 'RUC de Empresa Válido (SRI)'
          : res.error || 'El RUC debe pertenecer a una sociedad o ente jurídico',
      };
    }
  }, [currentIdentification, selectedType]);

  useEffect(() => {
    if (open) {
      setServerError(null);
      if (customerToEdit) {
        const isNatural =
          customerToEdit.customerType === 'Persona Natural' ||
          customerToEdit.customerType === 1 ||
          String(customerToEdit.customerType) === '1';

        reset({
          id: customerToEdit.id,
          customerType: isNatural ? 'Persona Natural' : 'Empresa',
          identification: customerToEdit.identification || '',
          currentBalance: customerToEdit.currentBalance,
          firstName: customerToEdit.firstName || '',
          secondName: customerToEdit.secondName || '',
          lastName: customerToEdit.lastName || '',
          secondLastName: customerToEdit.secondLastName || '',
          businessName: customerToEdit.businessName || (!isNatural ? customerToEdit.name : ''),
          tradeName: customerToEdit.tradeName || '',
        });
      } else {
        reset({
          id: '',
          customerType: 'Persona Natural',
          identification: '',
          currentBalance: 0,
          firstName: '',
          secondName: '',
          lastName: '',
          secondLastName: '',
          businessName: '',
          tradeName: '',
        });
      }
    }
  }, [open, customerToEdit, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    setServerError(null);
    const normalizedId = data.id.trim().toUpperCase();
    const isNatural = data.customerType === 'Persona Natural';

    const payload: CreateCustomerDto | UpdateCustomerDto = isNatural
      ? {
          id: normalizedId,
          customerType: 1,
          identification: data.identification.trim(),
          firstName: data.firstName?.trim() || null,
          secondName: data.secondName?.trim() || null,
          lastName: data.lastName?.trim() || null,
          secondLastName: data.secondLastName?.trim() || null,
          businessName: null,
          tradeName: data.tradeName?.trim() || null,
          currentBalance: Number(data.currentBalance) || 0,
          name: `${data.lastName?.trim()} ${data.secondLastName?.trim() || ''} ${data.firstName?.trim()} ${data.secondName?.trim() || ''}`
            .replace(/\s+/g, ' ')
            .trim(),
        }
      : {
          id: normalizedId,
          customerType: 2,
          identification: data.identification.trim(),
          businessName: data.businessName?.trim() || null,
          tradeName: data.tradeName?.trim() || null,
          firstName: null,
          secondName: null,
          lastName: null,
          secondLastName: null,
          currentBalance: Number(data.currentBalance) || 0,
          name: data.businessName?.trim() || '',
        };

    try {
      if (isEditing) {
        await updateCustomerMutation.mutateAsync(payload);
      } else {
        await createCustomerMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          const fe = err.fieldErrors;
          if (fe.id || fe.Id) setError('id', { message: fe.id || fe.Id });
          if (fe.identification || fe.Identification)
            setError('identification', { message: fe.identification || fe.Identification });
          if (fe.firstName || fe.FirstName) setError('firstName', { message: fe.firstName || fe.FirstName });
          if (fe.lastName || fe.LastName) setError('lastName', { message: fe.lastName || fe.LastName });
          if (fe.businessName || fe.BusinessName)
            setError('businessName', { message: fe.businessName || fe.BusinessName });
          if (fe.currentBalance || fe.CurrentBalance)
            setError('currentBalance', { message: fe.currentBalance || fe.CurrentBalance });
        }
        setServerError(err.message || 'Error al guardar el cliente');
      } else {
        setServerError(getErrorMessage(err, 'Ocurrió un error al procesar la solicitud'));
      }
    }
  };

  const isSubmitting = createCustomerMutation.isPending || updateCustomerMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      description={
        isEditing
          ? `Modifique los datos del cliente ${customerToEdit?.id}`
          : 'Ingrese la información completa con validación fiscal SRI y modelo 1FN'
      }
    >
      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 whitespace-pre-line leading-relaxed">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Selector de Tipo de Cliente */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Tipo de Cliente <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              disabled={isEditing}
              onClick={() => setValue('customerType', 'Persona Natural', { shouldValidate: true })}
              className={cn(
                'py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-all',
                selectedType === 'Persona Natural'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900',
                isEditing && 'cursor-not-allowed opacity-80'
              )}
            >
              <User className="h-4 w-4" />
              <span>Persona Natural</span>
            </button>
            <button
              type="button"
              disabled={isEditing}
              onClick={() => setValue('customerType', 'Empresa', { shouldValidate: true })}
              className={cn(
                'py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-all',
                selectedType === 'Empresa'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900',
                isEditing && 'cursor-not-allowed opacity-80'
              )}
            >
              <Building2 className="h-4 w-4" />
              <span>Empresa / Jurídica</span>
            </button>
          </div>
          {errors.customerType && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.customerType.message}</p>
          )}
        </div>

        {/* Fila: ID Cliente y Cédula/RUC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              ID del Cliente (5 letras) <span className="text-rose-500">*</span>
            </label>
            <Input
              id="customer-id"
              placeholder="Ej. ALFKI"
              disabled={isEditing}
              maxLength={5}
              error={errors.id?.message}
              onKeyDown={allowOnlyAlpha}
              className="font-mono uppercase tracking-wider font-semibold"
              {...register('id', {
                onChange: (e) => {
                  const clean = sanitizeAlpha(e.target.value).slice(0, 5).toUpperCase();
                  e.target.value = clean;
                  setValue('id', clean, { shouldValidate: true });
                },
              })}
            />
            {isEditing && (
              <p className="text-[11px] text-slate-400 mt-1">El identificador no puede modificarse.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              {selectedType === 'Persona Natural' ? 'Cédula / RUC (Ecuador)' : 'RUC Empresa (13 dígitos)'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <Input
              id="customer-identification"
              placeholder={
                selectedType === 'Persona Natural'
                  ? '10 dígitos (Cédula) o 13 (RUC)'
                  : '13 dígitos (RUC de Empresa)'
              }
              maxLength={13}
              error={errors.identification?.message}
              onKeyDown={allowOnlyDigits}
              className="font-mono"
              {...register('identification', {
                onChange: (e) => {
                  const clean = sanitizeDigits(e.target.value).slice(0, 13);
                  e.target.value = clean;
                  setValue('identification', clean, { shouldValidate: true });
                },
              })}
            />
            {currentIdentification && idValidationFeedback && (
              <div className="mt-1 text-xs flex items-center gap-1 font-medium">
                {idValidationFeedback.isValid ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{idValidationFeedback.message}</span>
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{idValidationFeedback.message}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Campos condicionales 1FN según Tipo de Cliente */}
        {selectedType === 'Persona Natural' ? (
          <div className="space-y-3 p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span>Nombres y Apellidos (Persona Natural)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primer Nombre <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="customer-firstname"
                  placeholder="Ej. Ana"
                  maxLength={50}
                  error={errors.firstName?.message}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  {...register('firstName', {
                    onChange: (e) => {
                      const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 50);
                      e.target.value = clean;
                      setValue('firstName', clean, { shouldValidate: true });
                    },
                  })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Segundo Nombre (Opcional)
                </label>
                <Input
                  id="customer-secondname"
                  placeholder="Ej. María"
                  maxLength={50}
                  error={errors.secondName?.message}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  {...register('secondName', {
                    onChange: (e) => {
                      const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 50);
                      e.target.value = clean;
                      setValue('secondName', clean, { shouldValidate: true });
                    },
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primer Apellido <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="customer-lastname"
                  placeholder="Ej. Trujillo"
                  maxLength={50}
                  error={errors.lastName?.message}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  {...register('lastName', {
                    onChange: (e) => {
                      const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 50);
                      e.target.value = clean;
                      setValue('lastName', clean, { shouldValidate: true });
                    },
                  })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Segundo Apellido (Opcional)
                </label>
                <Input
                  id="customer-secondlastname"
                  placeholder="Ej. Pérez"
                  maxLength={50}
                  error={errors.secondLastName?.message}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  {...register('secondLastName', {
                    onChange: (e) => {
                      const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 50);
                      e.target.value = clean;
                      setValue('secondLastName', clean, { shouldValidate: true });
                    },
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre Comercial (Opcional)
              </label>
              <Input
                id="customer-tradename-natural"
                placeholder="Ej. Emparedados y helados"
                maxLength={150}
                error={errors.tradeName?.message}
                {...register('tradeName')}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Datos Corporativos (Empresa)</span>
            </span>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Razón Social / Denominación Legal <span className="text-rose-500">*</span>
              </label>
              <Input
                id="customer-businessname"
                placeholder="Ej. ALFREDS FUTTERKISTE CIA. LTDA."
                maxLength={150}
                error={errors.businessName?.message}
                {...register('businessName')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre Comercial (Opcional)
              </label>
              <Input
                id="customer-tradename-legal"
                placeholder="Ej. Alfreds Futterkiste"
                maxLength={150}
                error={errors.tradeName?.message}
                {...register('tradeName')}
              />
            </div>
          </div>
        )}

        {/* Saldo Comercial */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Saldo Comercial ($) <span className="text-rose-500">*</span>
          </label>
          <Input
            id="customer-balance"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.currentBalance?.message}
            className="font-mono"
            {...register('currentBalance')}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Clientes con saldo mayor a $0.00 tendrán bloqueada la emisión de nuevas órdenes.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
