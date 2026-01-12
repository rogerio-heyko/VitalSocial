import { Request, Response } from 'express';
import { PrismaClient, TipoAtividade } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ActivityController {
    async criar(req: Request, res: Response) {
        const { id } = req.user;
        const { titulo, tipo, dataHora } = req.body;

        // Verificar se usuário é STAFF ou ADMIN
        const usuario = await prisma.usuario.findUnique({ where: { id } });

        if (!usuario || (usuario.tipo !== 'STAFF' && usuario.tipo !== 'ADMIN')) {
            throw new AppError('Permissão negada. Apenas Staff/Admin podem criar atividades.', 403);
        }

        if (!titulo || !tipo || !dataHora) {
            throw new AppError('Título, tipo e data/hora são obrigatórios.');
        }

        if (!Object.values(TipoAtividade).includes(tipo)) {
            throw new AppError(`Tipo inválido. Tipos permitidos: ${Object.values(TipoAtividade).join(', ')}`);
        }

        const atividade = await prisma.atividade.create({
            data: {
                titulo,
                tipo,
                dataHora: new Date(dataHora),
                professorResponsavelId: id, // Quem criou assume como responsável inicialmente (pode ser alterado dps se implementarmos)
            },
        });

        return res.status(201).json(atividade);
    }

    async listar(req: Request, res: Response) {
        // Filtros opcionais podem ser adicionados aqui via query params
        const atividades = await prisma.atividade.findMany({
            include: {
                professor: {
                    select: { nome: true, email: true }
                },
                _count: {
                    select: { inscricoes: true }
                }
            },
            orderBy: { dataHora: 'asc' }
        });

        return res.json(atividades);
    }

    async inscrever(req: Request, res: Response) {
        const { id: usuarioId } = req.user;
        const { id: atividadeId } = req.params;

        const atividade = await prisma.atividade.findUnique({ where: { id: atividadeId } });

        if (!atividade) {
            throw new AppError('Atividade não encontrada.', 404);
        }

        // Verifica se já está inscrito
        const inscricaoExistente = await prisma.inscricao.findFirst({
            where: {
                alunoId: usuarioId,
                atividadeId: atividadeId
            }
        });

        if (inscricaoExistente) {
            throw new AppError('Você já está inscrito nesta atividade.');
        }

        const inscricao = await prisma.inscricao.create({
            data: {
                alunoId: usuarioId,
                atividadeId
            }
        });

        return res.status(201).json(inscricao);
    }

    async minhasInscricoes(req: Request, res: Response) {
        const { id } = req.user;

        const inscricoes = await prisma.inscricao.findMany({
            where: { alunoId: id },
            include: {
                atividade: {
                    include: {
                        professor: {
                            select: { nome: true }
                        }
                    }
                }
            }
        });

        return res.json(inscricoes);
    }
}
