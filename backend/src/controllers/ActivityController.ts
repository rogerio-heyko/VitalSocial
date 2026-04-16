import { Request, Response } from 'express';
import { PrismaClient, TipoAtividade } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ActivityController {
    async criar(req: Request, res: Response) {
        const { id: usuarioId } = req.user;
        const { titulo, tipo, dataHora, projetoId, professorResponsavelId, endereco, fusoHorario } = req.body;

        if (!projetoId) {
            throw new AppError('O ID do projeto é obrigatório.');
        }

        // Verificar permissão
        const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
        const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } });

        if (!projeto) {
            throw new AppError('Projeto não encontrado.', 404);
        }

        const isAdmin = usuario?.tipo === 'ADMIN';
        const isLiderResponsavel = usuario?.tipo === 'LIDER_SOCIAL' && projeto.responsavelId === usuarioId;

        if (!isAdmin && !isLiderResponsavel) {
            throw new AppError('Permissão negada. Você não é o Líder Social deste projeto.', 403);
        }

        if (!titulo || !tipo || !dataHora) {
            throw new AppError('Título, tipo e data/hora são obrigatórios.');
        }

        const tiposValidos = ['AULA', 'CURSO', 'EVENTO'];
        if (!tiposValidos.includes(tipo)) {
            throw new AppError(`Tipo inválido. Tipos permitidos: ${tiposValidos.join(', ')}`);
        }

        const atividade = await prisma.atividade.create({
            data: {
                titulo,
                tipo,
                dataHora: new Date(dataHora),
                endereco,
                fusoHorario: fusoHorario || 'UTC-3',
                projetoId,
                professorResponsavelId: professorResponsavelId || usuarioId,
            }
        });

        return res.status(201).json(atividade);
    }

    async listar(req: Request, res: Response) {
        const atividades = await prisma.atividade.findMany({
            include: {
                professor: {
                    select: { nome: true, email: true, id: true }
                },
                projeto: {
                    select: { nome: true }
                },
                _count: {
                    select: { inscricoes: true }
                }
            },
            orderBy: { dataHora: 'asc' }
        });

        return res.json(atividades);
    }

    async atualizar(req: Request, res: Response) {
        const { id: usuarioId } = req.user;
        const { id: atividadeId } = req.params;
        const { titulo, tipo, dataHora, professorResponsavelId, endereco, fusoHorario } = req.body;

        const atividade = await prisma.atividade.findUnique({
            where: { id: atividadeId },
            include: { projeto: true }
        });

        if (!atividade) {
            throw new AppError('Atividade não encontrada.', 404);
        }

        // Verificar permissão
        const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
        const isAdmin = usuario?.tipo === 'ADMIN';
        const isLiderResponsavel = usuario?.tipo === 'LIDER_SOCIAL' && atividade.projeto?.responsavelId === usuarioId;

        if (!isAdmin && !isLiderResponsavel) {
            throw new AppError('Permissão negada para editar esta atividade.', 403);
        }

        const updated = await prisma.atividade.update({
            where: { id: atividadeId },
            data: {
                titulo,
                tipo,
                dataHora: dataHora ? new Date(dataHora) : undefined,
                professorResponsavelId,
                endereco,
                fusoHorario
            }
        });

        return res.json(updated);
    }

    async excluir(req: Request, res: Response) {
        const { id: usuarioId } = req.user;
        const { id: atividadeId } = req.params;

        const atividade = await prisma.atividade.findUnique({
            where: { id: atividadeId },
            include: { projeto: true }
        });

        if (!atividade) {
            throw new AppError('Atividade não encontrada.', 404);
        }

        // Verificar permissão
        const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
        const isAdmin = usuario?.tipo === 'ADMIN';
        const isLiderResponsavel = usuario?.tipo === 'LIDER_SOCIAL' && atividade.projeto?.responsavelId === usuarioId;

        if (!isAdmin && !isLiderResponsavel) {
            throw new AppError('Permissão negada para excluir esta atividade.', 403);
        }

        // Deletar dependências (opcional, dependendo se há turmas ou inscrições)
        // Aqui vamos apenas deletar a atividade. Se o Prisma tiver restrição de FK, ele vai avisar.
        await prisma.atividade.delete({ where: { id: atividadeId } });

        return res.status(204).send();
    }

    async listarPorProjeto(req: Request, res: Response) {
        const { projetoId } = req.params;

        const atividades = await prisma.atividade.findMany({
            where: { projetoId },
            include: {
                professor: {
                    select: { nome: true, email: true, id: true }
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

        // Check availability in classes
        const turmas = await prisma.turma.findMany({
            where: { atividadeId },
            include: { _count: { select: { inscricoes: { where: { status: 'CONFIRMADA' } } } } }
        });

        let status: 'CONFIRMADA' | 'RESERVA' = 'RESERVA';
        
        // If there are classes, check if any has space
        if (turmas.length > 0) {
            const temVaga = turmas.some(t => t.vagasTotais === 0 || t._count.inscricoes < t.vagasTotais);
            if (temVaga) {
                status = 'CONFIRMADA';
            }
        }

        const inscricao = await prisma.inscricao.create({
            data: {
                alunoId: usuarioId,
                atividadeId,
                status
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
