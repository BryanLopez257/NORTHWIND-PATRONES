/**
 * Validador de Cédula y RUC de Ecuador
 * Algoritmos oficiales basados en Módulo 10 y Módulo 11.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  type?: 'cedula' | 'ruc_natural' | 'ruc_privada' | 'ruc_publica';
}

/**
 * Valida una cédula ecuatoriana (10 dígitos numéricos).
 * Aplica algoritmo de Módulo 10 con coeficientes 2, 1 alternados.
 */
export function validateCedula(cedula: string): ValidationResult {
  const clean = cedula?.trim() || '';

  if (!/^\d{10}$/.test(clean)) {
    return { isValid: false, error: 'La cédula debe contener exactamente 10 dígitos numéricos.' };
  }

  const province = parseInt(clean.substring(0, 2), 10);
  if (province < 1 || (province > 24 && province !== 30)) {
    return { isValid: false, error: 'El código de provincia (dos primeros dígitos) no es válido.' };
  }

  const thirdDigit = parseInt(clean[2], 10);
  if (thirdDigit >= 6) {
    return { isValid: false, error: 'El tercer dígito de la cédula debe ser menor a 6.' };
  }

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let val = parseInt(clean[i], 10) * coefficients[i];
    if (val >= 10) {
      val -= 9;
    }
    sum += val;
  }

  const verifierDigit = parseInt(clean[9], 10);
  const calculated = (10 - (sum % 10)) % 10;

  if (verifierDigit !== calculated) {
    return { isValid: false, error: 'El dígito verificador de la cédula es incorrecto.' };
  }

  return { isValid: true, type: 'cedula' };
}

/**
 * Valida un RUC ecuatoriano (13 dígitos numéricos).
 * Clasifica y valida según:
 * 1. Persona Natural (3er dígito < 6): Cédula válida + sufijo 001.
 * 2. Sociedad Privada / Extranjera (3er dígito = 9): Módulo 11 con 9 coeficientes [4,3,2,7,6,5,4,3,2].
 * 3. Entidad Pública (3er dígito = 6): Módulo 11 con 8 coeficientes [3,2,7,6,5,4,3,2].
 */
export function validateRuc(ruc: string): ValidationResult {
  const clean = ruc?.trim() || '';

  if (!/^\d{13}$/.test(clean)) {
    return { isValid: false, error: 'El RUC debe contener exactamente 13 dígitos numéricos.' };
  }

  const province = parseInt(clean.substring(0, 2), 10);
  if (province < 1 || (province > 24 && province !== 30)) {
    return { isValid: false, error: 'El código de provincia del RUC no es válido.' };
  }

  const thirdDigit = parseInt(clean[2], 10);

  // 1. RUC Persona Natural (tercer dígito 0 a 5)
  if (thirdDigit < 6) {
    const cedulaPart = clean.substring(0, 10);
    const establishment = clean.substring(10, 13);

    const cedulaCheck = validateCedula(cedulaPart);
    if (!cedulaCheck.isValid) {
      return { isValid: false, error: `RUC Natural inválido: ${cedulaCheck.error}` };
    }

    if (establishment === '000') {
      return { isValid: false, error: 'El establecimiento del RUC (últimos 3 dígitos) no puede ser 000.' };
    }

    return { isValid: true, type: 'ruc_natural' };
  }

  // 2. RUC Entidad Pública (tercer dígito = 6)
  if (thirdDigit === 6) {
    const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      sum += parseInt(clean[i], 10) * coefficients[i];
    }

    const remainder = sum % 11;
    const calculated = remainder === 0 ? 0 : 11 - remainder;
    const verifier = parseInt(clean[8], 10);

    if (verifier !== calculated) {
      return { isValid: false, error: 'Dígito verificador de RUC público no coincide.' };
    }

    const establishment = clean.substring(9, 13);
    if (establishment === '0000') {
      return { isValid: false, error: 'El establecimiento del RUC público no puede ser 0000.' };
    }

    return { isValid: true, type: 'ruc_publica' };
  }

  // 3. RUC Sociedad Privada o Jurídica (tercer dígito = 9)
  if (thirdDigit === 9) {
    const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean[i], 10) * coefficients[i];
    }

    const remainder = sum % 11;
    const calculated = remainder === 0 ? 0 : 11 - remainder;
    const verifier = parseInt(clean[9], 10);

    if (verifier !== calculated) {
      return { isValid: false, error: 'Dígito verificador de RUC privado/jurídico no coincide.' };
    }

    const establishment = clean.substring(10, 13);
    if (establishment === '000') {
      return { isValid: false, error: 'El establecimiento del RUC no puede ser 000.' };
    }

    return { isValid: true, type: 'ruc_privada' };
  }

  return { isValid: false, error: 'El tercer dígito del RUC no corresponde a ningún tipo válido (0-5 natural, 6 público, 9 jurídico).' };
}

/**
 * Validador unificado para Cédula (10 dígitos) o RUC (13 dígitos).
 */
export function validateEcuadorianId(value: string): ValidationResult {
  const clean = value?.trim() || '';
  if (clean.length === 10) {
    return validateCedula(clean);
  }
  if (clean.length === 13) {
    return validateRuc(clean);
  }
  return {
    isValid: false,
    error: 'La identificación debe tener 10 dígitos (Cédula) o 13 dígitos (RUC).',
  };
}
