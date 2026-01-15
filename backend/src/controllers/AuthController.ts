import { Request, Response } from 'express';
import { PrismaClient, TipoUsuario } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import crypto from 'crypto';
import EmailService from '../services/EmailService';

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
        const tokenVerificacao = crypto.randomBytes(3).toString('hex').toUpperCase(); // Gera token curto (ex: A1B2C3)

        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senhaHash,
                tipo: TipoUsuario.INDEFINIDO,
                tokenVerificacao,
                emailVerificado: false,
            },
        });

        // Envia e-mail de verificação em background (sem await)
        // Isso evita que o App trave se o SMTP estiver lento ou bloqueado (caso da DigitalOcean)
        EmailService.sendVerificationEmail(email, tokenVerificacao).catch(err => {
            console.error('Erro (Background) ao enviar email:', err);
        });

        // Remove senha e tokens do retorno
        const { senhaHash: _, tokenVerificacao: __, ...usuarioSemSenha } = usuario;

        return res.status(201).json({
            status: 'sucesso',
            mensagem: 'Usuário registrado. Verifique seu e-mail para confirmar a conta.',
            usuario: usuarioSemSenha,
        });
    }

    async verifyEmail(req: Request, res: Response) {
        const { email, token } = req.body;

        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!usuario) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        if (usuario.emailVerificado) {
            return res.json({ message: 'E-mail já verificado anteriormente.' });
        }

        if (usuario.tokenVerificacao !== token) {
            throw new AppError('Código de verificação inválido.', 400);
        }

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                emailVerificado: true,
                tokenVerificacao: null
            }
        });

        return res.json({ message: 'E-mail verificado com sucesso!' });
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
            // Por segurança, não informamos se o email não existe
            return res.json({ message: 'Se o e-mail existir, você receberá um código de recuperação.' });
        }

        const tokenRecuperacao = crypto.randomBytes(3).toString('hex').toUpperCase();

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { tokenRecuperacao }
        });

        // Envia e-mail de recuperação
        EmailService.sendRecoveryEmail(email, tokenRecuperacao);

        return res.json({ message: 'Se o e-mail existir, você receberá um código de recuperação.' });
    }

    async resetPassword(req: Request, res: Response) {
        const { email, token, novaSenha } = req.body;

        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario || usuario.tokenRecuperacao !== token) {
            throw new AppError('Token inválido ou expirado.', 400);
        }

        const senhaHash = await hash(novaSenha, 8);

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                senhaHash,
                tokenRecuperacao: null
            }
        });

        return res.json({ message: 'Senha alterada com sucesso!' });
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
