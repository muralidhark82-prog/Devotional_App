import prisma from '../database/prisma';
import { User, UserStatus, UserRole, CreateUserData } from '../../domain/entities';
import { AuthService } from '../services/AuthService';

export class UserRepository {
    /**
     * Create a new user
     */
    async create(data: CreateUserData): Promise<User> {
        const passwordHash = await AuthService.hashPassword(data.password);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                phone: data.phone,
                passwordHash,
                role: data.role || UserRole.MEMBER,
                profile: {
                    create: {
                        fullName: data.fullName,
                    },
                },
            },
            include: {
                profile: true,
            },
        });

        return this.mapToEntity(user);
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });
        return user ? this.mapToEntity(user) : null;
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
        return user ? this.mapToEntity(user) : null;
    }

    /**
     * Find user by phone
     */
    async findByPhone(phone: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { phone },
            include: { profile: true },
        });
        return user ? this.mapToEntity(user) : null;
    }

    /**
     * Find user by email or phone
     */
    async findByIdentifier(identifier: string): Promise<(User & { passwordHash: string }) | null> {
        const contactType = AuthService.identifyContactType(identifier);

        const user = await prisma.user.findFirst({
            where: contactType === 'email'
                ? { email: identifier }
                : { phone: identifier },
            include: { profile: true },
        });

        if (!user) return null;

        return {
            ...this.mapToEntity(user),
            passwordHash: user.passwordHash || '',
        };
    }

    /**
     * Update user status
     */
    async updateStatus(id: string, status: UserStatus): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: { status },
            include: { profile: true },
        });
        return this.mapToEntity(user);
    }

    /**
     * Update email/phone verification status
     */
    async markEmailVerified(id: string): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: {
                emailVerified: true,
                status: UserStatus.ACTIVE,
            },
            include: { profile: true },
        });
        return this.mapToEntity(user);
    }

    async markPhoneVerified(id: string): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: {
                phoneVerified: true,
                status: UserStatus.ACTIVE,
            },
            include: { profile: true },
        });
        return this.mapToEntity(user);
    }

    /**
     * Update failed login attempts
     */
    async incrementFailedAttempts(id: string): Promise<{ attempts: number; lockedUntil: Date | null }> {
        const user = await prisma.user.update({
            where: { id },
            data: {
                failedLoginAttempts: { increment: 1 },
            },
        });

        // Lock account if too many attempts
        if (user.failedLoginAttempts >= 5) {
            const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            await prisma.user.update({
                where: { id },
                data: { lockedUntil },
            });
            return { attempts: user.failedLoginAttempts, lockedUntil };
        }

        return { attempts: user.failedLoginAttempts, lockedUntil: null };
    }

    /**
     * Reset failed login attempts on successful login
     */
    async resetFailedAttempts(id: string): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });
    }

    /**
     * Update password
     */
    async updatePassword(id: string, newPassword: string): Promise<void> {
        const passwordHash = await AuthService.hashPassword(newPassword);
        await prisma.user.update({
            where: { id },
            data: {
                passwordHash,
                passwordChangedAt: new Date(),
            },
        });
    }

    /**
     * Update profile
     */
    async updateProfile(userId: string, data: Partial<{
        fullName: string;
        displayName: string;
        avatarUrl: string;
        dateOfBirth: Date;
        gotra: string;
        nakshatra: string;
        rashi: string;
        languagePreference: string;
    }>): Promise<User> {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                profile: {
                    update: data,
                },
            },
            include: { profile: true },
        });
        return this.mapToEntity(user);
    }

    /**
     * Find users by role
     */
    async findByRole(role: UserRole): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: { role, status: UserStatus.ACTIVE },
            include: { profile: true },
        });
        return users.map((u: any) => this.mapToEntity(u));
    }

    /**
     * Map Prisma model to domain entity
     */
    private mapToEntity(data: any): User {
        return {
            id: data.id,
            email: data.email,
            phone: data.phone,
            emailVerified: data.emailVerified,
            phoneVerified: data.phoneVerified,
            status: data.status as UserStatus,
            role: data.role as UserRole,
            failedLoginAttempts: data.failedLoginAttempts,
            lockedUntil: data.lockedUntil,
            lastLoginAt: data.lastLoginAt,
            passwordChangedAt: data.passwordChangedAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            profile: data.profile ? {
                id: data.profile.id,
                userId: data.profile.userId,
                fullName: data.profile.fullName,
                displayName: data.profile.displayName,
                avatarUrl: data.profile.avatarUrl,
                dateOfBirth: data.profile.dateOfBirth,
                gotra: data.profile.gotra,
                nakshatra: data.profile.nakshatra,
                rashi: data.profile.rashi,
                languagePreference: data.profile.languagePreference,
            } : undefined,
        };
    }
}
