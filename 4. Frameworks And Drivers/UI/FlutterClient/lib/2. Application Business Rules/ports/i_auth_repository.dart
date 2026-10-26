import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';

abstract class IAuthRepository {
  Future<TokensDto> login(UserCredentialsDto credentials);
  Future<bool> register(UserRegistrationDto registration);
  Future<String?> getSavedToken();
  Future<String?> getSavedEmail();
  Future<void> saveSession(TokensDto tokens, String email);
  Future<void> clearSession();
  AuthUser? getUserFromToken(String token, String email);
}
