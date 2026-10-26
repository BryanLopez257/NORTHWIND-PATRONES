import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:northwind/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('App smoke test - renders login page initially', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const NorthWindApp());
    await tester.pumpAndSettle();
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(find.text('Iniciar sesión'), findsWidgets);
  });
}
