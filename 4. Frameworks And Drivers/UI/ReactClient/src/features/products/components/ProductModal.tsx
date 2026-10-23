import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import {
  allowOnlyDigits,
  blockEmojis,
  sanitizeDigits,
  sanitizeRejectEmojis,
} from '@/core/utils/inputFilters';
import { ProductDto } from '../types';
import { productSchema, ProductFormData } from '../schemas';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import { AlertCircle } from 'lucide-react';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: ProductDto | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onOpenChange,
  productToEdit,
}) => {
  const isEditing = Boolean(productToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    mode: 'onTouched',
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      unitsInStock: 0,
      unitPrice: 1,
    },
  });

  useEffect(() => {
    if (open) {
      setServerError(null);
      if (productToEdit) {
        reset({
          name: productToEdit.name,
          unitsInStock: productToEdit.unitsInStock,
          unitPrice: productToEdit.unitPrice,
        });
      } else {
        reset({
          name: '',
          unitsInStock: 0,
          unitPrice: 1,
        });
      }
    }
  }, [open, productToEdit, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setServerError(null);

    try {
      if (isEditing && productToEdit) {
        await updateProductMutation.mutateAsync({
          id: productToEdit.id,
          name: data.name.trim(),
          unitsInStock: data.unitsInStock,
          unitPrice: data.unitPrice,
        });
      } else {
        await createProductMutation.mutateAsync({
          name: data.name.trim(),
          unitsInStock: data.unitsInStock,
          unitPrice: data.unitPrice,
        });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          if (err.fieldErrors.name || err.fieldErrors.Name) {
            setError('name', { message: err.fieldErrors.name || err.fieldErrors.Name });
          }
          if (err.fieldErrors.unitsInStock || err.fieldErrors.UnitsInStock) {
            setError('unitsInStock', {
              message: err.fieldErrors.unitsInStock || err.fieldErrors.UnitsInStock,
            });
          }
          if (err.fieldErrors.unitPrice || err.fieldErrors.UnitPrice) {
            setError('unitPrice', {
              message: err.fieldErrors.unitPrice || err.fieldErrors.UnitPrice,
            });
          }
        }
        setServerError(err.message || 'Error al guardar el producto');
      } else {
        setServerError(getErrorMessage(err, 'Ocurrió un error al procesar el producto'));
      }
    }
  };

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      description={
        isEditing
          ? `Actualizar especificaciones del producto #${productToEdit?.id}`
          : 'Ingrese los datos para añadir un producto al inventario'
      }
    >
      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 whitespace-pre-line leading-relaxed">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="product-name"
          label="Nombre del Producto *"
          placeholder="Chai, Chang, Queso Cabrales..."
          maxLength={40}
          error={errors.name?.message}
          onKeyDown={blockEmojis}
          {...register('name', {
            onChange: (e) => {
              const clean = sanitizeRejectEmojis(e.target.value).slice(0, 40);
              e.target.value = clean;
              setValue('name', clean, { shouldValidate: true });
            },
          })}
        />
        <p className="text-[11px] text-slate-400 -mt-2">Máx. 40 caracteres. Sin emojis ni caracteres suplementarios.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="product-stock"
            label="Unidades en Stock *"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            error={errors.unitsInStock?.message}
            onKeyDown={allowOnlyDigits}
            {...register('unitsInStock', {
              onChange: (e) => {
                const clean = sanitizeDigits(e.target.value);
                e.target.value = clean;
                setValue('unitsInStock', Number(clean) || 0, { shouldValidate: true });
              },
            })}
          />

          <Input
            id="product-price"
            label="Precio Unitario ($) *"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="10.00"
            error={errors.unitPrice?.message}
            {...register('unitPrice')}
          />
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
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isEditing ? 'Guardar Cambios' : 'Añadir Producto'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
