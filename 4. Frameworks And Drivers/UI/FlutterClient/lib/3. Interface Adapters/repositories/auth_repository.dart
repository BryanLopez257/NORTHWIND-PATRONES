import 'package:shared_preferences/shared_preferences.dart';
import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../../4. Frameworks And Drivers/network/api_client.dart';
import '../../4. Frameworks And Drivers/network/endpoints.dart';
import '../../4. Frameworks And Drivers/utils/token_utils.dart';

class AuthRepository implements IAuthRepository {
  static const String _tokenKey = 'nw_access_token';
  static const String _refreshTokenKey = 'nw_refresh_token';
  static const String _emailKey = 'nw_user_email';

  @override
  Future<TokensDto> login(UserCredentialsDto credentials) async {
    final response = await ApiClient.post(
      Endpoints.login,
      credentials.toJson(),
    );

    if (response is Map<String, dynamic>) {
      return TokensDto.fromJson(response);
    }
    throw ApiException('Respuesta inesperada al iniciar sesión.');
  }

  @override
  Future<bool> register(UserRegistrationDto registration) async {
    await ApiClient.post(
      Endpoints.register,
      registration.toJson(),
    );
    return true;
  }

  @override
  Future<String?> getSavedToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  @override
  Future<String?> getSavedEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_emailKey);
  }

  @override
  Future<void> saveSession(TokensDto tokens, String email) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, tokens.accessToken);
    await prefs.setString(_refreshTokenKey, tokens.refreshToken);
    await prefs.setString(_emailKey, email);
    ApiClient.setToken(tokens.accessToken);
  }

  @override
  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshTokenKey);
    await prefs.remove(_emailKey);
    ApiClient.setToken(null);
  }

  @override
  AuthUser? getUserFromToken(String token, String email) {
    return TokenUtils.parseUserFromToken(token, email);
  }
}
