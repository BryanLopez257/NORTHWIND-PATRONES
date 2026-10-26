class UserCredentialsDto {
  final String email;
  final String password;

  const UserCredentialsDto({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
      };
}

class UserRegistrationDto {
  final String firstName;
  final String? secondName;
  final String lastName;
  final String? secondLastName;
  final String email;
  final String password;

  const UserRegistrationDto({
    required this.firstName,
    this.secondName,
    required this.lastName,
    this.secondLastName,
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
        'firstName': firstName,
        'secondName': secondName,
        'lastName': lastName,
        'secondLastName': secondLastName,
        'email': email,
        'password': password,
      };
}

class TokensDto {
  final String accessToken;
  final String refreshToken;

  const TokensDto({
    required this.accessToken,
    required this.refreshToken,
  });

  factory TokensDto.fromJson(Map<String, dynamic> json) {
    return TokensDto(
      accessToken: json['accessToken'] as String? ?? json['token'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
    );
  }
}

class AuthUser {
  final String id;
  final String email;
  final String fullName;
  final String role;

  String get name => fullName;

  const AuthUser({
    required this.id,
    required this.email,
    required this.fullName,
    this.role = 'Vendedor',
  });
}
