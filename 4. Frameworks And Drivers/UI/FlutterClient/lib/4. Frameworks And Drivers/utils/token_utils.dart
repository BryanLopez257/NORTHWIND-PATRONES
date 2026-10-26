import 'dart:convert';
import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';

class TokenUtils {
  static Map<String, dynamic>? decodeJwt(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;

      String payload = parts[1];
      while (payload.length % 4 != 0) {
        payload += '=';
      }

      final decoded = utf8.decode(base64Url.decode(payload));
      return jsonDecode(decoded) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static bool isTokenExpired(String token) {
    final payload = decodeJwt(token);
    if (payload == null) return true;

    final exp = payload['exp'];
    if (exp == null) return false;

    final expiryDate = DateTime.fromMillisecondsSinceEpoch((exp as int) * 1000);
    return DateTime.now().isAfter(expiryDate);
  }

  static AuthUser? parseUserFromToken(String token, String fallbackEmail) {
    final payload = decodeJwt(token);
    if (payload == null) return null;

    final id = payload['sub'] ??
        payload['nameid'] ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
        '';

    final email = payload['email'] ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
        fallbackEmail;

    final name = payload['name'] ??
        payload['given_name'] ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
        (email.contains('@') ? email.split('@').first : 'Usuario');

    final role = payload['role'] ??
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        'Vendedor';

    return AuthUser(
      id: id.toString(),
      email: email.toString(),
      fullName: name.toString(),
      role: role.toString(),
    );
  }
}
