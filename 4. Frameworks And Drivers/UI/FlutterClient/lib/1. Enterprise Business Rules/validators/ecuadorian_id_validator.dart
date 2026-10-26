enum IdType { cedula, rucPersonaNatural, rucSociedadPrivada, rucPublica, invalid }

class ValidationResult {
  final bool isValid;
  final IdType type;
  final String? error;

  const ValidationResult({
    required this.isValid,
    this.type = IdType.invalid,
    this.error,
  });
}

typedef EcuadorianIdResult = ValidationResult;
typedef EcuadorianValidator = EcuadorianIdValidator;

class EcuadorianIdValidator {
  static ValidationResult validate(String id) => validateEcuadorianId(id);
  static bool isValidCedula(String cedula) => validateCedula(cedula).isValid;
  static bool isValidRuc(String ruc) => validateRuc(ruc).isValid;

  static ValidationResult validateCedula(String cedula) {
    final clean = cedula.trim();

    if (clean.length != 10) {
      return const ValidationResult(isValid: false, error: 'La cédula debe contener exactamente 10 dígitos.');
    }
    if (!RegExp(r'^\d{10}$').hasMatch(clean)) {
      return const ValidationResult(isValid: false, error: 'La cédula debe contener únicamente números.');
    }

    final province = int.parse(clean.substring(0, 2));
    if ((province < 1 || province > 24) && province != 30) {
      return const ValidationResult(isValid: false, error: 'Código de provincia inválido.');
    }

    final thirdDigit = int.parse(clean[2]);
    if (thirdDigit < 0 || thirdDigit > 5) {
      return const ValidationResult(isValid: false, error: 'Tercer dígito de cédula inválido (debe ser de 0 a 5).');
    }

    final coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    var sum = 0;
    for (int i = 0; i < 9; i++) {
      var prod = int.parse(clean[i]) * coefficients[i];
      if (prod >= 10) prod -= 9;
      sum += prod;
    }

    final verifier = int.parse(clean[9]);
    final calculated = (sum % 10 == 0) ? 0 : 10 - (sum % 10);

    if (calculated != verifier) {
      return const ValidationResult(isValid: false, error: 'Dígito verificador de cédula incorrecto.');
    }

    return const ValidationResult(isValid: true, type: IdType.cedula);
  }

  static ValidationResult validateRuc(String ruc) {
    final clean = ruc.trim();

    if (clean.length != 13) {
      return const ValidationResult(isValid: false, error: 'El RUC debe tener exactamente 13 dígitos.');
    }
    if (!RegExp(r'^\d{13}$').hasMatch(clean)) {
      return const ValidationResult(isValid: false, error: 'El RUC debe contener únicamente números.');
    }

    final province = int.parse(clean.substring(0, 2));
    if ((province < 1 || province > 24) && province != 30) {
      return const ValidationResult(isValid: false, error: 'Código de provincia de RUC inválido.');
    }

    final establishment = clean.substring(10, 13);
    if (establishment == '000') {
      return const ValidationResult(isValid: false, error: 'El código de establecimiento no puede ser 000.');
    }

    final thirdDigit = int.parse(clean[2]);

    // RUC Persona Natural (tercer dígito 0 a 5): Cédula + establecimiento
    if (thirdDigit >= 0 && thirdDigit <= 5) {
      final cedulaPart = clean.substring(0, 10);
      final cedulaRes = validateCedula(cedulaPart);
      if (!cedulaRes.isValid) {
        return ValidationResult(isValid: false, error: 'RUC de Persona Natural inválido: ${cedulaRes.error}');
      }
      return const ValidationResult(isValid: true, type: IdType.rucPersonaNatural);
    }

    // RUC Sociedad Privada (tercer dígito 9) - Módulo 11 con coeficientes [4, 3, 2, 7, 6, 5, 4, 3, 2]
    if (thirdDigit == 9) {
      final coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      for (int i = 0; i < 9; i++) {
        sum += int.parse(clean[i]) * coefficients[i];
      }
      final remainder = sum % 11;
      final verifier = remainder == 0 ? 0 : 11 - remainder;
      if (verifier != int.parse(clean[9])) {
        return const ValidationResult(isValid: false, error: 'Dígito verificador de RUC Sociedad Privada incorrecto.');
      }
      return const ValidationResult(isValid: true, type: IdType.rucSociedadPrivada);
    }

    // RUC Sociedad Pública (tercer dígito 6) - Módulo 11 con coeficientes [3, 2, 7, 6, 5, 4, 3, 2]
    if (thirdDigit == 6) {
      final coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      for (int i = 0; i < 8; i++) {
        sum += int.parse(clean[i]) * coefficients[i];
      }
      final remainder = sum % 11;
      final verifier = remainder == 0 ? 0 : 11 - remainder;
      if (verifier != int.parse(clean[8])) {
        return const ValidationResult(isValid: false, error: 'Dígito verificador de RUC Institución Pública incorrecto.');
      }
      return const ValidationResult(isValid: true, type: IdType.rucPublica);
    }

    return const ValidationResult(isValid: false, error: 'Tercer dígito de RUC no reconocido por el SRI.');
  }

  static ValidationResult validateEcuadorianId(String id) {
    final clean = id.trim();
    if (clean.length == 10) {
      return validateCedula(clean);
    } else if (clean.length == 13) {
      return validateRuc(clean);
    }
    return const ValidationResult(
      isValid: false,
      error: 'La identificación debe tener 10 dígitos (Cédula) o 13 dígitos (RUC).',
    );
  }
}
