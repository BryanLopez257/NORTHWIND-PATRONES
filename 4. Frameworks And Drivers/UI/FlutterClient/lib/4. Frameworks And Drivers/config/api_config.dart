import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static const String _storageKey = 'nw_web_api_url';

  /// Permite inyectar la URL al compilar o ejecutar mediante:
  /// flutter run --dart-define=API_URL=https://...
  static const String _envApiUrl = String.fromEnvironment('API_URL');

  /// URL del túnel Cloudflare asignado para NorthWind WebApi en Flutter
  static const String tunnelUrl = 'https://flutter.luminacrminmobiliario.com';

  static String get defaultBaseUrl {
    if (_envApiUrl.trim().isNotEmpty) {
      return _envApiUrl.trim();
    }
    // Por defecto usa el túnel de Cloudflare para que funcione en Web móvil y Android
    return tunnelUrl;
  }

  static String _baseUrl = defaultBaseUrl;
  static String get baseUrl => _baseUrl;

  static Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_storageKey);

    // Si no hay nada guardado o tiene un default viejo (localhost/10.0.2.2/devracpd), usar el nuevo túnel
    if (saved != null &&
        saved.trim().isNotEmpty &&
        saved != 'http://localhost:5000' &&
        saved != 'http://10.0.2.2:5000' &&
        !saved.contains('devracpd')) {
      _baseUrl = saved.trim();
    } else {
      _baseUrl = defaultBaseUrl;
      await prefs.setString(_storageKey, defaultBaseUrl);
    }
  }

  static Future<void> setBaseUrl(String url) async {
    var cleanUrl = url.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1);
    }
    _baseUrl = cleanUrl;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, cleanUrl);
  }

  static Future<void> resetToDefault() async {
    _baseUrl = defaultBaseUrl;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storageKey);
  }
}
