import { Router } from 'express';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../../infrastructure/database/prisma';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * GET /admin/users - List all users with profiles
 */
router.get('/users', async (req: AuthenticatedRequest, res, next) => {
    try {
        const { role, status, search } = req.query;
        const where: any = {};
        if (role) where.role = role;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: 'insensitive' } },
                { phone: { contains: search as string } },
                { profile: { fullName: { contains: search as string, mode: 'insensitive' } } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            include: { profile: true },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = users.map((u: any) => ({
            id: u.id,
            email: u.email,
            phone: u.phone,
            role: u.role,
            status: u.status,
            emailVerified: u.emailVerified,
            fullName: u.profile?.fullName || '',
            createdAt: u.createdAt,
            lastLoginAt: u.lastLoginAt,
        }));

        res.json({ success: true, data: { users: formatted, total: formatted.length } });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /admin/users/:id/status - Update user status (ACTIVE, SUSPENDED, etc.)
 */
router.patch('/users/:id/status', async (req: AuthenticatedRequest, res, next) => {
    try {
        const { status } = req.body;
        if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
            return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
        }
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status },
            include: { profile: true },
        });
        res.json({ success: true, data: { id: user.id, status: user.status } });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /admin/users/:id/role - Change user role
 */
router.patch('/users/:id/role', async (req: AuthenticatedRequest, res, next) => {
    try {
        const { role } = req.body;
        if (!['MEMBER', 'PROVIDER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ success: false, error: { message: 'Invalid role' } });
        }
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
        });
        res.json({ success: true, data: { id: user.id, role: user.role } });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /admin/users/:id - Delete a user
 */
router.delete('/users/:id', async (req: AuthenticatedRequest, res, next) => {
    try {
        // Don't allow deleting yourself
        if (req.params.id === req.userId) {
            return res.status(400).json({ success: false, error: { message: 'Cannot delete yourself' } });
        }
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, data: { deleted: true } });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /admin/stats - Dashboard stats
 */
router.get('/stats', async (_req: AuthenticatedRequest, res, next) => {
    try {
        const [totalUsers, members, providers, activeUsers, pendingUsers, totalRequests] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'MEMBER' } }),
            prisma.user.count({ where: { role: 'PROVIDER' } }),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({ where: { status: 'PENDING' } }),
            prisma.serviceRequest.count(),
        ]);
        res.json({
            success: true,
            data: { totalUsers, members, providers, activeUsers, pendingUsers, totalRequests },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
