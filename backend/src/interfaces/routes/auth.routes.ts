import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import {
    RegisterUseCase,
    LoginUseCase,
    VerifyOtpUseCase,
    RefreshTokenUseCase,
    LogoutUseCase
} from '../../application/usecases';
import {
    UserRepository,
    OtpRepository,
    TokenRepository
} from '../../infrastructure/repositories';
import { EmailService } from '../../infrastructure/services/EmailService';

const router = Router();

// Initialize repositories and use cases
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const tokenRepository = new TokenRepository();

const registerUseCase = new RegisterUseCase(userRepository, otpRepository);
const loginUseCase = new LoginUseCase(userRepository, tokenRepository);
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpRepository, tokenRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenRepository);
const logoutUseCase = new LogoutUseCase(tokenRepository);

/**
 * POST /auth/register
 * Register a new user
 */
router.post(
    '/register',
    validate([
        body('fullName').trim().notEmpty().withMessage('Full name is required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
        body('email').optional().isEmail().withMessage('Invalid email format'),
        body('phone').optional().isMobilePhone('any').withMessage('Invalid phone format'),
        body('role').optional().isIn(['MEMBER', 'PROVIDER']).withMessage('Invalid role'),
    ]),
    async (req, res, next) => {
        try {
            const result = await registerUseCase.execute(req.body);
            res.status(201).json({
                success: true,
                data: result,
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /auth/verify-otp
 * Verify OTP for registration/login
 */
router.post(
    '/verify-otp',
    validate([
        body('contact').notEmpty().withMessage('Contact is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        body('purpose').isIn(['registration', 'login', 'password_reset']).withMessage('Invalid purpose'),
    ]),
    async (req, res, next) => {
        try {
            const result = await verifyOtpUseCase.execute({
                ...req.body,
                deviceInfo: {
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
            res.json({
                success: true,
                data: {
                    verified: true,
                    accessToken: result.tokens.accessToken,
                    refreshToken: result.tokens.refreshToken,
                    expiresIn: result.tokens.expiresIn,
                    user: formatUserResponse(result.user),
                },
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /auth/send-otp
 * Send or resend OTP
 */
router.post(
    '/send-otp',
    validate([
        body('contact').notEmpty().withMessage('Contact is required'),
        body('purpose').isIn(['registration', 'login', 'password_reset']).withMessage('Invalid purpose'),
    ]),
    async (req, res, next) => {
        try {
            const { contact, purpose } = req.body;
            const canResend = await otpRepository.canResend(contact, purpose.toUpperCase());

            if (!canResend.canResend) {
                return res.status(429).json({
                    success: false,
                    error: {
                        code: 'RATE_LIMITED',
                        message: 'Please wait before requesting a new OTP',
                        retryAfter: canResend.retryAfter,
                    },
                });
            }

            const otp = await otpRepository.create(contact, purpose.toUpperCase());

            // Send OTP via email if contact is email
            if (contact.includes('@')) {
                await EmailService.sendOtp(contact, otp, purpose.toUpperCase());
            } else {
                // TODO: Send via SMS
                console.log(`[DEV] OTP for ${contact}: ${otp}`);
            }

            res.json({
                success: true,
                data: {
                    sent: true,
                    channel: contact.includes('@') ? 'email' : 'phone',
                    expiresIn: 300,
                    retryAfter: 30,
                },
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /auth/login
 * Login with credentials
 */
router.post(
    '/login',
    validate([
        body('identifier').notEmpty().withMessage('Email or phone is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ]),
    async (req, res, next) => {
        try {
            const result = await loginUseCase.execute({
                ...req.body,
                deviceInfo: {
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
            res.json({
                success: true,
                data: {
                    accessToken: result.tokens.accessToken,
                    refreshToken: result.tokens.refreshToken,
                    expiresIn: result.tokens.expiresIn,
                    user: formatUserResponse(result.user),
                },
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post(
    '/refresh',
    validate([
        body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    ]),
    async (req, res, next) => {
        try {
            const result = await refreshTokenUseCase.execute(req.body.refreshToken);
            res.json({
                success: true,
                data: result,
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /auth/logout
 * Logout user
 */
router.post(
    '/logout',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const result = await logoutUseCase.execute(
                req.userId!,
                req.body.refreshToken,
                req.body.allDevices
            );
            res.json({
                success: true,
                data: { loggedOut: true, ...result },
                meta: {
                    requestId: req.headers['x-request-id'] || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// Helper function to format user response
function formatUserResponse(user: any) {
    return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profile: user.profile ? {
            fullName: user.profile.fullName,
            displayName: user.profile.displayName,
            avatarUrl: user.profile.avatarUrl,
            isComplete: !!(user.profile.fullName && user.profile.gotra),
        } : null,
    };
}

export default router;
