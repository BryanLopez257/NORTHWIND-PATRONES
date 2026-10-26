import 'package:flutter/foundation.dart';
import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../repositories/auth_repository.dart';

class AuthProvider extends ChangeNotifier {
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final LogoutUseCase _logoutUseCase;
  final GetSavedUserUseCase _getSavedUserUseCase;

  AuthUser? _currentUser;
  bool _isLoading = true;
  String? _errorMessage;

  AuthProvider({
    LoginUseCase? loginUseCase,
    RegisterUseCase? registerUseCase,
    LogoutUseCase? logoutUseCase,
    GetSavedUserUseCase? getSavedUserUseCase,
  })  : _loginUseCase = loginUseCase ?? LoginUseCase(AuthRepository()),
        _registerUseCase = registerUseCase ?? RegisterUseCase(AuthRepository()),
        _logoutUseCase = logoutUseCase ?? LogoutUseCase(AuthRepository()),
        _getSavedUserUseCase = getSavedUserUseCase ?? GetSavedUserUseCase(AuthRepository());

  AuthUser? get currentUser => _currentUser;
  AuthUser? get user => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  bool get isInitializing => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> init() => initAuth();

  Future<void> initAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      _currentUser = await _getSavedUserUseCase.execute();
    } catch (_) {
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _loginUseCase.execute(
        UserCredentialsDto(email: email, password: password),
      );
      if (user != null) {
        _currentUser = user;
        _isLoading = false;
        notifyListeners();
        return true;
      }
      _errorMessage = 'Credenciales inválidas.';
      return false;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register(UserRegistrationDto dto) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      return await _registerUseCase.execute(dto);
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _logoutUseCase.execute();
    _currentUser = null;
    notifyListeners();
  }
}
