import React, { useState } from 'react';
import { Settings, Server, RefreshCw, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { ApiConfig, DEFAULT_API_URL } from '@/core/config/apiConfig';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export const SettingsPage: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>(ApiConfig.baseUrl);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) {
      setStatusMessage('La URL del servidor no puede estar vacía.');
      setIsSuccess(false);
      return;
    }

    try {
      // Validar formato de URL
      new URL(clean);
    } catch {
      setStatusMessage('Por favor ingrese una URL válida (ej: http://localhost:5000 o https://api.midominio.com).');
      setIsSuccess(false);
      return;
    }

    ApiConfig.setBaseUrl(clean);
    setUrlInput(ApiConfig.baseUrl);
    setStatusMessage(`URL del servidor NorthWind WebApi guardada exitosamente: ${ApiConfig.baseUrl}`);
    setIsSuccess(true);
  };

  const handleReset = () => {
    ApiConfig.resetToDefault();
    setUrlInput(ApiConfig.baseUrl);
    setStatusMessage(`Restablecido al valor por defecto: ${ApiConfig.baseUrl}`);
    setIsSuccess(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configuración del Sistema</h1>
          <p className="text-sm text-slate-500">
            Ajusta los parámetros de conexión y comportamiento de la aplicación cliente.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Conexión con NorthWind WebApi</CardTitle>
          </div>
          <CardDescription>
            Permite cambiar la URL Base del backend ASP.NET Core y guardarla en almacenamiento persistente del navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {statusMessage && (
            <div
              className={`p-4 rounded-lg flex items-start space-x-3 text-sm animate-in fade-in ${
                isSuccess
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{statusMessage}</div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="api-url" className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                URL Base de la API (Backend)
              </label>
              <Input
                id="api-url"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:5000"
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Valor por defecto: <code className="text-slate-600 font-mono">{DEFAULT_API_URL}</code>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full sm:w-auto text-slate-600 flex items-center space-x-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Restablecer por Defecto</span>
              </Button>

              <Button
                type="submit"
                variant="default"
                size="sm"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Configuración</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
