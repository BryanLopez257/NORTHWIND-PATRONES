import React from 'react';

/**
 * Expresión regular para rechazo estricto de pictogramas y emojis Unicode.
 * Idéntico a Flutter RegExp(r'(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])')
 */
export const EMOJI_REGEX =
  /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;

/**
 * Comprueba si la tecla pulsada es una tecla de control/navegación o atajo de teclado
 * que no debe ser bloqueada físicamente.
 */
export const isControlKey = (e: React.KeyboardEvent): boolean => {
  // Atajos con Ctrl / Cmd / Alt (Ctrl+C, Ctrl+V, Ctrl+A, Cmd+V, etc.)
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return true;
  }

  // Teclas no imprimibles o multifunción (Backspace, Tab, Enter, Escape, Flechas, Supr, etc.)
  if (e.key.length > 1) {
    return true;
  }

  return false;
};

// ==========================================
// 1. REGLAS DE CARACTERES PERMITIDOS (RegEx)
// ==========================================

export const REGEX_PATTERNS = {
  lettersAndSpaces: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/,
  alphaOnly: /^[a-zA-Z]$/,
  digitsOnly: /^[0-9]$/,
  alphanumeric: /^[a-zA-Z0-9]$/,
  shipAddress: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-\/°]$/,
  emailChars: /^[a-zA-Z0-9.@]$/,
};

// ==========================================
// 2. KEYBOARD EVENT FILTERS (onKeyDown)
// ==========================================

export const allowOnlyLettersAndSpaces = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!REGEX_PATTERNS.lettersAndSpaces.test(e.key) || EMOJI_REGEX.test(e.key)) {
    e.preventDefault();
  }
};

export const allowOnlyAlpha = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!REGEX_PATTERNS.alphaOnly.test(e.key)) {
    e.preventDefault();
  }
};

export const allowOnlyDigits = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!REGEX_PATTERNS.digitsOnly.test(e.key)) {
    e.preventDefault();
  }
};

export const allowAlphanumeric = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!REGEX_PATTERNS.alphanumeric.test(e.key) || EMOJI_REGEX.test(e.key)) {
    e.preventDefault();
  }
};

export const allowAddressChars = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!REGEX_PATTERNS.shipAddress.test(e.key) || EMOJI_REGEX.test(e.key)) {
    e.preventDefault();
  }
};

export const allowEmailChars = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!REGEX_PATTERNS.emailChars.test(e.key) || EMOJI_REGEX.test(e.key) || /\s/.test(e.key)) {
    e.preventDefault();
  }
};

export const blockWhitespace = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (/\s/.test(e.key)) {
    e.preventDefault();
  }
};

export const blockEmojis = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (EMOJI_REGEX.test(e.key)) {
    e.preventDefault();
  }
};

// ==========================================
// 3. SANITIZATION FUNCTIONS (onChange / onPaste)
// ==========================================

export const sanitizeLettersAndSpaces = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').replace(new RegExp(EMOJI_REGEX, 'g'), '');
};

export const sanitizeAlpha = (value: string, toUpper = true): string => {
  if (!value) return '';
  const clean = value.replace(/[^a-zA-Z]/g, '');
  return toUpper ? clean.toUpperCase() : clean;
};

export const sanitizeDigits = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

export const sanitizeAlphanumeric = (value: string, toUpper = false): string => {
  if (!value) return '';
  const clean = value.replace(/[^a-zA-Z0-9]/g, '');
  return toUpper ? clean.toUpperCase() : clean;
};

export const sanitizeAddress = (value: string): string => {
  if (!value) return '';
  return value
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-\/°]/g, '')
    .replace(new RegExp(EMOJI_REGEX, 'g'), '');
};

export const sanitizeEmailChars = (value: string): string => {
  if (!value) return '';
  return value
    .replace(/[^a-zA-Z0-9.@]/g, '')
    .replace(new RegExp(EMOJI_REGEX, 'g'), '')
    .replace(/\s/g, '');
};

export const sanitizeNoWhitespace = (value: string): string => {
  if (!value) return '';
  return value.replace(/\s/g, '');
};

export const sanitizeRejectEmojis = (value: string): string => {
  if (!value) return '';
  return value.replace(new RegExp(EMOJI_REGEX, 'g'), '');
};

// ==========================================
// 4. HANDLERS ONPASTE Y ONBEFOREINPUT
// ==========================================

/**
 * Maneja el evento onPaste interceptando el clipboard y filtrando
 * según el sanitizador provisto antes de insertar en el campo.
 */
export const handlePasteFilter = (
  e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  sanitizer: (val: string) => string,
  maxLength?: number
): void => {
  e.preventDefault();
  const pasteData = e.clipboardData.getData('text');
  let clean = sanitizer(pasteData);
  if (maxLength && clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  // Insertar en la posición actual del cursor
  const target = e.currentTarget;
  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;
  const original = target.value;
  const nextValue = original.slice(0, start) + clean + original.slice(end);

  const finalValue = maxLength ? nextValue.slice(0, maxLength) : nextValue;

  // Actualizar el valor nativo y disparar evento de cambio sintético
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(target, finalValue);
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

/**
 * Formateadores agrupados como en Flutter AppInputFormatters
 */
export const AppInputFormatters = {
  lettersAndSpaces: {
    onKeyDown: allowOnlyLettersAndSpaces,
    sanitize: sanitizeLettersAndSpaces,
  },
  alphaOnly: {
    onKeyDown: allowOnlyAlpha,
    sanitize: (val: string) => sanitizeAlpha(val, false),
  },
  alphaOnlyUpper: {
    onKeyDown: allowOnlyAlpha,
    sanitize: (val: string) => sanitizeAlpha(val, true),
  },
  digitsOnly: {
    onKeyDown: allowOnlyDigits,
    sanitize: sanitizeDigits,
  },
  alphanumeric: {
    onKeyDown: allowAlphanumeric,
    sanitize: (val: string) => sanitizeAlphanumeric(val, false),
  },
  alphanumericUpper: {
    onKeyDown: allowAlphanumeric,
    sanitize: (val: string) => sanitizeAlphanumeric(val, true),
  },
  shipAddress: {
    onKeyDown: allowAddressChars,
    sanitize: sanitizeAddress,
  },
  emailChars: {
    onKeyDown: allowEmailChars,
    sanitize: sanitizeEmailChars,
  },
  rejectEmojis: {
    onKeyDown: blockEmojis,
    sanitize: sanitizeRejectEmojis,
  },
  noWhitespace: {
    onKeyDown: blockWhitespace,
    sanitize: sanitizeNoWhitespace,
  },
  upperCase: {
    sanitize: (val: string) => val.toUpperCase(),
  },
};
