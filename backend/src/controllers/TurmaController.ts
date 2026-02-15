import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../utils/AppError';

class TurmaController {

    // Criar Turma
    async create(req: Request, res: Response) {
        const { nome, diasHorarios, atividadeId, professorResponsavelId } = req.body;

        if (!nome || !atividadeId || !professorResponsavelId) {
            throw new AppError('Nome, Atividade e Professor são obrigatórios.');
        }

        const turma = await prisma.turma.create({
            data: {
                nome,
                diasHorarios,
                atividadeId,
                professorResponsavelId
            }
        });

        return res.status(201).json(turma);
    }

    // Listar Turmas de uma Atividade
    async listByActivity(req: Request, res: Response) {
        const { atividadeId } = req.params;

        const turmas = await prisma.turma.findMany({
            where: { atividadeId },
            include: {
                professor: { select: { nome: true } },
                _count: { select: { inscricoes: true } }
            }
        });

        return res.json(turmas);
    }

    // Detalhes da Turma (com alunos)
    async getDetails(req: Request, res: Response) {
        const { id } = req.params;

        const turma = await prisma.turma.findUnique({
            where: { id },
            include: {
                professor: { select: { nome: true, id: true } },
                atividade: { select: { titulo: true } },
                inscricoes: {
                    include: {
                        aluno: { select: { id: true, nome: true, email: true } }
                    }
                }
            }
        });

        if (!turma) {
            throw new AppError('Turma não encontrada.', 404);
        }

        return res.json(turma);
    }

    // Listar Turmas do Professor (Minhas Turmas)
    async listMyClasses(req: Request, res: Response) {
        const { id } = req.user;

        const turmas = await prisma.turma.findMany({
            where: { professorResponsavelId: id },
            include: {
                atividade: { select: { titulo: true, tipo: true } },
                _count: { select: { inscricoes: true } }
            }
        });

        return res.json(turmas);
    }

    // Matricular Aluno na Turma (Manual pelo Admin ou Professor)
    async addStudent(req: Request, res: Response) {
        const { id } = req.params; // Turma ID
        const { alunoId } = req.body;

        // Check if Inscricao exists for this activity
        const turma = await prisma.turma.findUnique({ where: { id } });
        if (!turma) throw new AppError('Turma não encontrada.', 404);

        // Check if subscription exists
        let inscricao = await prisma.inscricao.findFirst({
            where: {
                alunoId,
                atividadeId: turma.atividadeId
            }
        });

        if (inscricao) {
            // Update existing subscription to this Turma
            inscricao = await prisma.inscricao.update({
                where: { id: inscricao.id },
                data: { turmaId: id }
            });
        } else {
            // Create new subscription
            inscricao = await prisma.inscricao.create({
                data: {
                    alunoId,
                    atividadeId: turma.atividadeId,
                    turmaId: id
                }
            });
        }

        return res.json(inscricao);
    }

    // Atualizar Turma
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { nome, diasHorarios, professorResponsavelId } = req.body;

        const turma = await prisma.turma.findUnique({ where: { id } });
        if (!turma) {
            throw new AppError('Turma não encontrada.', 404);
        }

        const data: any = {};
        if (nome) data.nome = nome;
        if (diasHorarios) data.diasHorarios = diasHorarios;
        if (professorResponsavelId) data.professorResponsavelId = professorResponsavelId;

        const updated = await prisma.turma.update({
            where: { id },
            data
        });

        return res.json(updated);
    }

    // Excluir Turma
    async delete(req: Request, res: Response) {
        const { id } = req.params;

        const turma = await prisma.turma.findUnique({ where: { id } });
        if (!turma) {
            throw new AppError('Turma não encontrada.', 404);
        }

        try {
            await prisma.turma.delete({ where: { id } });
        } catch (error) {
            throw new AppError('Não é possível excluir turma com alunos ou relatórios associados.', 400);
        }

        return res.status(204).send();
    }
}

export default new TurmaController();
