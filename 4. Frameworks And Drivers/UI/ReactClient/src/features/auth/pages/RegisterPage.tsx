import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Store, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { allowOnlyLettersAndSpaces, sanitizeLettersAndSpaces } from '@/core/utils/inputFilters';
import { authService } from '../authService';
import { registerSchema, RegisterFormData } from '../schemas';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      secondName: '',
      lastName: '',
      secondLastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await authService.register({
        email: data.email.trim(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        secondName: data.secondName?.trim() || undefined,
        secondLastName: data.secondLastName?.trim() || undefined,
      });

      // Redirect to login with confirmation flag
      navigate('/login', { state: { registered: true }, replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        let hasMappedField = false;
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          const keys: Array<keyof RegisterFormData> = [
            'firstName',
            'secondName',
            'lastName',
            'secondLastName',
            'email',
            'password',
          ];

          for (const key of keys) {
            const fieldError = err.fieldErrors[key] || err.fieldErrors[key.charAt(0).toUpperCase() + key.slice(1)];
            if (fieldError) {
              setError(key, { message: fieldError });
              hasMappedField = true;
            }
          }
        }

        if (!hasMappedField || err.message) {
          setServerError(err.message || 'Error al procesar el registro.');
        }
      } else {
        setServerError(getErrorMessage(err, 'Error al registrar el usuario.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
      <Card className="w-full max-w-xl shadow-xl border-slate-200/80 bg-white/95 backdrop-blur-xs my-8">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-sky-600 text-white p-3 rounded-2xl w-fit shadow-md mb-2">
            <Store className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Registro de Usuario
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1">
            Complete sus datos para crear su cuenta en NorthWind Sales
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 whitespace-pre-line leading-relaxed">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Nombres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="reg-first-name"
                label="Primer Nombre *"
                placeholder="Juan"
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

              <Input
                id="reg-second-name"
                label="Segundo Nombre"
                placeholder="Carlos (opcional)"
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

            {/* Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="reg-last-name"
                label="Primer Apellido *"
                placeholder="Pérez"
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

              <Input
                id="reg-second-last-name"
                label="Segundo Apellido"
                placeholder="Gómez (opcional)"
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

            {/* Email */}
            <Input
              id="reg-email"
              label="Correo Electrónico Corporativo *"
              type="email"
              placeholder="juan.perez@northwind.com"
              maxLength={100}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Contraseñas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="reg-password"
                label="Contraseña *"
                type="password"
                placeholder="Mínimo 6 caracteres"
                maxLength={100}
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                id="reg-confirm-password"
                label="Confirmar Contraseña *"
                type="password"
                placeholder="Repita su contraseña"
                maxLength={100}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button type="submit" className="w-full mt-3" isLoading={isLoading}>
              <UserPlus className="h-4 w-4 mr-2" />
              Registrar Cuenta
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
            <Link
              to="/login"
              className="inline-flex items-center font-medium text-sky-600 hover:text-sky-700 hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
