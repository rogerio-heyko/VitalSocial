import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../services/ConfigService';
import { PixService } from '../services/PixService';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();
const configService = new ConfigService();
const pixService = new PixService();

export class AdminConfigController {
    async listConfigs(req: Request, res: Response) {
        const configs = await configService.getAllConfigs();
        return res.json(configs);
    }

    async updateConfig(req: Request, res: Response) {
        const { chave } = req.params;
        const { valor, descricao } = req.body;
        await configService.setConfig(chave, valor, descricao);
        return res.json({ message: 'Configuração atualizada com sucesso' });
    }
}

export class DonationController {
    async createPixDonation(req: Request, res: Response) {
        const { valor, projetoId } = req.body;
        const userId = (req as any).user.id;
        const txId = `DOA${Date.now().toString().slice(-8)}`;

        try {
            let chavePix = undefined;
            if (projetoId) {
                const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } });
                if (projeto && projeto.chavePix) {
                    chavePix = projeto.chavePix;
                }
            }

            const payload = await pixService.gerarPayloadPix(Number(valor), txId, chavePix);

            const doacao = await prisma.doacao.create({
                data: {
                    usuarioId: userId,
                    projetoId: projetoId || null,
                    valor: Number(valor),
                    metodo: 'PIX',
                    moeda: 'BRL',
                    status: 'PENDENTE',
                    txId: txId
                }
            });

            return res.status(201).json({
                doacaoId: doacao.id,
                payloadPix: payload,
                qrCodeInstructions: "Copie o código e pague no app do banco."
            });
        } catch (error) {
            return res.status(400).json({ error: String(error) });
        }
    }

    async getCryptoWallets(req: Request, res: Response) {
        const { projetoId } = req.query;

        let btc, eth, usdt;

        if (projetoId) {
            const projeto = await prisma.projeto.findUnique({ where: { id: String(projetoId) } });
            if (projeto) {
                btc = projeto.walletBtc;
                eth = projeto.walletEth;
                usdt = projeto.walletUsdt;
            }
        }

        // Fallback to global config if no project or specific wallet missing
        if (!btc) btc = await configService.getConfig('WALLET_BTC');
        if (!eth) eth = await configService.getConfig('WALLET_ETH');
        if (!usdt) usdt = await configService.getConfig('WALLET_USDT');

        return res.json({
            BTC: btc || 'Não configurado',
            ETH: eth || 'Não configurado',
            USDT: usdt || 'Não configurado'
        });
    }

    async createCryptoDonation(req: Request, res: Response) {
        // 5% App Fee Logic
        const APP_WALLET_POLYGON = '0x7d944f1e5323e5AC1798D3FA82a9Ab5EbDB58eFE';

        const { valor, projetoId, carteiraDoador } = req.body;
        const userId = (req as any).user.id;
        const txId = `CRYPTO${Date.now().toString().slice(-8)}`;

        if (!valor || !projetoId || !carteiraDoador) {
            throw new AppError('Dados incompletos. Informe valor, projeto e sua carteira.', 400);
        }

        const project = await prisma.projeto.findUnique({ where: { id: projetoId } });
        if (!project || !project.walletUsdt) {
            throw new AppError('Projeto não possui carteira USDT configurada.', 400);
        }

        const amount = parseFloat(valor);
        const taxaApp = amount * 0.05;
        const valorLiquido = amount * 0.95;

        // Create Record
        const doacao = await prisma.doacao.create({
            data: {
                usuarioId: userId,
                projetoId,
                valor: amount,
                metodo: 'CRIPTO',
                moeda: 'USDT',
                status: 'PENDENTE',
                txId,
                carteiraDoador,
                taxaApp: taxaApp,
                valorLiquidoProjeto: valorLiquido
            }
        });

        // Smart Contract (Deployed by User)
        const SMART_CONTRACT_ADDRESS = '0x25F360401F888396f55E9730bCb16D9861769f58';

        return res.status(201).json({
            doacaoId: doacao.id,
            split: {
                total: amount,
                projectShare: valorLiquido,
                appShare: taxaApp
            },
            wallets: {
                destination: project.walletUsdt, // SAFE: Send 95% + 5% to Project directly for now (Manual Accounting)
                // destination: SMART_CONTRACT_ADDRESS, // UNSAFE via Deep Link (Requires Web3 Approve+Call)
                contract: SMART_CONTRACT_ADDRESS
            },
            instructions: "Neste MVP móvel, o link abre sua carteira para envio direto ao Projeto. O Contrato Inteligente (Splitter) registrado requer integração Web3 (DApp) para divisão automática.",
            deepLink: `ethereum:${project.walletUsdt}?value=${amount}` // Envia para o Projeto
        });
    }

    async getMyDonations(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const donations = await prisma.doacao.findMany({
            where: { usuarioId: userId },
            orderBy: { criadoEm: 'desc' },
            include: { projeto: true }
        });
        return res.json(donations);
    }
}
