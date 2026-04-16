import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../utils/AppError';

class AdminEnrollmentController {
    // Listar Inscrições em Espera (Reserva)
    async listWaitlist(req: Request, res: Response) {
        const { projetoId } = req.query;

        const inscricoes = await prisma.inscricao.findMany({
            where: {
                status: 'RESERVA',
                atividade: projetoId ? { projetoId: String(projetoId) } : undefined
            },
            include: {
                aluno: { select: { nome: true, email: true, telefone: true } },
                atividade: { select: { titulo: true } },
                turma: { select: { nome: true } }
            },
            orderBy: { dataInscricao: 'asc' }
        });

        return res.json(inscricoes);
    }

    // Aprovar Inscrição (Mudar para CONFIRMADA e opcionalmente alocar em Turma)
    async approve(req: Request, res: Response) {
        const { id } = req.params;
        const { turmaId } = req.body;

        const inscricao = await prisma.inscricao.findUnique({
            where: { id },
            include: { turma: true }
        });

        if (!inscricao) {
            throw new AppError('Inscrição não encontrada.', 404);
        }

        // Se uma turmaId foi passada, verificar se há vagas
        if (turmaId) {
            const turma = await prisma.turma.findUnique({
                where: { id: turmaId },
                include: { _count: { select: { inscricoes: { where: { status: 'CONFIRMADA' } } } } }
            });

            if (!turma) throw new AppError('Turma não encontrada.', 404);
            if (turma.vagasTotais > 0 && turma._count.inscricoes >= turma.vagasTotais) {
                throw new AppError('Esta turma não possui vagas disponíveis.');
            }
        }

        const updated = await prisma.inscricao.update({
            where: { id },
            data: {
                status: 'CONFIRMADA',
                turmaId: turmaId || undefined
            }
        });

        return res.json(updated);
    }
}

export default new AdminEnrollmentController();
