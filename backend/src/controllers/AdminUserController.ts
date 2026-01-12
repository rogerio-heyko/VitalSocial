import { Request, Response } from 'express';
import { prisma } from '../server';
import { TipoUsuario } from '@prisma/client';
import { AppError } from '../errors/AppError';

class AdminUserController {

    // Lista todos os usuários, com filtro opcional por nome ou email
    async listAll(req: Request, res: Response) {
        const { search } = req.query;

        const where = search ? {
            OR: [
                { nome: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } }
            ]
        } : {};

        const usuarios = await prisma.usuario.findMany({
            where: where as any,
            select: {
                id: true,
                nome: true,
                email: true,
                tipo: true,
                cargo: true,
                dataCadastro: true
            },
            orderBy: { nome: 'asc' }
        });

        return res.json(usuarios);
    }

    // Atualiza Role e Cargo
    async updateRole(req: Request, res: Response) {
        const { userId } = req.params;
        const { tipo, cargo } = req.body;

        // Validação básica de tipo
        if (tipo && !Object.values(TipoUsuario).includes(tipo)) {
            throw new AppError('Tipo de usuário inválido.');
        }

        const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
        if (!usuario) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        const updatedUser = await prisma.usuario.update({
            where: { id: userId },
            data: {
                tipo: tipo || usuario.tipo,
                cargo: cargo // Pode ser nulo
            },
            select: {
                id: true,
                nome: true,
                tipo: true,
                cargo: true
            }
        });

        return res.json(updatedUser);
    }
}

export default new AdminUserController();
