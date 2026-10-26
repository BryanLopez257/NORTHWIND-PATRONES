import 'package:flutter_test/flutter_test.dart';

void main() {
  String? validatePassword(String? val) {
    if (val == null || val.isEmpty) {
      return 'La contraseña es requerida.';
    }
    if (val.length < 6) {
      return 'Se requiere al menos 6 caracteres en la contraseña.';
    }
    if (val.length > 100) {
      return 'La contraseña no debe superar los 100 caracteres.';
    }
    if (val.contains(' ')) {
      return 'Sin espacios en blanco.';
    }
    if (!RegExp(r'[A-Z]').hasMatch(val)) {
      return 'La contraseña requiere al menos una letra mayúscula.';
    }
    if (!RegExp(r'[0-9]').hasMatch(val)) {
      return 'La contraseña requiere al menos un dígito.';
    }
    if (!RegExp(r'[^a-zA-Z0-9\s]').hasMatch(val)) {
      return 'La contraseña requiere al menos un símbolo o carácter especial.';
    }
    final emojiRegex = RegExp(
        r'(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])');
    if (emojiRegex.hasMatch(val)) {
      return 'La contraseña no debe contener emojis.';
    }
    return null;
  }

  String? validateConfirmPassword(String? val, String password) {
    if (val == null || val.isEmpty) {
      return 'La confirmación de contraseña es requerida.';
    }
    if (val != password) {
      return 'Las contraseñas no coinciden.';
    }
    return null;
  }

  String? validateEmail(String? val) {
    if (val == null || val.trim().isEmpty) {
      return 'El correo es requerido.';
    }
    final clean = val.trim();
    if (clean.length > 100) {
      return 'El correo no debe superar los 100 caracteres.';
    }
    if (!RegExp(r'^[a-zA-Z0-9.@]+$').hasMatch(clean)) {
      return 'Solo letras, números, punto (.) y arroba (@).';
    }
    final emailRegex = RegExp(r'^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-zA-Z0-9]{2,}$');
    if (!emailRegex.hasMatch(clean)) {
      return 'El formato de correo no es válido.';
    }
    return null;
  }

  group('Password Registration Validator Tests', () {
    test('Valid password passes all criteria', () {
      expect(validatePassword('Admin123!'), isNull);
      expect(validatePassword('P@ssw0rd'), isNull);
      expect(validatePassword('North#2026'), isNull);
    });

    test('Password with less than 6 characters fails', () {
      expect(validatePassword('Ad1!'), contains('al menos 6 caracteres'));
    });

    test('Password without uppercase fails', () {
      expect(validatePassword('admin123!'), contains('mayúscula'));
    });

    test('Password without digit fails', () {
      expect(validatePassword('Admin!@#\$'), contains('dígito'));
    });

    test('Password without symbol fails', () {
      expect(validatePassword('Admin1234'), contains('símbolo'));
    });

    test('Password with whitespace fails', () {
      expect(validatePassword('Admin 123!'), contains('Sin espacios'));
    });

    test('Password with emoji fails', () {
      expect(validatePassword('Admin123!🚀'), contains('emojis'));
    });
  });

  group('Confirm Password Validator Tests', () {
    test('Matching password passes', () {
      expect(validateConfirmPassword('Admin123!', 'Admin123!'), isNull);
    });

    test('Empty confirm password fails', () {
      expect(validateConfirmPassword('', 'Admin123!'), contains('requerida'));
      expect(validateConfirmPassword(null, 'Admin123!'), contains('requerida'));
    });

    test('Mismatched password fails', () {
      expect(validateConfirmPassword('Admin123?', 'Admin123!'), contains('no coinciden'));
    });
  });

  group('Email Auth Validator Tests (Login and Register)', () {
    test('Valid email passes', () {
      expect(validateEmail('usuario@dominio.com'), isNull);
      expect(validateEmail('admin.northwind@empresa.com.ec'), isNull);
    });

    test('Email with plus or hyphen or underscore fails strict characters check', () {
      expect(validateEmail('usuario+tag@dominio.com'), contains('Solo letras, números, punto (.) y arroba (@)'));
      expect(validateEmail('usuario-test@dominio.com'), contains('Solo letras, números, punto (.) y arroba (@)'));
      expect(validateEmail('usuario_test@dominio.com'), contains('Solo letras, números, punto (.) y arroba (@)'));
    });

    test('Email without at or dot fails format check', () {
      expect(validateEmail('usuariodominio.com'), contains('formato de correo'));
      expect(validateEmail('usuario@dominiocom'), contains('formato de correo'));
    });
  });
}
