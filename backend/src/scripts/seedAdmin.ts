import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Admin User...');

    const password = await hash('@Jesus100%@13572468', 8);

    const admin = await prisma.usuario.upsert({
        where: { email: 'rogerio.heyko@gmail.com' },
        update: {
            senhaHash: password,
            nome: 'Heyko',
            tipo: 'ADMIN',
            emailVerificado: true,
        },
        create: {
            nome: 'Heyko',
            email: 'rogerio.heyko@gmail.com',
            senhaHash: password,
            tipo: 'ADMIN',
            emailVerificado: true,
            termosAceitos: true,
            dataCadastro: new Date(),
        },
    });

    console.log(`✅ Admin User Created/Updated: ${admin.email}`);
    console.log(`🔑 Password: @Jesus100%@13572468`);
}

main()
    .catch((e) => {
        console.error('❌ Error Seeding Admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
