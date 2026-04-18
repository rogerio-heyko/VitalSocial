import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const admins = [
        { email: 'admin@teleios.com', senha: 'adminpassword', nome: 'Administrador Teleios' },
        { email: 'rogerio@teleios.org.br', senha: 'Jesus100%', nome: 'Rogério (Admin)' }
    ];

    for (const admin of admins) {
        const hashedPassword = await bcrypt.hash(admin.senha, 8);

        const user = await prisma.usuario.upsert({
            where: { email: admin.email },
            update: {
                senhaHash: hashedPassword
            },
            create: {
                nome: admin.nome,
                email: admin.email,
                senhaHash: hashedPassword,
                tipo: 'ADMIN', // Hardcoded string again, bypassing enum import issues
            } as any // Bypass TS error explicitly
        });

        console.log(`Admin criado: ${user.email} / senha: ${admin.senha}`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
