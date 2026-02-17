import { ServiceRequestRepository } from '../../../infrastructure/repositories/ServiceRequestRepository';
import { NotificationRepository } from '../../../infrastructure/repositories/NotificationRepository';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { UserRole } from '../../../domain/entities';
import { AppError } from '../auth/AuthUseCases';
import { ServiceRequestStatus } from '@prisma/client';

const SERVICE_LABELS: Record<string, string> = {
    HomamYagam: 'Homam & Yagam',
    HomePooja: 'Home Pooja',
    PoojaSamagri: 'Pooja Samagri',
    FamilyConnect: 'Family Connect',
};

export interface CreateServiceRequestInput {
    memberId: string;
    serviceType: string;
    date: string;
    time: string;
    location?: string;
    notes?: string;
}

export class CreateServiceRequestUseCase {
    constructor(
        private repo: ServiceRequestRepository,
        private notificationRepo: NotificationRepository,
        private userRepo: UserRepository,
    ) {}

    async execute(input: CreateServiceRequestInput) {
        const request = await this.repo.create({
            memberId: input.memberId,
            serviceType: input.serviceType,
            date: new Date(input.date),
            time: input.time,
            location: input.location,
            notes: input.notes,
        });

        // Notify all active providers
        const providers = await this.userRepo.findByRole(UserRole.PROVIDER);
        const memberName = request.member?.profile?.fullName || 'A member';
        const serviceLabel = SERVICE_LABELS[input.serviceType] || input.serviceType;

        if (providers.length > 0) {
            const notifications = providers.map((p) => ({
                userId: p.id,
                title: 'New Service Request',
                message: `${memberName} requested ${serviceLabel} on ${new Date(input.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                type: 'SERVICE_REQUEST_NEW',
                referenceId: request.id,
            }));
            await this.notificationRepo.createMany(notifications);
        }

        return request;
    }
}

export class AcceptServiceRequestUseCase {
    constructor(
        private repo: ServiceRequestRepository,
        private notificationRepo: NotificationRepository,
        private userRepo: UserRepository,
    ) {}

    async execute(requestId: string, providerId: string) {
        const request = await this.repo.findById(requestId);

        if (!request) {
            throw new AppError('NOT_FOUND', 'Service request not found', 404);
        }

        if (request.status !== ServiceRequestStatus.PENDING) {
            throw new AppError('ALREADY_HANDLED', 'This service request is no longer available', 409);
        }

        const updated = await this.repo.accept(requestId, providerId);

        // Get provider name
        const provider = await this.userRepo.findById(providerId);
        const providerName = provider?.profile?.fullName || 'A provider';
        const serviceLabel = SERVICE_LABELS[request.serviceType] || request.serviceType;

        // Notify the member that their request was accepted
        await this.notificationRepo.create({
            userId: request.memberId,
            title: 'Service Request Accepted',
            message: `${providerName} accepted your ${serviceLabel} request`,
            type: 'SERVICE_REQUEST_ACCEPTED',
            referenceId: requestId,
        });

        return updated;
    }
}

export class CompleteServiceRequestUseCase {
    constructor(
        private repo: ServiceRequestRepository,
        private notificationRepo: NotificationRepository,
    ) {}

    async execute(requestId: string, providerId: string) {
        const request = await this.repo.findById(requestId);

        if (!request) {
            throw new AppError('NOT_FOUND', 'Service request not found', 404);
        }

        if (request.providerId !== providerId) {
            throw new AppError('FORBIDDEN', 'Only the assigned provider can complete this request', 403);
        }

        if (request.status !== ServiceRequestStatus.ACCEPTED) {
            throw new AppError('INVALID_STATUS', 'Only accepted requests can be completed', 400);
        }

        const result = await this.repo.complete(requestId);
        const serviceLabel = SERVICE_LABELS[request.serviceType] || request.serviceType;

        // Notify the member
        await this.notificationRepo.create({
            userId: request.memberId,
            title: 'Service Completed',
            message: `Your ${serviceLabel} service has been completed`,
            type: 'SERVICE_REQUEST_COMPLETED',
            referenceId: requestId,
        });

        return result;
    }
}

export class GetServiceRequestsUseCase {
    constructor(private repo: ServiceRequestRepository) {}

    async forMember(memberId: string) {
        return this.repo.findByMember(memberId);
    }

    async forProvider(providerId: string) {
        return this.repo.findByProvider(providerId);
    }
}
