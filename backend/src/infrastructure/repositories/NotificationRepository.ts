import prisma from '../database/prisma';

export class NotificationRepository {
    async create(data: {
        userId: string;
        title: string;
        message: string;
        type: string;
        referenceId?: string;
    }) {
        return prisma.notification.create({ data });
    }

    async createMany(notifications: {
        userId: string;
        title: string;
        message: string;
        type: string;
        referenceId?: string;
    }[]) {
        return prisma.notification.createMany({ data: notifications });
    }

    async findByUser(userId: string) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async countUnread(userId: string) {
        return prisma.notification.count({
            where: { userId, read: false },
        });
    }

    async markAsRead(id: string, userId: string) {
        return prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
    }

    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
}
