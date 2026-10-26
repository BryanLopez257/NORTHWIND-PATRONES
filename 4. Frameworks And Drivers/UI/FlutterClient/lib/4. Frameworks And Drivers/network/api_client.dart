import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;
  final Map<String, List<String>> fieldErrors;

  ApiException(
    this.message, {
    this.statusCode,
    this.details,
    Map<String, List<String>>? fieldErrors,
  }) : fieldErrors = fieldErrors ?? {};

  String? getFieldError(String fieldName) {
    for (final entry in fieldErrors.entries) {
      if (entry.key.toLowerCase() == fieldName.toLowerCase()) {
        return entry.value.isNotEmpty ? entry.value.first : null;
      }
    }
    return null;
  }

  @override
  String toString() => message;
}

class ApiClient {
  static String? _accessToken;
  static VoidCallback? onUnauthorized;

  static void setToken(String? token) {
    _accessToken = token;
  }

  static String? get token => _accessToken;

  static Map<String, String> _buildHeaders({bool isJson = true}) {
    final headers = <String, String>{
      'Accept': 'application/json',
    };
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (_accessToken != null && _accessToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  static Uri _buildUri(String endpoint, [Map<String, dynamic>? queryParams]) {
    final baseUrl = ApiConfig.baseUrl;
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    final fullUrl = '$baseUrl$cleanEndpoint';

    final uri = Uri.parse(fullUrl);
    if (queryParams != null && queryParams.isNotEmpty) {
      final cleanParams = <String, String>{};
      queryParams.forEach((key, value) {
        if (value != null) {
          cleanParams[key] = value.toString();
        }
      });
      return uri.replace(queryParameters: cleanParams);
    }
    return uri;
  }

  static Future<dynamic> get(String endpoint, {Map<String, dynamic>? queryParams}) async {
    final uri = _buildUri(endpoint, queryParams);
    try {
      final response = await http
          .get(uri, headers: _buildHeaders(isJson: false))
          .timeout(const Duration(seconds: 15));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('No se pudo conectar al servidor NorthWind WebApi en ${ApiConfig.baseUrl}.');
    } on TimeoutException {
      throw ApiException('El servidor tardó demasiado en responder (Tiempo de espera agotado).');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de comunicación: $e');
    }
  }

  static Future<dynamic> post(String endpoint, dynamic body) async {
    final uri = _buildUri(endpoint);
    try {
      final response = await http
          .post(
            uri,
            headers: _buildHeaders(isJson: true),
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 20));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('No se pudo conectar al servidor NorthWind WebApi en ${ApiConfig.baseUrl}.');
    } on TimeoutException {
      throw ApiException('El servidor tardó demasiado en responder (Tiempo de espera agotado).');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de comunicación: $e');
    }
  }

  static Future<dynamic> put(String endpoint, dynamic body) async {
    final uri = _buildUri(endpoint);
    try {
      final response = await http
          .put(
            uri,
            headers: _buildHeaders(isJson: true),
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 20));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('No se pudo conectar al servidor NorthWind WebApi en ${ApiConfig.baseUrl}.');
    } on TimeoutException {
      throw ApiException('El servidor tardó demasiado en responder (Tiempo de espera agotado).');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de comunicación: $e');
    }
  }

  static Future<dynamic> delete(String endpoint, {dynamic body}) async {
    final uri = _buildUri(endpoint);
    try {
      final response = await http
          .delete(
            uri,
            headers: _buildHeaders(isJson: body != null),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 20));
      return _processResponse(response);
    } on SocketException {
      throw ApiException('No se pudo conectar al servidor NorthWind WebApi en ${ApiConfig.baseUrl}.');
    } on TimeoutException {
      throw ApiException('El servidor tardó demasiado en responder (Tiempo de espera agotado).');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de comunicación: $e');
    }
  }

  static dynamic _processResponse(http.Response response) {
    if (response.statusCode == 401) {
      setToken(null);
      if (onUnauthorized != null) {
        onUnauthorized!();
      }
      throw ApiException(
        'Sesión expirada o no autorizada. Inicie sesión nuevamente.',
        statusCode: 401,
      );
    }

    if (response.statusCode == 204) {
      return null;
    }

    dynamic decodedData;
    if (response.body.isNotEmpty) {
      try {
        decodedData = jsonDecode(response.body);
      } catch (_) {
        decodedData = response.body;
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decodedData;
    }

    final fieldErrors = <String, List<String>>{};
    String message = 'Ocurrió un error en el servidor (código ${response.statusCode}).';

    if (decodedData is Map<String, dynamic>) {
      if (decodedData['detail'] != null) {
        message = decodedData['detail'].toString();
      } else if (decodedData['title'] != null) {
        message = decodedData['title'].toString();
      } else if (decodedData['message'] != null) {
        message = decodedData['message'].toString();
      } else if (decodedData['error'] != null) {
        message = decodedData['error'].toString();
      }

      final errors = decodedData['errors'];
      if (errors is Map<String, dynamic>) {
        errors.forEach((key, val) {
          if (val is List) {
            fieldErrors[key] = val.map((e) => e.toString()).toList();
          } else if (val is String) {
            fieldErrors[key] = [val];
          }
        });
      }
    } else if (decodedData is String && decodedData.isNotEmpty) {
      message = decodedData;
    }

    throw ApiException(
      message,
      statusCode: response.statusCode,
      details: decodedData,
      fieldErrors: fieldErrors,
    );
  }
}
