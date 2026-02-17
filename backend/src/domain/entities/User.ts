// Domain Entity: User
export interface User {
    id: string;
    email: string | null;
    phone: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    status: UserStatus;
    role: UserRole;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    lastLoginAt: Date | null;
    passwordChangedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    profile?: UserProfile;
}

export interface UserProfile {
    id: string;
    userId: string;
    fullName: string;
    displayName: string | null;
    avatarUrl: string | null;
    dateOfBirth: Date | null;
    placeOfBirth: string | null;
    timeOfBirth: string | null;
    gotra: string | null;
    nakshatra: string | null;
    rashi: string | null;
    languagePreference: string;
}

export enum UserStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    DELETED = 'DELETED',
}

export enum UserRole {
    MEMBER = 'MEMBER',
    PROVIDER = 'PROVIDER',
    ADMIN = 'ADMIN',
}

// Value Objects
export interface CreateUserData {
    email?: string;
    phone?: string;
    password: string;
    fullName: string;
    role?: UserRole;
}

export interface UserCredentials {
    identifier: string; // email or phone
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthenticatedUser {
    user: User;
    tokens: TokenPair;
}
