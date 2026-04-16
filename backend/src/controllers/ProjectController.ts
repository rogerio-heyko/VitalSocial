import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../utils/AppError';

class ProjectController {

    // Criar Projeto (Admin)
    async create(req: Request, res: Response) {
        const { nome, descricao, instituicao, chavePix, responsavelId, walletBtc, walletEth, walletUsdt } = req.body;

        if (!nome) {
            throw new AppError('O nome do projeto é obrigatório.');
        }

        const projeto = await prisma.projeto.create({
            data: {
                nome,
                descricao,
                instituicao,
                chavePix,
                responsavelId,
                walletBtc,
                walletEth,
                walletUsdt
            }
        });

        return res.status(201).json(projeto);
    }

    // Listar Projetos (Admin - Todos)
    async listAll(req: Request, res: Response) {
        const projetos = await prisma.projeto.findMany({
            include: {
                responsavel: {
                    select: { id: true, nome: true, email: true }
                }
            },
            orderBy: { criadoEm: 'desc' }
        });
        return res.json(projetos);
    }

    // Listar Projetos Públicos (Doadores - Apenas Ativos)
    async listPublic(req: Request, res: Response) {
        const projetos = await prisma.projeto.findMany({
            where: { ativo: true },
            select: {
                id: true,
                nome: true,
                descricao: true,
                instituicao: true,
                chavePix: true,
                walletBtc: true,
                walletEth: true,
                walletUsdt: true
            },
            orderBy: { nome: 'asc' }
        });
        return res.json(projetos);
    }

    // Atualizar Projeto (Admin)
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data = req.body;

        const projeto = await prisma.projeto.findUnique({ where: { id } });
        if (!projeto) {
            throw new AppError('Projeto não encontrado.', 404);
        }

        const updated = await prisma.projeto.update({
            where: { id },
            data
        });

        return res.json(updated);
    }

    // Deletar Projeto (Admin)
    async delete(req: Request, res: Response) {
        const { id } = req.params;

        const projeto = await prisma.projeto.findUnique({ where: { id } });
        if (!projeto) {
            throw new AppError('Projeto não encontrado.', 404);
        }

        // Verifica se há doações vinculadas antes de deletar (ou apenas desativa)
        const doacoes = await prisma.doacao.count({ where: { projetoId: id } });
        if (doacoes > 0) {
            throw new AppError('Não é possível excluir projetos com doações vinculadas. Desative-o em vez disso.');
        }

        await prisma.projeto.delete({ where: { id } });

        return res.status(204).send();
    }
}

export default new ProjectController();
