import 'package:flutter_test/flutter_test.dart';
import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';

void main() {
  group('EcuadorianValidator Tests', () {
    test('Valid Ecuadorian Cedula should pass', () {
      // 1710034065 is a well-known valid Ecuadorian cedula (Pichincha)
      expect(EcuadorianValidator.isValidCedula('1710034065'), isTrue);
    });

    test('Invalid Ecuadorian Cedula should fail', () {
      expect(EcuadorianValidator.isValidCedula('1710034066'), isFalse);
      expect(EcuadorianValidator.isValidCedula('12345'), isFalse);
      expect(EcuadorianValidator.isValidCedula('abcdefghij'), isFalse);
    });

    test('Valid Ecuadorian Natural Person RUC should pass', () {
      expect(EcuadorianValidator.isValidRuc('1710034065001'), isTrue);
    });

    test('RUC with 000 establishment should fail', () {
      expect(EcuadorianValidator.isValidRuc('1710034065000'), isFalse);
    });
  });
}
