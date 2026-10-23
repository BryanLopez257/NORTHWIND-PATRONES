import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { ApiError, getErrorMessage } from '@/core/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { allowEmailChars, sanitizeEmailChars } from '@/core/utils/inputFilters';
import { authService } from '../authService';
import { loginSchema, LoginFormData } from '../schemas';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Read success message if redirected from registration
  const registrationSuccess = (location.state as { registered?: boolean })?.registered;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const response = await authService.login({
        ...data,
        email: data.email.trim().toLowerCase(),
      });
      login(response.accessToken);

      // Redirect to the originally attempted path or /create-order
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/create-order';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          if (err.fieldErrors.email) {
            setError('email', { message: err.fieldErrors.email });
          }
          if (err.fieldErrors.password) {
            setError('password', { message: err.fieldErrors.password });
          }
        }
        setServerError(err.message || 'Credenciales inválidas. Por favor verifique sus datos.');
      } else {
        setServerError(getErrorMessage(err, 'Error al iniciar sesión. Inténtelo más tarde.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
      <Card className="w-full max-w-md shadow-xl border-slate-200/80 bg-white/95 backdrop-blur-xs">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-blue-600 text-white p-3 rounded-2xl w-fit shadow-md mb-2">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1">
            Ingresa tus credenciales para acceder al sistema NorthWind
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {registrationSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
              <span className="font-semibold">¡Cuenta creada con éxito!</span> Ya puede iniciar sesión.
            </div>
          )}

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 whitespace-pre-line leading-relaxed">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              id="login-email"
              label="Correo electrónico *"
              type="email"
              autoComplete="email"
              placeholder="ejemplo@northwind.com"
              maxLength={254}
              error={errors.email?.message}
              onKeyDown={allowEmailChars}
              {...register('email', {
                onChange: (e) => {
                  const clean = sanitizeEmailChars(e.target.value).slice(0, 254);
                  e.target.value = clean;
                  setValue('email', clean, { shouldValidate: true });
                },
              })}
            />

            <Input
              id="login-password"
              label="Contraseña *"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
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

            <Button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              isLoading={isLoading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar sesión
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
            ¿No tienes una cuenta aún?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline ml-1">
              Crear cuenta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
