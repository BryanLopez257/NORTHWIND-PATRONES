/**
 * apiConfig.ts
 * ============================================================================
 * Gestor dinámico y reactivo de la URL del Backend (API REST).
 * ============================================================================
 * Funcionalidades:
 * 1. Lee y persiste la URL del servidor en `localStorage` (default: /nw-api o http://localhost:5000).
 * 2. Emite reactividad para actualizar `apiClient.defaults.baseURL` en caliente
 *    sin requerir recarga total del navegador.
 * 3. Validación de URL con feedback visual.
 */

import { ref } from 'vue';
import type { AxiosInstance } from 'axios';

export const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_STORAGE_KEY = 'nw_api_base_url';

export const currentApiBaseUrl = ref<string>(
  (typeof window !== 'undefined' && localStorage.getItem(API_STORAGE_KEY)) || DEFAULT_API_URL
);

let _apiClientRef: AxiosInstance | null = null;

export function registerApiClient(client: AxiosInstance): void {
  _apiClientRef = client;
  _apiClientRef.defaults.baseURL = currentApiBaseUrl.value;
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(API_STORAGE_KEY) || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

export function setApiBaseUrl(newUrl: string): boolean {
  try {
    const trimmed = newUrl.trim().replace(/\/+$/, '');
    if (!trimmed) return false;
    // Validar formato: si no es ruta relativa (/nw-api), validar formato URL absoluta
    if (!trimmed.startsWith('/')) {
      new URL(trimmed);
    }
    localStorage.setItem(API_STORAGE_KEY, trimmed);
    currentApiBaseUrl.value = trimmed;
    if (_apiClientRef) {
      _apiClientRef.defaults.baseURL = trimmed;
    }
    return true;
  } catch {
    return false;
  }
}

export function resetApiBaseUrl(): void {
  localStorage.removeItem(API_STORAGE_KEY);
  currentApiBaseUrl.value = DEFAULT_API_URL;
  if (_apiClientRef) {
    _apiClientRef.defaults.baseURL = DEFAULT_API_URL;
  }
}
