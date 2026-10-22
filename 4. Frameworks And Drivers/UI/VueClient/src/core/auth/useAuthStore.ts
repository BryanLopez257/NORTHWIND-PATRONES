/**
 * ============================================================================
 * ARCHIVO: src/core/auth/useAuthStore.ts
 * PROPÓSITO: Store Global de Autenticación con Pinia (Patrón State Management).
 * ============================================================================
 * Funcionalidad:
 * 1. Inicialización síncrona desde `localStorage` ('tokens') para evitar parpadeos de UI.
 * 2. Comprobación automática de expiración del token (`isTokenExpired`).
 * 3. Extracción de claims (nombre, correo) del JWT emitido por ASP.NET Core Identity.
 * 4. Métodos `login(token)` y `logout()` para gestionar el ciclo de vida de la sesión.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { extractClaims, isTokenExpired, type UserProfile } from './tokenUtils';

export type { UserProfile } from './tokenUtils';

/**
 * Lee el token guardado en el almacenamiento local del navegador.
 * Si ha expirado, lo elimina de inmediato y retorna null.
 */
function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem('tokens');
    if (!raw) return null;
    let tokenStr: string | null = null;
    try {
      const parsed = JSON.parse(raw);
      tokenStr = parsed?.accessToken || parsed?.token || (typeof parsed === 'string' ? parsed : null);
    } catch {
      tokenStr = raw;
    }

    if (tokenStr && isTokenExpired(tokenStr)) {
      localStorage.removeItem('tokens');
      return null;
    }

    return tokenStr;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo inicial
  const initialToken = getStoredToken();
  const token = ref<string | null>(initialToken);
  const user = ref<UserProfile | null>(initialToken ? extractClaims(initialToken) : null);

  // Getter computado: indica si el usuario tiene sesión activa válida
  const isAuthenticated = computed(() => Boolean(token.value));

  /**
   * Guarda el token recibido, decodifica los datos del usuario y activa la sesión.
   */
  function login(newToken: string) {
    let actualToken = newToken;
    try {
      const parsed = JSON.parse(newToken);
      if (parsed?.accessToken) actualToken = parsed.accessToken;
      else if (parsed?.token) actualToken = parsed.token;
    } catch {
      // Ya es una cadena plana
    }

    localStorage.setItem('tokens', JSON.stringify({ accessToken: actualToken }));
    token.value = actualToken;
    user.value = extractClaims(actualToken);
  }

  /**
   * Cierra la sesión: remueve el token de localStorage y limpia el estado reactivo.
   */
  function logout() {
    localStorage.removeItem('tokens');
    token.value = null;
    user.value = null;
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  };
});
