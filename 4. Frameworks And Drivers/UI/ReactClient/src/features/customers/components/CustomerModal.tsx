import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import {
  allowOnlyAlpha,
  allowOnlyLettersAndSpaces,
  sanitizeAlpha,
  sanitizeLettersAndSpaces,
} from '@/core/utils/inputFilters';
import { CustomerDto } from '../types';
import { customerSchema, CustomerFormData } from '../schemas';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { AlertCircle } from 'lucide-react';

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
    formState: { errors },
  } = useForm<CustomerFormData>({
    mode: 'onTouched',
    resolver: zodResolver(customerSchema),
    defaultValues: {
      id: '',
      name: '',
      currentBalance: 0,
      customerType: 'Empresa',
    },
  });

  useEffect(() => {
    if (open) {
      setServerError(null);
      if (customerToEdit) {
        reset({
          id: customerToEdit.id,
          name: customerToEdit.name,
          currentBalance: customerToEdit.currentBalance,
          customerType: (customerToEdit.customerType as 'Persona Natural' | 'Empresa') || 'Empresa',
        });
      } else {
        reset({
          id: '',
          name: '',
          currentBalance: 0,
          customerType: 'Empresa',
        });
      }
    }
  }, [open, customerToEdit, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    setServerError(null);
    const normalizedId = data.id.trim().toUpperCase();

    try {
      if (isEditing) {
        await updateCustomerMutation.mutateAsync({
          id: normalizedId,
          name: data.name.trim(),
          currentBalance: data.currentBalance,
          customerType: data.customerType,
        });
      } else {
        await createCustomerMutation.mutateAsync({
          id: normalizedId,
          name: data.name.trim(),
          currentBalance: data.currentBalance,
          customerType: data.customerType,
        });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          if (err.fieldErrors.id || err.fieldErrors.Id) {
            setError('id', { message: err.fieldErrors.id || err.fieldErrors.Id });
          }
          if (err.fieldErrors.name || err.fieldErrors.Name) {
            setError('name', { message: err.fieldErrors.name || err.fieldErrors.Name });
          }
          if (err.fieldErrors.currentBalance || err.fieldErrors.CurrentBalance) {
            setError('currentBalance', {
              message: err.fieldErrors.currentBalance || err.fieldErrors.CurrentBalance,
            });
          }
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
          : 'Ingrese la información para registrar un nuevo cliente en el sistema'
      }
    >
      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 whitespace-pre-line leading-relaxed">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            id="customer-id"
            label="ID del Cliente (5 letras) *"
            placeholder="ALFKI"
            disabled={isEditing}
            maxLength={5}
            error={errors.id?.message}
            onKeyDown={allowOnlyAlpha}
            className="font-mono uppercase tracking-wider"
            {...register('id', {
              onChange: (e) => {
                const clean = sanitizeAlpha(e.target.value).slice(0, 5);
                e.target.value = clean;
                setValue('id', clean, { shouldValidate: true });
              },
            })}
          />
          {isEditing && (
            <p className="text-xs text-slate-400 mt-1">El identificador no puede modificarse una vez creado.</p>
          )}
        </div>

        <Input
          id="customer-name"
          label="Nombre o Razón Social *"
          placeholder="Alfreds Futterkiste"
          maxLength={40}
          error={errors.name?.message}
          onKeyDown={allowOnlyLettersAndSpaces}
          {...register('name', {
            onChange: (e) => {
              const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 40);
              e.target.value = clean;
              setValue('name', clean, { shouldValidate: true });
            },
          })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="customer-balance"
            label="Saldo Comercial ($) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.currentBalance?.message}
            {...register('currentBalance')}
          />

          <div>
            <label htmlFor="customer-type" className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de Cliente *
            </label>
            <select
              id="customer-type"
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              {...register('customerType')}
            >
              <option value="Empresa">Empresa</option>
              <option value="Persona Natural">Persona Natural</option>
            </select>
            {errors.customerType && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.customerType.message}</p>
            )}
          </div>
        </div>

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
