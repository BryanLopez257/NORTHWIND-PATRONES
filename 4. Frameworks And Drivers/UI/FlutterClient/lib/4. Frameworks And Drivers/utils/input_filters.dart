import 'package:flutter/services.dart';

class InputFilters {
  // Solo letras con acentos, diéresis y espacios (Nombres y Apellidos)
  static final TextInputFormatter lettersAndSpaces =
      FilteringTextInputFormatter.allow(RegExp(r"[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]"));

  // Solo letras ASCII mayúsculas/minúsculas sin espacios
  static final TextInputFormatter alphaOnly =
      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z]'));

  // Solo dígitos 0-9
  static final TextInputFormatter digitsOnly =
      FilteringTextInputFormatter.digitsOnly;

  // Alfanumérico sin acentos ni espacios (Código Postal)
  static final TextInputFormatter alphanumeric =
      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]'));

  // Dirección: alfanumérico, espacios, puntos, comas, guiones, numeral, barra, grado
  static final TextInputFormatter shipAddress =
      FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,\-#/°]"));

  // Email seguro (estándar RFC permitiendo +, -, _, ., @)
  static final TextInputFormatter email =
      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9@._\-\+]'));

  // Prevenir emojis
  static final TextInputFormatter rejectEmojis =
      FilteringTextInputFormatter.deny(
        RegExp(
          r'[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]',
          unicode: true,
        ),
      );

  // Prevenir cualquier espacio en blanco
  static final TextInputFormatter noWhitespace =
      FilteringTextInputFormatter.deny(RegExp(r'\s'));

  // Convertir a mayúsculas automáticamente
  static final TextInputFormatter upperCase = _UpperCaseTextFormatter();

  // Sanitizers
  static String sanitizeAlpha(String value, [bool uppercase = false]) {
    final clean = value.replaceAll(RegExp(r'[^a-zA-Z]'), '');
    return uppercase ? clean.toUpperCase() : clean;
  }

  static String sanitizeLettersAndSpaces(String value) {
    return value.replaceAll(RegExp(r"[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]"), '');
  }

  static String sanitizeDigits(String value) {
    return value.replaceAll(RegExp(r'[^\d]'), '');
  }

  static String sanitizeAddress(String value) {
    return value.replaceAll(RegExp(r"[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,\-#/°]"), '');
  }
}

class _UpperCaseTextFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    return TextEditingValue(
      text: newValue.text.toUpperCase(),
      selection: newValue.selection,
    );
  }
}
