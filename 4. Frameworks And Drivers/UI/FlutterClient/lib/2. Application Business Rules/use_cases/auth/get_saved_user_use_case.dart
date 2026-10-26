import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_auth_repository.dart';

class GetSavedUserUseCase {
  final IAuthRepository _repository;

  GetSavedUserUseCase(this._repository);

  Future<AuthUser?> execute() async {
    final token = await _repository.getSavedToken();
    final email = await _repository.getSavedEmail() ?? '';

    if (token != null && token.isNotEmpty) {
      final user = _repository.getUserFromToken(token, email);
      if (user != null) {
        return user;
      }
      await _repository.clearSession();
    }
    return null;
  }
}
