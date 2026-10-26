import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_auth_repository.dart';

class LoginUseCase {
  final IAuthRepository _repository;

  LoginUseCase(this._repository);

  Future<AuthUser?> execute(UserCredentialsDto credentials) async {
    final tokens = await _repository.login(credentials);
    await _repository.saveSession(tokens, credentials.email);
    return _repository.getUserFromToken(tokens.accessToken, credentials.email);
  }
}
