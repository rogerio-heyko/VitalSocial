import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const inscricoes = await prisma.inscricao.findMany({
        where: { turmaId: null },
        include: { aluno: true, atividade: true }
    });

    console.log(`Found ${inscricoes.length} enrollments without a turma.`);

    for (const inscricao of inscricoes) {
        const turmas = await prisma.turma.findMany({
            where: { atividadeId: inscricao.atividadeId },
            include: { _count: { select: { inscricoes: true } } }
        });

        if (turmas.length > 0) {
            const turma = turmas[0]; // Just take the first one
            await prisma.inscricao.update({
                where: { id: inscricao.id },
                data: { turmaId: turma.id }
            });
            console.log(`Assigned user ${inscricao.aluno.nome} to turma ${turma.nome} for activity ${inscricao.atividade.titulo}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
