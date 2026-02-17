import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { authRoutes, userRoutes, householdRoutes, inviteRoutes, serviceRequestRoutes, notificationRoutes } from './interfaces/routes';
import { errorHandler, notFoundHandler } from './interfaces/middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
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

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
