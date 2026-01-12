import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ProfileController {
    async meuPerfil(req: Request, res: Response) {
        const { id } = req.user;

        const usuario = await prisma.usuario.findUnique({
            where: { id },
            include: {
                perfilDoador: true,
                perfilBeneficiario: true,
            },
        });

        if (!usuario) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        const { senhaHash: _, ...usuarioSemSenha } = usuario;

        return res.json(usuarioSemSenha);
    }

    async atualizarDoador(req: Request, res: Response) {
        const { id } = req.user;
        const { valorMensal, diaVencimento } = req.body;

        if (!valorMensal || !diaVencimento) {
            throw new AppError('Valor mensal e dia de vencimento são obrigatórios.');
        }

        // Upsert: Cria se não existir, atualiza se existir
        const perfil = await prisma.perfilDoador.upsert({
            where: { usuarioId: id },
            update: {
                valorMensal,
                diaVencimento,
            },
            create: {
                usuarioId: id,
                valorMensal,
                diaVencimento,
            },
        });

        // Atualiza tipo do usuário para DOADOR se ainda não for
        await prisma.usuario.update({
            where: { id },
            data: { tipo: 'DOADOR' },
        });

        return res.json(perfil);
    }

    async atualizarBeneficiario(req: Request, res: Response) {
        const { id } = req.user;
        const { dadosQuestionarioSocial } = req.body;

        if (!dadosQuestionarioSocial) {
            throw new AppError('Dados do questionário social são obrigatórios.');
        }

        const perfil = await prisma.perfilBeneficiario.upsert({
            where: { usuarioId: id },
            update: {
                dadosQuestionarioSocial,
            },
            create: {
                usuarioId: id,
                dadosQuestionarioSocial,
            },
        });

        // Atualiza tipo do usuário para BENEFICIARIO se ainda não for (e não for STAFF/ADMIN)
        const usuario = await prisma.usuario.findUnique({ where: { id } });
        if (usuario?.tipo !== 'STAFF' && usuario?.tipo !== 'ADMIN') {
            await prisma.usuario.update({
                where: { id },
                data: { tipo: 'BENEFICIARIO' }
            });
        }

        return res.json(perfil);
    }
}
