import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { NotificationRepository } from '../../infrastructure/repositories';

const router = Router();
const notificationRepo = new NotificationRepository();

/**
 * GET /notifications
 */
router.get(
    '/',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const [notifications, unreadCount] = await Promise.all([
                notificationRepo.findByUser(req.userId!),
                notificationRepo.countUnread(req.userId!),
            ]);
            res.json({
                success: true,
                data: { notifications, unreadCount },
                meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /notifications/:id/read
 */
router.post(
    '/:id/read',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            await notificationRepo.markAsRead(req.params.id, req.userId!);
            res.json({ success: true, data: { read: true } });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /notifications/read-all
 */
router.post(
    '/read-all',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            await notificationRepo.markAllAsRead(req.userId!);
            res.json({ success: true, data: { read: true } });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
