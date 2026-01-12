import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class AttendanceController {
    async registrar(req: Request, res: Response) {
        const { id: usuarioLogadoId } = req.user; // Professor ou Admin
        const { inscricaoId, dataAula, presente } = req.body;

        // Verificar permissões (Apenas Staff/Admin por enquanto, ou o professor responsável - simplificando para Staff/Admin)
        const usuarioLogado = await prisma.usuario.findUnique({ where: { id: usuarioLogadoId } });
        if (!usuarioLogado || (usuarioLogado.tipo !== 'STAFF' && usuarioLogado.tipo !== 'ADMIN')) {
            // Poderíamos checar se ele é o professor da atividade da inscrição, mas vamos manter simples
            throw new AppError('Permissão negada. Apenas Staff/Admin podem registrar presença.', 403);
        }

        if (!inscricaoId || !dataAula || presente === undefined) {
            throw new AppError('Inscrição ID, data da aula e status de presença são obrigatórios.');
        }

        const inscricao = await prisma.inscricao.findUnique({ where: { id: inscricaoId } });
        if (!inscricao) {
            throw new AppError('Inscrição não encontrada.', 404);
        }

        // Identificar registro de presença existente para atualizar (Upsert logic manual ou via create se não tiver unique constraint composta na model, mas vamos assumir criação de novo registro por dia)
        // Na model Presenca não definimos @@unique([inscricaoId, dataAula]), então teoricamente pode ter duplicado.
        // Vamos verificar antes.

        const dataFormatada = new Date(dataAula);

        const presencaExistente = await prisma.presenca.findFirst({
            where: {
                inscricaoId,
                dataAula: dataFormatada
            }
        });

        if (presencaExistente) {
            // Atualizar
            const presencaAtualizada = await prisma.presenca.update({
                where: { id: presencaExistente.id },
                data: { presente }
            });
            return res.json(presencaAtualizada);
        }

        // Criar
        const novaPresenca = await prisma.presenca.create({
            data: {
                inscricaoId,
                dataAula: dataFormatada,
                presente
            }
        });

        return res.status(201).json(novaPresenca);
    }

    async listarPorInscricao(req: Request, res: Response) {
        const { inscricaoId } = req.params;
        const { id: usuarioLogadoId } = req.user;

        // Verificar se a inscrição existe
        const inscricao = await prisma.inscricao.findUnique({ where: { id: inscricaoId } });
        if (!inscricao) {
            throw new AppError('Inscrição não encontrada.', 404);
        }

        // Usuário só pode ver suas próprias presenças ou se for Admin/Staff
        const usuarioLogado = await prisma.usuario.findUnique({ where: { id: usuarioLogadoId } });

        if (inscricao.alunoId !== usuarioLogadoId && usuarioLogado?.tipo !== 'ADMIN' && usuarioLogado?.tipo !== 'STAFF') {
            throw new AppError('Permissão negada.', 403);
        }

        const presencas = await prisma.presenca.findMany({
            where: { inscricaoId },
            orderBy: { dataAula: 'desc' }
        });

        return res.json(presencas);
    }
}
