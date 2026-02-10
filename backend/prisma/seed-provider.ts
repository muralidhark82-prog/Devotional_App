import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create Provider
    const providerEmail = 'provider@example.com';
    const providerPassword = 'password123';
    const hashedPassword = await bcrypt.hash(providerPassword, 10);

    const existingProvider = await prisma.user.findUnique({
        where: { email: providerEmail },
    });

    if (existingProvider) {
        console.log('Provider already exists');
    } else {
        const provider = await prisma.user.create({
            data: {
                email: providerEmail,
                passwordHash: hashedPassword,
                role: UserRole.PROVIDER,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                profile: {
                    create: {
                        fullName: 'Pandit Sharma',
                        languagePreference: 'en'
                    }
                }
            },
        });
        console.log('Provider created:', { email: provider.email, role: provider.role });
    }

    // Ensure member exists
    const memberEmail = 'test@example.com';
    const existingMember = await prisma.user.findUnique({
        where: { email: memberEmail },
    });

    if (!existingMember) {
        const member = await prisma.user.create({
            data: {
                email: memberEmail,
                passwordHash: hashedPassword,
                role: UserRole.MEMBER,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                profile: {
                    create: {
                        fullName: 'Test User',
                        languagePreference: 'en'
                    }
                }
            },
        });
        console.log('Member created:', { email: member.email, role: member.role });
    } else {
        console.log('Member already exists');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
