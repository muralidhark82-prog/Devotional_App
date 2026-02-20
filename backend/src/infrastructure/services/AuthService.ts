import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config';
import { TokenPair } from '../../domain/entities';

export interface JwtPayload {
    sub: string;
    role: string;
    jti: string;
    iat: number;
    exp: number;
}

export class AuthService {
    /**
     * Hash a password using bcrypt
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, config.bcryptRounds);
    }

    /**
     * Compare password with hash
     */
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Generate access and refresh token pair
     */
    static generateTokens(userId: string, role: string): TokenPair {
        const jti = crypto.randomUUID();

        const accessToken = jwt.sign(
            { sub: userId, role, jti },
            config.jwt.accessSecret,
            { expiresIn: config.jwt.accessExpiry as any }
        );

        const refreshToken = jwt.sign(
            { sub: userId, role, jti, type: 'refresh' },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiry as any }
        );

        // Parse expiry to seconds
        const expiresIn = this.parseExpiry(config.jwt.accessExpiry);

        return { accessToken, refreshToken, expiresIn };
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): JwtPayload & { type: string } {
        return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload & { type: string };
    }

    /**
     * Generate OTP code
     */
    static generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Hash OTP for storage
     */
    static hashOtp(otp: string): string {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }

    /**
     * Generate secure random token for invites
     */
    static generateInviteToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Hash token for storage
     */
    static hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Parse expiry string to seconds
     */
    private static parseExpiry(expiry: string): number {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match) return 3600;

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 3600;
        }
    }

    /**
     * Validate password complexity
     */
    static validatePassword(password: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < config.passwordMinLength) {
            errors.push(`Password must be at least ${config.passwordMinLength} characters`);
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Check if identifier is email or phone
     */
    static identifyContactType(identifier: string): 'email' | 'phone' {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(identifier) ? 'email' : 'phone';
    }
}
