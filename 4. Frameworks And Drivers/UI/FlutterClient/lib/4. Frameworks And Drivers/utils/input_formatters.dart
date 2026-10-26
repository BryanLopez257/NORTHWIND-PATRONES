import 'package:flutter/services.dart';

class AppInputFormatters {
  // Letters and spaces (Spanish accents allowed)
  static final TextInputFormatter lettersAndSpaces =
      FilteringTextInputFormatter.allow(RegExp(r"[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]"));

  // Strictly ASCII letters
  static final TextInputFormatter alphaOnly =
      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z]'));

  // Digits only
  static final TextInputFormatter digitsOnly =
      FilteringTextInputFormatter.digitsOnly;

  // Alphanumeric
  static final TextInputFormatter alphanumeric =
      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]'));

  // Address chars
  static final TextInputFormatter shipAddress =
      FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,\-#/°]"));

  // Email chars
  static final TextInputFormatter email =
      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9@._\-\+]'));

  // Deny emojis
  static final TextInputFormatter rejectEmojis =
      FilteringTextInputFormatter.deny(
        RegExp(
          r'[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]',
          unicode: true,
        ),
      );

  // Deny whitespace
  static final TextInputFormatter noWhitespace =
      FilteringTextInputFormatter.deny(RegExp(r'\s'));

  // Uppercase
  static final TextInputFormatter upperCase = _UpperCaseFormatter();
}

class _UpperCaseFormatter extends TextInputFormatter {
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
