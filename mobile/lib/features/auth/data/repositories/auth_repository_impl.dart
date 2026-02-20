import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import '../datasources/auth_remote_datasource.dart';
import '../datasources/auth_local_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;

  AuthRepositoryImpl(this.remoteDataSource, this.localDataSource);

  @override
  Future<Either<Failure, AuthResult>> login(String identifier, String password) async {
    try {
      final response = await remoteDataSource.login(identifier, password);
      await localDataSource.saveTokens(response['accessToken'], response['refreshToken']);
      final result = AuthResult(
        userId: response['user']['id'],
        accessToken: response['accessToken'],
        refreshToken: response['refreshToken'],
        role: response['user']['role'] ?? 'MEMBER',
        fullName: response['user']['profile']?['fullName'] ?? '',
        email: response['user']['email'],
      );
      return Right(result);
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      return Left(ServerFailure(message: msg));
    }
  }

  @override
  Future<Either<Failure, RegisterResult>> register({
    required String fullName,
    String? email,
    String? phone,
    required String password,
    bool isProvider = false,
  }) async {
    try {
      final response = await remoteDataSource.register(
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
        role: isProvider ? 'PROVIDER' : 'MEMBER',
      );
      return Right(RegisterResult(
        userId: response['userId'],
        verificationRequired: response['verificationRequired'] ?? true,
        verificationChannel: response['verificationChannel'] ?? 'email',
      ));
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      return Left(ServerFailure(message: msg));
    }
  }

  @override
  Future<Either<Failure, AuthResult>> verifyOtp(String contact, String otp, String purpose) async {
    try {
      final response = await remoteDataSource.verifyOtp(contact, otp, purpose);
      await localDataSource.saveTokens(response['accessToken'], response['refreshToken']);
      return Right(AuthResult(
        userId: response['user']['id'],
        accessToken: response['accessToken'],
        refreshToken: response['refreshToken'],
        role: response['user']['role'] ?? 'MEMBER',
        fullName: response['user']['profile']?['fullName'] ?? '',
        email: response['user']['email'],
      ));
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      return Left(ServerFailure(message: msg));
    }
  }

  @override
  Future<Either<Failure, void>> sendOtp(String contact, String purpose) async {
    try {
      await remoteDataSource.sendOtp(contact, purpose);
      return const Right(null);
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      return Left(ServerFailure(message: msg));
    }
  }

  @override
  Future<Either<Failure, void>> logout({bool allDevices = false}) async {
    try {
      final refreshToken = await localDataSource.getRefreshToken();
      await remoteDataSource.logout(refreshToken: refreshToken, allDevices: allDevices);
      await localDataSource.clearTokens();
      return const Right(null);
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      return Left(ServerFailure(message: msg));
    }
  }

  @override
  Future<Either<Failure, AuthResult>> refreshToken(String refreshToken) async {
    try {
      final response = await remoteDataSource.refreshToken(refreshToken);
      await localDataSource.saveTokens(response['accessToken'], response['refreshToken']);
      return Right(AuthResult(
        userId: '', // Not returned in refresh
        accessToken: response['accessToken'],
        refreshToken: response['refreshToken'],
      ));
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      return Left(ServerFailure(message: msg));
    }
  }
}
