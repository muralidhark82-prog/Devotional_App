import prisma from '../database/prisma';
import { ServiceRequestStatus } from '@prisma/client';

export class ServiceRequestRepository {
    async create(data: {
        memberId: string;
        serviceType: string;
        date: Date;
        time: string;
        location?: string;
        notes?: string;
    }) {
        return prisma.serviceRequest.create({
            data: {
                memberId: data.memberId,
                serviceType: data.serviceType as any,
                date: data.date,
                time: data.time,
                location: data.location,
                notes: data.notes,
            },
            include: {
                member: {
                    include: { profile: true },
                },
            },
        });
    }

    async findById(id: string) {
        return prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                member: { include: { profile: true } },
                provider: { include: { profile: true } },
            },
        });
    }

    async findByMember(memberId: string) {
        return prisma.serviceRequest.findMany({
            where: { memberId },
            include: {
                provider: { include: { profile: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findPendingForProviders() {
        return prisma.serviceRequest.findMany({
            where: { status: ServiceRequestStatus.PENDING },
            include: {
                member: { include: { profile: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByProvider(providerId: string) {
        return prisma.serviceRequest.findMany({
            where: {
                OR: [
                    { status: ServiceRequestStatus.PENDING },
                    { providerId, status: { in: [ServiceRequestStatus.ACCEPTED, ServiceRequestStatus.COMPLETED] } },
                ],
            },
            include: {
                member: { include: { profile: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async accept(id: string, providerId: string) {
        return prisma.serviceRequest.update({
            where: { id },
            data: {
                providerId,
                status: ServiceRequestStatus.ACCEPTED,
            },
            include: {
                member: { include: { profile: true } },
                provider: { include: { profile: true } },
            },
        });
    }

    async complete(id: string) {
        return prisma.serviceRequest.update({
            where: { id },
            data: { status: ServiceRequestStatus.COMPLETED },
        });
    }

    async updateStatus(id: string, status: ServiceRequestStatus) {
        return prisma.serviceRequest.update({
            where: { id },
            data: { status },
        });
    }
}
