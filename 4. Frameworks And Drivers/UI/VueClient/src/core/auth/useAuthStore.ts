import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { extractClaims, isTokenExpired, type UserProfile } from './tokenUtils';

export type { UserProfile } from './tokenUtils';

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
  const initialToken = getStoredToken();
  const token = ref<string | null>(initialToken);
  const user = ref<UserProfile | null>(initialToken ? extractClaims(initialToken) : null);

  const isAuthenticated = computed(() => Boolean(token.value));

  function login(newToken: string) {
    let actualToken = newToken;
    try {
      const parsed = JSON.parse(newToken);
      if (parsed?.accessToken) actualToken = parsed.accessToken;
      else if (parsed?.token) actualToken = parsed.token;
    } catch {
      // already plain token string
    }

    localStorage.setItem('tokens', JSON.stringify({ accessToken: actualToken }));
    token.value = actualToken;
    user.value = extractClaims(actualToken);
  }

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
