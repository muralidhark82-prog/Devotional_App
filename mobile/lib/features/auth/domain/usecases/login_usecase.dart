import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';

class LoginParams {
  final String identifier;
  final String password;

  LoginParams({required this.identifier, required this.password});
}

class AuthResult {
  final String userId;
  final String accessToken;
  final String refreshToken;
  final String role;
  final String fullName;
  final String? email;

  AuthResult({
    required this.userId,
    required this.accessToken,
    required this.refreshToken,
    this.role = 'MEMBER',
    this.fullName = '',
    this.email,
  });
}

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<Either<Failure, AuthResult>> call(LoginParams params) async {
    return await repository.login(params.identifier, params.password);
  }
}
