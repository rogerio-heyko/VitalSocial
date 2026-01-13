import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ReadingPlanController {
    async listar(req: Request, res: Response) {
        const { id: usuarioId } = req.user;

        const planos = await prisma.planoLeitura.findMany({
            orderBy: { dia: 'asc' }, // Order by Day 1-365
            include: {
                leituras: {
                    where: { usuarioId },
                    select: { concluido: true, dataConclusao: true }
                }
            }
        });

        const planosFormatados = planos.map(plano => ({
            id: plano.id,
            dia: plano.dia,
            trechosBiblicos: plano.trechosBiblicos,
            reflexao: plano.reflexao,
            lido: plano.leituras.length > 0 && plano.leituras[0].concluido,
            dataConclusao: plano.leituras.length > 0 ? plano.leituras[0].dataConclusao : null
        }));

        return res.json(planosFormatados);
    }

    async alternarStatusLeitura(req: Request, res: Response) {
        const { id: usuarioId } = req.user;
        const { id: planoId } = req.params; // UUID String

        const plano = await prisma.planoLeitura.findUnique({ where: { id: planoId } });
        if (!plano) {
            throw new AppError('Plano de leitura não encontrado.', 404);
        }

        const leituraExistente = await prisma.leituraUsuario.findUnique({
            where: {
                usuarioId_planoLeituraId: {
                    usuarioId,
                    planoLeituraId: planoId
                }
            }
        });

        if (leituraExistente) {
            const novaConclusao = !leituraExistente.concluido;
            const leituraAtualizada = await prisma.leituraUsuario.update({
                where: { id: leituraExistente.id },
                data: {
                    concluido: novaConclusao,
                    dataConclusao: novaConclusao ? new Date() : new Date() // Keep date or reset? Usually keep last interaction
                }
            });
            return res.json({ status: novaConclusao ? 'concluido' : 'pendente', leitura: leituraAtualizada });
        } else {
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

    async criar(req: Request, res: Response) {
        // Typically seeded, but for admin usage
        const { dia, trechosBiblicos, reflexao } = req.body;
        const plano = await prisma.planoLeitura.create({
            data: { dia, trechosBiblicos, reflexao }
        });
        return res.status(201).json(plano);
    }
}
