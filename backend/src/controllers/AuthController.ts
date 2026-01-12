import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class AuthController {
    async registrar(req: Request, res: Response) {
        const { nome, email, senha, tipo } = req.body;

        const usuarioExiste = await prisma.usuario.findUnique({
            where: { email },
        });

        if (usuarioExiste) {
            throw new AppError('Usuário já cadastrado com este e-mail.');
        }

        const senhaHash = await hash(senha, 8);

        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senhaHash,
                tipo: tipo || 'BENEFICIARIO', // Padrão
            },
        });

        // Remove a senha do objeto de retorno
        const { senhaHash: _, ...usuarioSemSenha } = usuario;

        return res.status(201).json({
            status: 'sucesso',
            mensagem: 'Usuário registrado com sucesso!',
            usuario: usuarioSemSenha,
        });
    }

    async login(req: Request, res: Response) {
        const { email, senha } = req.body;

        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!usuario) {
            throw new AppError('Combinação de e-mail/senha incorreta.', 401);
        }

        const senhaCorreta = await compare(senha, usuario.senhaHash);

        if (!senhaCorreta) {
            throw new AppError('Combinação de e-mail/senha incorreta.', 401);
        }

        const token = sign({}, process.env.JWT_SECRET || 'default', {
            subject: usuario.id,
            expiresIn: '1d',
        });

        const { senhaHash: _, ...usuarioSemSenha } = usuario;

        return res.json({
            status: 'sucesso',
            token,
            usuario: usuarioSemSenha,
        });
    }
}
