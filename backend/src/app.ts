import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { authRoutes, userRoutes, householdRoutes, inviteRoutes, serviceRequestRoutes, notificationRoutes, adminRoutes } from './interfaces/routes';
import { errorHandler, notFoundHandler } from './interfaces/middleware';

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests, please try again later',
        },
    },
});
app.use(limiter);

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.env !== 'test') {
    app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Request ID middleware
app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// API routes
const apiPrefix = `/api/${config.apiVersion}`;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/households`, householdRoutes);
app.use(`${apiPrefix}/invites`, inviteRoutes);
app.use(`${apiPrefix}/service-requests`, serviceRequestRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

// Admin setup endpoint (one-time, protected by secret)
app.post(`${apiPrefix}/setup-admin`, async (req, res) => {
    const { secret, email, password } = req.body;
    if (secret !== (process.env.ADMIN_SETUP_SECRET || 'swadhrama-admin-setup-2026')) {
        return res.status(403).json({ success: false, error: 'Invalid secret' });
    }
    try {
        const bcrypt = require('bcryptjs');
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const hash = await bcrypt.hash(password, 12);
        const user = await prisma.user.upsert({
            where: { email },
            update: { role: 'ADMIN', status: 'ACTIVE', emailVerified: true, passwordHash: hash },
            create: { email, passwordHash: hash, role: 'ADMIN', status: 'ACTIVE', emailVerified: true, profile: { create: { fullName: 'Admin' } } },
        });
        await prisma.$disconnect();
        res.json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
