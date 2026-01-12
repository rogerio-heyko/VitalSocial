import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@teleios.com'; // Admin Padrão
    const senha = 'adminpassword';

    const hashedPassword = await bcrypt.hash(senha, 8);

    const user = await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: {
            nome: 'Administrador Teleios',
            email,
            senhaHash: hashedPassword,
            tipo: 'ADMIN', // Hardcoded string again, bypassing enum import issues
            // dataNascimento/telefone/endereco removidos pois não existem no schema básico
        } as any // Bypass TS error explicitly
    });

    console.log(`Admin criado: ${user.email} / senha: ${senha}`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
