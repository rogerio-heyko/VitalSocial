import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.usuario.findFirst({
        orderBy: { dataCadastro: 'desc' },
    });
    console.log('Último Usuário:', user?.email);
    console.log('Token de Verificação:', user?.tokenVerificacao);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
