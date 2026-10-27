/**
 * inputFilters.ts
 * ============================================================================
 * Utilidades de Entrada en Tiempo Real y Sanitización de Portapapeles.
 * Implementa las 9 restricciones solicitadas para validación en vivo.
 * ============================================================================
 */

export const isControlKey = (e: KeyboardEvent): boolean => {
  // Si no hay evento o e.key es undefined/null (típico en autocompletado del navegador, gestores de contraseñas o eventos sintéticos)
  if (!e || typeof e.key !== 'string') {
    return true;
  }
  // Atajos de navegación, combinaciones y teclas de control
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return true;
  }
  // Teclas no imprimibles (Backspace, Tab, Enter, Escape, flechas, etc.)
  if (e.key.length > 1) {
    return true;
  }
  return false;
};

// ============================================================================
// 7. Regex para detección y rechazo de Emojis y Pictogramas Unicode
// ============================================================================
export const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}]/u;
export const EMOJI_GLOBAL_REGEX = new RegExp(EMOJI_REGEX.source, 'gu');

export const blockEmojis = (e: KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (EMOJI_REGEX.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeRejectEmojis = (value: string): string => {
  if (!value) return '';
  return value.replace(EMOJI_GLOBAL_REGEX, '');
};

// ============================================================================
// 1. lettersAndSpaces: Letras en español (con tildes, diéresis, ñ) y espacios
// ============================================================================
export const allowOnlyLettersAndSpaces = (e: KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (EMOJI_REGEX.test(e.key) || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeLettersAndSpaces = (value: string): string => {
  if (!value) return '';
  return value
    .replace(EMOJI_GLOBAL_REGEX, '')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
};

// ============================================================================
// 2. alphaOnly: Estrictamente letras ASCII (a-z, A-Z) sin espacios ni tildes
// ============================================================================
export const allowOnlyAlpha = (e: KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (EMOJI_REGEX.test(e.key) || !/^[a-zA-Z]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeAlpha = (value: string): string => {
  if (!value) return '';
  return value.replace(EMOJI_GLOBAL_REGEX, '').replace(/[^a-zA-Z]/g, '');
};

// ============================================================================
// 3. digitsOnly: Estrictamente dígitos 0-9
// ============================================================================
export const allowOnlyDigits = (e: KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (EMOJI_REGEX.test(e.key) || !/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeDigits = (value: string): string => {
  if (!value) return '';
  return value.replace(EMOJI_GLOBAL_REGEX, '').replace(/\D/g, '');
};

// ============================================================================
// 4. alphanumeric: Letras y dígitos sin espacios ni caracteres especiales
// ============================================================================
export const allowAlphanumeric = (e: KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (EMOJI_REGEX.test(e.key) || !/^[a-zA-Z0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeAlphanumeric = (value: string): string => {
  if (!value) return '';
  return value.replace(EMOJI_GLOBAL_REGEX, '').replace(/[^a-zA-Z0-9]/g, '');
};

// ============================================================================
// 5. shipAddress: Letras, números, tildes, espacios y .,-#-/° (máx. 60)
// ============================================================================
export const allowAddressChars = (e: KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (EMOJI_REGEX.test(e.key) || !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-\/°]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeAddress = (value: string, maxLength: number = 60): string => {
  if (!value) return '';
  const cleaned = value
    .replace(EMOJI_GLOBAL_REGEX, '')
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-\/°]/g, '');
  return cleaned.slice(0, maxLength);
};

// ============================================================================
// 6. emailChars: Letras, dígitos, punto (.), más (+), guion (-), guion bajo (_) y arroba (@). Sin espacios ni signos
// ============================================================================
export const allowEmailChars = (e: KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!/^[a-zA-Z0-9.@+\-_]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeEmail = (value: string, maxLength: number = 254): string => {
  if (!value) return '';
  return value
    .replace(/\s+/g, '')
    .replace(EMOJI_GLOBAL_REGEX, '')
    .replace(/[^a-zA-Z0-9.@+\-_]/g, '')
    .slice(0, maxLength);
};

// ============================================================================
// 8. noWhitespace: Bloquea la barra espaciadora y saltos de línea
// ============================================================================
export const blockWhitespace = (e: KeyboardEvent): void => {
  if (!e || typeof e.key !== 'string') return;
  if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
    e.preventDefault();
  }
};

export const sanitizeNoWhitespace = (value: string): string => {
  if (!value) return '';
  return value.replace(/\s+/g, '');
};

// ============================================================================
// 9. upperCase: Transforma a mayúsculas en vivo
// ============================================================================
export const toUpperCase = (value: string): string => {
  if (!value) return '';
  return value.toUpperCase();
};

export const sanitizeAlphaUpper = (value: string, maxLength?: number): string => {
  if (!value) return '';
  const clean = value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return maxLength ? clean.slice(0, maxLength) : clean;
};

export const sanitizePostalCode = (value: string, maxLength: number = 10): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, maxLength);
};

// ============================================================================
// Sanitización unificada de Portapapeles (@paste -> handlePasteFilter)
// ============================================================================
export type InputFilterType =
  | 'lettersAndSpaces'
  | 'alphaOnly'
  | 'digitsOnly'
  | 'alphanumeric'
  | 'shipAddress'
  | 'emailChars'
  | 'rejectEmojis'
  | 'noWhitespace'
  | 'upperCase'
  | 'alphaUpper';

export const handlePasteFilter = (
  e: ClipboardEvent,
  typeOrFn: InputFilterType | ((text: string) => string),
  callback?: (sanitized: string) => void
): void => {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') || '';
  let sanitized = text;

  if (typeof typeOrFn === 'function') {
    sanitized = typeOrFn(text);
  } else {
    switch (typeOrFn) {
      case 'lettersAndSpaces':
        sanitized = sanitizeLettersAndSpaces(text);
        break;
      case 'alphaOnly':
        sanitized = sanitizeAlpha(text);
        break;
      case 'digitsOnly':
        sanitized = sanitizeDigits(text);
        break;
      case 'alphanumeric':
        sanitized = sanitizeAlphanumeric(text);
        break;
      case 'shipAddress':
        sanitized = sanitizeAddress(text);
        break;
      case 'emailChars':
        sanitized = sanitizeEmail(text);
        break;
      case 'rejectEmojis':
        sanitized = sanitizeRejectEmojis(text);
        break;
      case 'noWhitespace':
        sanitized = sanitizeNoWhitespace(text);
        break;
      case 'upperCase':
        sanitized = toUpperCase(text);
        break;
      case 'alphaUpper':
        sanitized = sanitizeAlphaUpper(text);
        break;
    }
  }

  if (callback) {
    callback(sanitized);
  } else {
    // Si no se pasa callback, inserta en el elemento activo
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (target && 'value' in target) {
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const current = target.value;
      const updated = current.slice(0, start) + sanitized + current.slice(end);
      target.value = updated;
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
};
