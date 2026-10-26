import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:northwind/4. Frameworks And Drivers/utils/input_formatters.dart';

void main() {
  String applyFormatter(TextInputFormatter formatter, String text) {
    return formatter
        .formatEditUpdate(
          TextEditingValue.empty,
          TextEditingValue(text: text),
        )
        .text;
  }

  group('LettersAndSpacesFormatter (data-letters-only)', () {
    final formatter = AppInputFormatters.lettersAndSpaces;

    test('allows letters with Spanish accents and spaces', () {
      expect(applyFormatter(formatter, 'José María Peña Güero ÁÉÍÓÚ'), 'José María Peña Güero ÁÉÍÓÚ');
    });

    test('strips digits and prohibited symbols', () {
      expect(applyFormatter(formatter, 'Juan 123 Perez!#\$%'), 'Juan  Perez');
    });

    test('prohibits digits in city and country names', () {
      expect(applyFormatter(formatter, 'Quito 2'), 'Quito ');
      expect(applyFormatter(formatter, 'Ecuador 2026'), 'Ecuador ');
      expect(applyFormatter(formatter, 'Guayaquil #1'), 'Guayaquil ');
    });
  });

  group('AlphaOnlyFormatter (data-alpha-only)', () {
    final formatter = AppInputFormatters.alphaOnly;

    test('allows strictly ASCII letters', () {
      expect(applyFormatter(formatter, 'ALFKI'), 'ALFKI');
      expect(applyFormatter(formatter, 'NorthWind'), 'NorthWind');
    });

    test('strips spaces, accents, numbers, and symbols', () {
      expect(applyFormatter(formatter, 'ALF 123 ñá!'), 'ALF');
    });
  });

  group('DigitsOnlyFormatter (data-numeric-only)', () {
    final formatter = AppInputFormatters.digitsOnly;

    test('allows numbers only', () {
      expect(applyFormatter(formatter, '1710034065001'), '1710034065001');
    });

    test('strips non-digits', () {
      expect(applyFormatter(formatter, '1710-034.065a'), '1710034065');
    });
  });

  group('AlphanumericFormatter (Postal Code)', () {
    final formatter = AppInputFormatters.alphanumeric;

    test('allows letters and numbers', () {
      expect(applyFormatter(formatter, '170150'), '170150');
      expect(applyFormatter(formatter, 'SW1A1AA'), 'SW1A1AA');
    });

    test('strips spaces, accents, and symbols', () {
      expect(applyFormatter(formatter, 'SW1A 1AA-ñ!#'), 'SW1A1AA');
    });
  });

  group('ShipAddressFormatter', () {
    final formatter = AppInputFormatters.shipAddress;

    test('allows alphanumeric, spaces, and allowed address symbols', () {
      expect(
        applyFormatter(formatter, 'Av. Amazonas N24-196 y Colón, Dpto. 4B / 3° piso'),
        'Av. Amazonas N24-196 y Colón, Dpto. 4B / 3° piso',
      );
    });

    test('strips non-address symbols', () {
      expect(applyFormatter(formatter, 'Casa #12 @ \$100%'), 'Casa #12  100');
    });
  });

  group('EmailFormatter', () {
    final formatter = AppInputFormatters.email;

    test('allows letters, numbers, dot, and at', () {
      expect(applyFormatter(formatter, 'user.name2024@northwind.com.ec'), 'user.name2024@northwind.com.ec');
    });

    test('strips spaces and invalid special characters but keeps valid email characters (+, -, _)', () {
      expect(applyFormatter(formatter, 'user+name-test_extra@domain.com!#\$%'), 'user+name-test_extra@domain.com');
    });
  });

  group('EmojiRejectingFormatter & NoWhitespaceFormatter', () {
    test('rejectEmojis denies emojis', () {
      final formatter = AppInputFormatters.rejectEmojis;
      expect(applyFormatter(formatter, 'Hello 😀 World 🚀'), 'Hello  World ');
    });

    test('noWhitespace denies spaces and tabs', () {
      final formatter = AppInputFormatters.noWhitespace;
      expect(applyFormatter(formatter, 'pass word 123'), 'password123');
    });

    test('upperCase converts text to uppercase', () {
      final formatter = AppInputFormatters.upperCase;
      expect(applyFormatter(formatter, 'alfki'), 'ALFKI');
    });
  });
}
