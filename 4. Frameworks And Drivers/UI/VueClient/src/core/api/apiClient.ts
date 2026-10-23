/**
 * ============================================================================
 * ARCHIVO: src/core/api/apiClient.ts
 * PROPÓSITO: Cliente HTTP Centralizado con Axios (Patrón Gateway & Interceptor).
 * ============================================================================
 * Responsabilidades:
 * 1. Base URL dinámica: Lee `VITE_API_URL` del archivo `.env` o por defecto `http://localhost:5000`.
 * 2. Request Interceptor: Inyecta automáticamente el token JWT Bearer en el encabezado `Authorization`.
 * 3. Response Interceptor: 
 *    - Manejo global de 401 Unauthorized: Cierra la sesión en Pinia y redirige a /login.
 *    - Mapeo estandarizado de RFC 7807 (ProblemDetails / ValidationProblemDetails) de ASP.NET Core
 *      a la clase personalizada `ApiError`, extrayendo errores generales y errores por campo (`fieldErrors`).
 */

import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../auth/useAuthStore';
import { getApiBaseUrl, registerApiClient } from '../config/apiConfig';

export interface ValidationErrorItem {
  propertyName?: string;
  PropertyName?: string;
  message?: string;
  Message?: string;
  [key: string]: unknown;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: ValidationErrorItem[] | Record<string, string[] | string>;
  invalidParams?: Array<{
    propertyName?: string;
    name?: string;
    reason?: string;
    errorMessage?: string;
    message?: string;
  }>;
  [key: string]: unknown;
}

/**
 * Excepción de dominio para errores provenientes de la API REST.
 * Contiene el status HTTP, el cuerpo del error y los mensajes divididos por campo.
 */
export class ApiError extends Error {
  public status?: number;
  public problemDetails?: ProblemDetails;
  public fieldErrors: Record<string, string>;

  constructor(
    message: string,
    status?: number,
    problemDetails?: ProblemDetails,
    fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problemDetails = problemDetails;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Parsea respuestas de error estándar de ASP.NET Core (ProblemDetails).
 */
export function parseProblemDetails(data: ProblemDetails | undefined): {
  message: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  const messages: string[] = [];

  if (!data) {
    return { message: 'Error de comunicación con el servidor', fieldErrors };
  }

  // 1. Procesar propiedad "errors" (FluentValidation o ValidationProblemDetails)
  if (Array.isArray(data.errors)) {
    for (const item of data.errors) {
      const prop = item.propertyName || item.PropertyName || '';
      const msg = item.message || item.Message || '';
      if (msg) {
        messages.push(msg);
        if (prop) {
          const normalizedKey = prop.charAt(0).toLowerCase() + prop.slice(1);
          fieldErrors[normalizedKey] = msg;
          fieldErrors[prop] = msg;
        }
      }
    }
  } else if (data.errors && typeof data.errors === 'object') {
    for (const [key, val] of Object.entries(data.errors)) {
      const msgList = Array.isArray(val) ? val : [val];
      const joined = msgList.filter(Boolean).join('. ');
      if (joined) {
        messages.push(joined);
        const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
        fieldErrors[normalizedKey] = joined;
        fieldErrors[key] = joined;
      }
    }
  }

  // 2. Procesar propiedad "invalidParams"
  if (Array.isArray(data.invalidParams)) {
    for (const item of data.invalidParams) {
      const prop = item.propertyName || item.name || '';
      const msg = item.errorMessage || item.reason || item.message || '';
      if (msg) {
        messages.push(msg);
        if (prop) {
          const normalizedKey = prop.charAt(0).toLowerCase() + prop.slice(1);
          fieldErrors[normalizedKey] = msg;
          fieldErrors[prop] = msg;
        }
      }
    }
  }

  // 3. Determinar mensaje final a mostrar
  let finalMessage = '';
  if (messages.length > 0) {
    finalMessage = Array.from(new Set(messages)).join('\n');
  } else if (data.detail && !data.detail.includes('Se encontraron uno o más errores de validación')) {
    finalMessage = data.detail;
  } else if (data.title && !data.title.includes('Error en los datos de entrada')) {
    finalMessage = data.title;
  } else if (data.detail) {
    finalMessage = data.detail;
  } else if (data.title) {
    finalMessage = data.title;
  } else {
    finalMessage = 'Error de validación en la solicitud';
  }

  return { message: finalMessage, fieldErrors };
}

/**
 * Función auxiliar para obtener un texto legible a partir de cualquier excepción.
 */
export function getErrorMessage(error: unknown, defaultMessage = 'Ha ocurrido un error inesperado'): string {
  if (error instanceof ApiError) {
    return error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  if (typeof error === 'string') {
    return error;
  }
  return defaultMessage;
}

// Instancia configurada de Axios con baseURL dinámica
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Registrar para sincronización en caliente desde Settings
registerApiClient(apiClient);

// Interceptor de Solicitud: Inyecta el token Bearer desde localStorage
apiClient.interceptors.request.use(
  (config) => {
    const rawTokens = localStorage.getItem('tokens');
    if (rawTokens) {
      try {
        const parsed = JSON.parse(rawTokens);
        const token = parsed?.accessToken || parsed?.token || (typeof parsed === 'string' ? parsed : null);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        config.headers.Authorization = `Bearer ${rawTokens}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Control de expiración (401) y extracción de ProblemDetails
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    // Si la sesión expiró o no está autorizado
    if (error.response?.status === 401) {
      try {
        const authStore = useAuthStore();
        authStore.logout();
      } catch {
        localStorage.removeItem('tokens');
      }

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }

      return Promise.reject(
        new ApiError('Su sesión ha expirado. Por favor ingrese nuevamente.', 401)
      );
    }

    if (error.response?.data) {
      const data = error.response.data;
      const { message, fieldErrors } = parseProblemDetails(data);
      return Promise.reject(new ApiError(message, error.response.status, data, fieldErrors));
    }

    return Promise.reject(
      new ApiError(error.message || 'Error de conexión con el servidor', error.response?.status)
    );
  }
);

export default apiClient;
