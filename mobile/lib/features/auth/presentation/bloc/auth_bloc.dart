import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/di/injection_container.dart' as di;
import '../../../../core/network/api_client.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';

// Events
abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final String identifier;
  final String password;

  LoginRequested({required this.identifier, required this.password});

  @override
  List<Object?> get props => [identifier, password];
}

class RegisterRequested extends AuthEvent {
  final String fullName;
  final String? email;
  final String? phone;
  final String password;
  final bool isProvider;

  RegisterRequested({
    required this.fullName,
    this.email,
    this.phone,
    required this.password,
    this.isProvider = false,
  });

  @override
  List<Object?> get props => [fullName, email, phone, password, isProvider];
}

class VerifyOtpRequested extends AuthEvent {
  final String contact;
  final String otp;
  final String purpose;

  VerifyOtpRequested({required this.contact, required this.otp, required this.purpose});

  @override
  List<Object?> get props => [contact, otp, purpose];
}

class ResendOtpRequested extends AuthEvent {
  final String contact;

  ResendOtpRequested({required this.contact});

  @override
  List<Object?> get props => [contact];
}

class LogoutRequested extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthSuccess extends AuthState {
  final String userId;
  final String? accessToken;
  final String role;
  final String fullName;
  final String? email;

  AuthSuccess({
    required this.userId,
    this.accessToken,
    this.role = 'MEMBER',
    this.fullName = '',
    this.email,
  });

  @override
  List<Object?> get props => [userId, accessToken, role, fullName, email];
}

class AuthNeedsVerification extends AuthState {
  final String contact;
  final String channel;

  AuthNeedsVerification({required this.contact, required this.channel});

  @override
  List<Object?> get props => [contact, channel];
}

class AuthFailure extends AuthState {
  final String message;
  final String? code;

  AuthFailure({required this.message, this.code});

  @override
  List<Object?> get props => [message, code];
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
  }) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<VerifyOtpRequested>(_onVerifyOtpRequested);
    on<ResendOtpRequested>(_onResendOtpRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final result = await loginUseCase(LoginParams(
        identifier: event.identifier,
        password: event.password,
      ));
      result.fold(
        (failure) => emit(AuthFailure(message: failure.message, code: failure.code)),
        (auth) {
          di.sl<ApiClient>().setAccessToken(auth.accessToken);
          emit(AuthSuccess(
            userId: auth.userId,
            accessToken: auth.accessToken,
            role: auth.role,
            fullName: auth.fullName,
            email: auth.email,
          ));
        },
      );
    } catch (e) {
      emit(AuthFailure(message: 'An unexpected error occurred'));
    }
  }

  Future<void> _onRegisterRequested(RegisterRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final result = await registerUseCase(RegisterParams(
        fullName: event.fullName,
        email: event.email,
        phone: event.phone,
        password: event.password,
        isProvider: event.isProvider,
      ));
      result.fold(
        (failure) => emit(AuthFailure(message: failure.message, code: failure.code)),
        (data) => emit(AuthNeedsVerification(
          contact: event.email ?? event.phone ?? '',
          channel: event.email != null ? 'email' : 'phone',
        )),
      );
    } catch (e) {
      emit(AuthFailure(message: 'An unexpected error occurred'));
    }
  }

  Future<void> _onVerifyOtpRequested(VerifyOtpRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final result = await loginUseCase.repository.verifyOtp(event.contact, event.otp, event.purpose);
      result.fold(
        (failure) => emit(AuthFailure(message: failure.message, code: failure.code)),
        (auth) {
          di.sl<ApiClient>().setAccessToken(auth.accessToken);
          emit(AuthSuccess(
            userId: auth.userId,
            accessToken: auth.accessToken,
            role: auth.role,
            fullName: auth.fullName,
            email: auth.email,
          ));
        },
      );
    } catch (e) {
      emit(AuthFailure(message: 'Verification failed'));
    }
  }

  Future<void> _onResendOtpRequested(ResendOtpRequested event, Emitter<AuthState> emit) async {
    try {
      await loginUseCase.repository.sendOtp(event.contact, 'registration');
    } catch (_) {
      // Silently fail — user can retry
    }
  }

  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    di.sl<ApiClient>().setAccessToken(null);
    emit(AuthInitial());
  }
}
