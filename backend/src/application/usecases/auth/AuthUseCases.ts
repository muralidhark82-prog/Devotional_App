import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { OtpRepository, OtpPurpose } from '../../../infrastructure/repositories/OtpRepository';
import { TokenRepository } from '../../../infrastructure/repositories/TokenRepository';
import { AuthService } from '../../../infrastructure/services/AuthService';
import { EmailService } from '../../../infrastructure/services/EmailService';
import { CreateUserData, User, UserStatus, AuthenticatedUser } from '../../../domain/entities';

export interface RegisterInput {
    email?: string;
    phone?: string;
    password: string;
    fullName: string;
    role?: 'MEMBER' | 'PROVIDER';
}

export interface RegisterOutput {
    userId: string;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    verificationRequired: boolean;
    verificationChannel: 'email' | 'phone';
}

export class RegisterUseCase {
    constructor(
        private userRepository: UserRepository,
        private otpRepository: OtpRepository
    ) { }

    async execute(input: RegisterInput): Promise<RegisterOutput> {
        // Validate password
        const passwordValidation = AuthService.validatePassword(input.password);
        if (!passwordValidation.valid) {
            throw new AppError('INVALID_PASSWORD', passwordValidation.errors.join(', '), 400);
        }

        // Check for existing user
        if (input.email) {
            const existingEmail = await this.userRepository.findByEmail(input.email);
            if (existingEmail) {
                throw new AppError('EMAIL_EXISTS', 'Email already registered', 409);
            }
        }

        if (input.phone) {
            const existingPhone = await this.userRepository.findByPhone(input.phone);
            if (existingPhone) {
                throw new AppError('PHONE_EXISTS', 'Phone already registered', 409);
            }
        }

        // Create user
        const user = await this.userRepository.create({
            email: input.email,
            phone: input.phone,
            password: input.password,
            fullName: input.fullName,
            role: input.role as any,
        });

        // Generate and send OTP
        const verificationChannel = input.email ? 'email' : 'phone';
        const contact = input.email || input.phone!;

        const otp = await this.otpRepository.create(contact, OtpPurpose.REGISTRATION, user.id);

        // Send OTP via email
        if (input.email) {
            await EmailService.sendOtp(input.email, otp, 'REGISTRATION');
        } else {
            // TODO: Send OTP via SMS
            console.log(`[DEV] OTP for ${contact}: ${otp}`);
        }

        return {
            userId: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            verificationRequired: true,
            verificationChannel,
        };
    }
}

export interface LoginInput {
    identifier: string;
    password: string;
    deviceInfo?: {
        ipAddress?: string;
        userAgent?: string;
        device?: object;
    };
}

export class LoginUseCase {
    constructor(
        private userRepository: UserRepository,
        private tokenRepository: TokenRepository
    ) { }

    async execute(input: LoginInput): Promise<AuthenticatedUser> {
        const user = await this.userRepository.findByIdentifier(input.identifier);

        if (!user) {
            throw new AppError('INVALID_CREDENTIALS', 'Invalid email/phone or password', 401);
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new AppError('ACCOUNT_LOCKED', 'Account is temporarily locked', 423);
        }

        // Check if account is suspended
        if (user.status === UserStatus.SUSPENDED) {
            throw new AppError('ACCOUNT_SUSPENDED', 'Account is suspended', 403);
        }

        // Check if verified
        if (user.status === UserStatus.PENDING) {
            const contactType = AuthService.identifyContactType(input.identifier);
            throw new AppError(
                contactType === 'email' ? 'EMAIL_NOT_VERIFIED' : 'PHONE_NOT_VERIFIED',
                'Please verify your account first',
                403
            );
        }

        // Verify password
        const isValidPassword = await AuthService.comparePassword(input.password, user.passwordHash);

        if (!isValidPassword) {
            await this.userRepository.incrementFailedAttempts(user.id);
            throw new AppError('INVALID_CREDENTIALS', 'Invalid email/phone or password', 401);
        }

        // Reset failed attempts and update last login
        await this.userRepository.resetFailedAttempts(user.id);

        // Generate tokens
        const tokens = AuthService.generateTokens(user.id, user.role);

        // Store refresh token
        await this.tokenRepository.storeRefreshToken(user.id, tokens.refreshToken, input.deviceInfo);

        // Remove password hash from response
        const { passwordHash, ...safeUser } = user;

        return {
            user: safeUser,
            tokens,
        };
    }
}

export interface VerifyOtpInput {
    contact: string;
    otp: string;
    purpose: 'registration' | 'login' | 'password_reset';
    deviceInfo?: {
        ipAddress?: string;
        userAgent?: string;
        device?: object;
    };
}

export class VerifyOtpUseCase {
    constructor(
        private userRepository: UserRepository,
        private otpRepository: OtpRepository,
        private tokenRepository: TokenRepository
    ) { }

    async execute(input: VerifyOtpInput): Promise<AuthenticatedUser> {
        const purpose = input.purpose.toUpperCase() as OtpPurpose;

        const result = await this.otpRepository.verify(input.contact, input.otp, purpose);

        if (!result.valid) {
            throw new AppError(result.error!, this.getErrorMessage(result.error!), 400);
        }

        // Get user
        const contactType = AuthService.identifyContactType(input.contact);
        const user = contactType === 'email'
            ? await this.userRepository.findByEmail(input.contact)
            : await this.userRepository.findByPhone(input.contact);

        if (!user) {
            throw new AppError('USER_NOT_FOUND', 'User not found', 404);
        }

        // Mark as verified
        if (contactType === 'email') {
            await this.userRepository.markEmailVerified(user.id);
        } else {
            await this.userRepository.markPhoneVerified(user.id);
        }

        // Generate tokens
        const tokens = AuthService.generateTokens(user.id, user.role);

        // Store refresh token
        await this.tokenRepository.storeRefreshToken(user.id, tokens.refreshToken, input.deviceInfo);

        // Get updated user
        const updatedUser = await this.userRepository.findById(user.id);

        return {
            user: updatedUser!,
            tokens,
        };
    }

    private getErrorMessage(code: string): string {
        switch (code) {
            case 'OTP_EXPIRED': return 'OTP has expired';
            case 'MAX_ATTEMPTS': return 'Too many attempts';
            case 'INVALID_OTP': return 'Invalid OTP';
            default: return 'Verification failed';
        }
    }
}

export class RefreshTokenUseCase {
    constructor(
        private userRepository: UserRepository,
        private tokenRepository: TokenRepository
    ) { }

    async execute(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
        const result = await this.tokenRepository.validateRefreshToken(refreshToken);

        if (!result.valid || !result.userId) {
            throw new AppError('INVALID_TOKEN', 'Invalid or expired refresh token', 401);
        }

        const user = await this.userRepository.findById(result.userId);
        if (!user) {
            throw new AppError('USER_NOT_FOUND', 'User not found', 404);
        }

        // Revoke old token
        await this.tokenRepository.revokeToken(refreshToken, 'refreshed');

        // Generate new tokens
        const tokens = AuthService.generateTokens(user.id, user.role);

        // Store new refresh token
        await this.tokenRepository.storeRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }
}

export class LogoutUseCase {
    constructor(private tokenRepository: TokenRepository) { }

    async execute(userId: string, refreshToken?: string, allDevices: boolean = false): Promise<{ devicesLoggedOut: number }> {
        let count = 0;

        if (allDevices) {
            count = await this.tokenRepository.revokeAllUserTokens(userId, 'logout');
        } else if (refreshToken) {
            await this.tokenRepository.revokeToken(refreshToken, 'logout');
            count = 1;
        }

        return { devicesLoggedOut: count };
    }
}

// Custom error class
export class AppError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = 'AppError';
    }
}
