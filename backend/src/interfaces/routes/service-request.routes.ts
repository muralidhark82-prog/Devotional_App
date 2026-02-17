import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import {
    CreateServiceRequestUseCase,
    AcceptServiceRequestUseCase,
    CompleteServiceRequestUseCase,
    GetServiceRequestsUseCase,
} from '../../application/usecases';
import {
    ServiceRequestRepository,
    NotificationRepository,
    UserRepository,
} from '../../infrastructure/repositories';

const router = Router();

const serviceRequestRepo = new ServiceRequestRepository();
const notificationRepo = new NotificationRepository();
const userRepo = new UserRepository();

const createUseCase = new CreateServiceRequestUseCase(serviceRequestRepo, notificationRepo, userRepo);
const acceptUseCase = new AcceptServiceRequestUseCase(serviceRequestRepo, notificationRepo, userRepo);
const completeUseCase = new CompleteServiceRequestUseCase(serviceRequestRepo, notificationRepo);
const getUseCase = new GetServiceRequestsUseCase(serviceRequestRepo);

/**
 * POST /service-requests
 * Member creates a service request (notifies all providers)
 */
router.post(
    '/',
    authenticate,
    authorize('MEMBER'),
    validate([
        body('serviceType').isIn(['HomamYagam', 'HomePooja', 'PoojaSamagri', 'FamilyConnect']).withMessage('Invalid service type'),
        body('date').notEmpty().withMessage('Date is required'),
        body('time').notEmpty().withMessage('Time is required'),
        body('location').optional().isString(),
        body('notes').optional().isString(),
    ]),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const result = await createUseCase.execute({
                memberId: req.userId!,
                ...req.body,
            });
            res.status(201).json({
                success: true,
                data: result,
                meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /service-requests
 */
router.get(
    '/',
    authenticate,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const requests = req.userRole === 'PROVIDER'
                ? await getUseCase.forProvider(req.userId!)
                : await getUseCase.forMember(req.userId!);

            res.json({
                success: true,
                data: requests,
                meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /service-requests/:id/accept
 */
router.post(
    '/:id/accept',
    authenticate,
    authorize('PROVIDER'),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const result = await acceptUseCase.execute(req.params.id, req.userId!);
            res.json({
                success: true,
                data: result,
                meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /service-requests/:id/complete
 */
router.post(
    '/:id/complete',
    authenticate,
    authorize('PROVIDER'),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const result = await completeUseCase.execute(req.params.id, req.userId!);
            res.json({
                success: true,
                data: result,
                meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
