import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ReadingPlanController {
    async criar(req: Request, res: Response) {
        const { id: usuarioLogadoId } = req.user;
        const { trechosBiblicos, reflexao } = req.body;

        const usuarioLogado = await prisma.usuario.findUnique({ where: { id: usuarioLogadoId } });
        if (!usuarioLogado || (usuarioLogado.tipo !== 'STAFF' && usuarioLogado.tipo !== 'ADMIN')) {
            throw new AppError('Permissão negada. Apenas Staff/Admin podem criar planos de leitura.', 403);
        }

        if (!trechosBiblicos || !reflexao) {
            throw new AppError('Trechos bíblicos e reflexão são obrigatórios.');
        }

        // Auto-increment ID handles the "day of year" or sequence roughly, allowing duplication for now as schema doesn't strictly enforce unique day (except via ID).
        // In a real app we might want 'dia' as a separate field. relying on ID for now.
        const plano = await prisma.planoLeitura.create({
            data: {
                trechosBiblicos,
                reflexao
            }
        });

        return res.status(201).json(plano);
    }

    async listar(req: Request, res: Response) {
        const { id: usuarioId } = req.user;

        const planos = await prisma.planoLeitura.findMany({
            orderBy: { id: 'asc' },
            include: {
                leituras: {
                    where: { usuarioId },
                    select: { concluido: true, dataConclusao: true }
                }
            }
        });

        // Format response to include simple 'lido' boolean
        const planosFormatados = planos.map(plano => ({
            ...plano,
            lido: plano.leituras.length > 0 && plano.leituras[0].concluido,
            dataConclusao: plano.leituras.length > 0 ? plano.leituras[0].dataConclusao : null,
            leituras: undefined // remove internal relation from response
        }));

        return res.json(planosFormatados);
    }

    async alternarStatusLeitura(req: Request, res: Response) {
        const { id: usuarioId } = req.user;
        const { id: planoIdStr } = req.params;
        const planoId = parseInt(planoIdStr);

        if (isNaN(planoId)) {
            throw new AppError('ID do plano inválido.');
        }

        const plano = await prisma.planoLeitura.findUnique({ where: { id: planoId } });
        if (!plano) {
            throw new AppError('Plano de leitura não encontrado.', 404);
        }

        // Check current status
        const leituraExistente = await prisma.leituraUsuario.findUnique({
            where: {
                usuarioId_planoLeituraId: {
                    usuarioId,
                    planoLeituraId: planoId
                }
            }
        });

        if (leituraExistente) {
            // Toggle
            const novaConclusao = !leituraExistente.concluido;
            const leituraAtualizada = await prisma.leituraUsuario.update({
                where: { id: leituraExistente.id },
                data: {
                    concluido: novaConclusao,
                    dataConclusao: novaConclusao ? new Date() : null
                }
            });
            return res.json({ status: novaConclusao ? 'concluido' : 'pendente', leitura: leituraAtualizada });
        } else {
            // Create as completed
            const novaLeitura = await prisma.leituraUsuario.create({
                data: {
                    usuarioId,
                    planoLeituraId: planoId,
                    concluido: true,
                    dataConclusao: new Date()
                }
            });
            return res.json({ status: 'concluido', leitura: novaLeitura });
        }
    }
}
