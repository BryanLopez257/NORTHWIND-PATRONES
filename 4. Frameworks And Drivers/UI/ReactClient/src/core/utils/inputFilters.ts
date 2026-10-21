import React from 'react';

/**
 * Checks if the key pressed is a control key or modifier shortcut that should not be blocked.
 * This includes navigation keys (Arrow keys, Home, End, PageUp, PageDown),
 * editing keys (Backspace, Delete, Tab, Enter, Escape),
 * dead keys for accents (Dead), and shortcut combos (Ctrl, Alt, Meta).
 */
export const isControlKey = (e: React.KeyboardEvent): boolean => {
  // Allow browser/OS shortcuts (Ctrl+C, Ctrl+V, Ctrl+A, Cmd+V, etc.)
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return true;
  }

  // Non-printable or multi-character keys (Backspace, Tab, Enter, Escape, ArrowLeft, Delete, Dead, etc.)
  if (e.key.length > 1) {
    return true;
  }

  return false;
};

// ==========================================
// Keyboard Event Filters (onKeyDown)
// ==========================================

/**
 * Allows only letters (including accents and ñ) and spaces.
 * Blocks numbers and special characters in real time.
 */
export const allowOnlyLettersAndSpaces = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * Allows only alphabetical letters (a-z, A-Z) without spaces or numbers.
 * Ideal for customer IDs (ALFKI).
 */
export const allowOnlyAlpha = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!/^[a-zA-Z]$/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * Allows only digits (0-9).
 * Ideal for identification documents (Cédula/RUC) and postal codes.
 */
export const allowOnlyDigits = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * Allows valid address characters (letters, numbers, spaces, and punctuation: .,#-/°).
 */
export const allowAddressChars = (e: React.KeyboardEvent): void => {
  if (isControlKey(e)) return;
  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-\/°]$/.test(e.key)) {
    e.preventDefault();
  }
};

// ==========================================
// Sanitization Functions (onChange / onPaste)
// ==========================================

/**
 * Sanitizes input to only letters and spaces, removing numbers and special characters.
 */
export const sanitizeLettersAndSpaces = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
};

/**
 * Sanitizes input to only alphabetical characters and converts to uppercase.
 */
export const sanitizeAlpha = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-Z]/g, '').toUpperCase();
};

/**
 * Sanitizes input to only digits (0-9).
 */
export const sanitizeDigits = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Sanitizes input to valid address characters.
 */
export const sanitizeAddress = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-\/°]/g, '');
};
