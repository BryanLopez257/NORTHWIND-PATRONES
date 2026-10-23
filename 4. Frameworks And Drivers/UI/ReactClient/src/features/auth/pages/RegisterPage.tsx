import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Dialog } from '@/shared/ui/Dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import {
  allowOnlyLettersAndSpaces,
  sanitizeLettersAndSpaces,
  allowEmailChars,
  sanitizeEmailChars,
  blockWhitespace,
  blockEmojis,
} from '@/core/utils/inputFilters';
import { authService } from '../authService';
import { registerSchema, RegisterFormData } from '../schemas';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm<RegisterFormData>({
    mode: 'onTouched',
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

  const formValues = watch();
  const passwordValue = formValues.password || '';

  // Determina si los campos están dirty o con datos ingresados (llenos)
  const isFormDirtyOrFilled =
    isDirty ||
    Boolean(formValues.firstName?.trim()) ||
    Boolean(formValues.secondName?.trim()) ||
    Boolean(formValues.lastName?.trim()) ||
    Boolean(formValues.secondLastName?.trim()) ||
    Boolean(formValues.email?.trim()) ||
    Boolean(formValues.password) ||
    Boolean(formValues.confirmPassword);

  const handleGoToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFormDirtyOrFilled) {
      setShowLeaveConfirmModal(true);
    } else {
      navigate('/login');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await authService.register({
        firstName: data.firstName.trim(),
        secondName: data.secondName?.trim() || undefined,
        lastName: data.lastName.trim(),
        secondLastName: data.secondLastName?.trim() || undefined,
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo a inicio de sesión...');
      setTimeout(() => {
        navigate('/login', { state: { registered: true } });
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        let hasMappedField = false;
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          const fieldKeys: Array<keyof RegisterFormData> = [
            'firstName',
            'secondName',
            'lastName',
            'secondLastName',
            'email',
            'password',
            'confirmPassword',
          ];

          for (const key of fieldKeys) {
            if (err.fieldErrors[key]) {
              setError(key, { message: err.fieldErrors[key] });
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
      <Card className="w-full max-w-xl shadow-xl border-slate-200/80 bg-white/95 backdrop-blur-xs my-8">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-blue-600 text-white p-3 rounded-2xl w-fit shadow-md mb-2">
            <UserPlus className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Registro de Usuario
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1">
            Crea tu cuenta para comenzar a operar en NorthWind
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 whitespace-pre-line leading-relaxed">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Nombres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  id="reg-first-name"
                  label="Primer Nombre *"
                  placeholder="Ej. Juan"
                  maxLength={30}
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  {...register('firstName', {
                    onChange: (e) => {
                      const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 30);
                      e.target.value = clean;
                      setValue('firstName', clean, { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                />
                <p className="text-[11px] text-slate-500 mt-1">Solo letras y espacios (2 a 30 chars). Sin emojis.</p>
              </div>

              <div>
                <Input
                  id="reg-second-name"
                  label="Segundo Nombre (Opcional)"
                  placeholder="Ej. Carlos (opcional)"
                  maxLength={30}
                  autoComplete="additional-name"
                  error={errors.secondName?.message}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  {...register('secondName', {
                    onChange: (e) => {
                      const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 30);
                      e.target.value = clean;
                      setValue('secondName', clean, { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                />
                <p className="text-[11px] text-slate-500 mt-1">Opcional. 2 a 30 caracteres. Sin emojis.</p>
              </div>
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  id="reg-last-name"
                  label="Primer Apellido *"
                  placeholder="Ej. Pérez"
                  maxLength={30}
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  {...register('lastName', {
                    onChange: (e) => {
                      const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 30);
                      e.target.value = clean;
                      setValue('lastName', clean, { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                />
                <p className="text-[11px] text-slate-500 mt-1">Solo letras y espacios (2 a 30 chars). Sin emojis.</p>
              </div>

              <div>
                <Input
                  id="reg-second-last-name"
                  label="Segundo Apellido (Opcional)"
                  placeholder="Ej. Gómez (opcional)"
                  maxLength={30}
                  autoComplete="family-name"
                  error={errors.secondLastName?.message}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  {...register('secondLastName', {
                    onChange: (e) => {
                      const clean = sanitizeLettersAndSpaces(e.target.value).slice(0, 30);
                      e.target.value = clean;
                      setValue('secondLastName', clean, { shouldValidate: true, shouldDirty: true });
                    },
                  })}
                />
                <p className="text-[11px] text-slate-500 mt-1">Opcional. 2 a 30 caracteres. Sin emojis.</p>
              </div>
            </div>

            {/* Email */}
            <div>
              <Input
                id="reg-email"
                label="Correo electrónico *"
                type="email"
                placeholder="ejemplo@northwind.com"
                maxLength={254}
                autoComplete="email"
                error={errors.email?.message}
                onKeyDown={allowEmailChars}
                {...register('email', {
                  onChange: (e) => {
                    const clean = sanitizeEmailChars(e.target.value).slice(0, 254);
                    e.target.value = clean;
                    setValue('email', clean, { shouldValidate: true, shouldDirty: true });
                  },
                })}
              />
              <p className="text-[11px] text-slate-500 mt-1">Permite letras, números, '.', '+', '-', '_' y '@'. Máx. 254 caracteres.</p>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  id="reg-password"
                  label="Contraseña *"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  maxLength={100}
                  autoComplete="new-password"
                  error={errors.password?.message}
                  onKeyDown={(e) => {
                    blockWhitespace(e);
                    blockEmojis(e);
                  }}
                  rightElement={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  {...register('password')}
                />
                {passwordValue.length > 0 && (
                  <PasswordStrengthIndicator password={passwordValue} className="mt-2" />
                )}
              </div>

              <div>
                <Input
                  id="reg-confirm-password"
                  label="Confirmar contraseña *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  maxLength={100}
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  onKeyDown={(e) => {
                    blockWhitespace(e);
                    blockEmojis(e);
                  }}
                  rightElement={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              isLoading={isLoading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={handleGoToLogin}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline ml-1 cursor-pointer focus:outline-none"
            >
              Iniciar sesión
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmación si los campos están dirty/llenos */}
      <Dialog
        open={showLeaveConfirmModal}
        onOpenChange={setShowLeaveConfirmModal}
        title="¿Desea salir del registro?"
        description="Tiene datos ingresados en el formulario. Si va a iniciar sesión ahora, se perderán todos los datos completados. ¿Desea continuar?"
      >
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowLeaveConfirmModal(false)}
          >
            Permanecer aquí
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setShowLeaveConfirmModal(false);
              navigate('/login');
            }}
          >
            Sí, ir a Iniciar sesión
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
