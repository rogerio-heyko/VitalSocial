import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../services/ConfigService';
import { PixService } from '../services/PixService';

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
        const { valor } = req.body;
        const userId = (req as any).user.id;

        const txId = `DOA${Date.now().toString().slice(-8)}`;

        try {
            const payload = await pixService.gerarPayloadPix(Number(valor), txId);

            const doacao = await prisma.doacao.create({
                data: {
                    usuarioId: userId,
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
        const btc = await configService.getConfig('WALLET_BTC');
        const eth = await configService.getConfig('WALLET_ETH');
        const usdt = await configService.getConfig('WALLET_USDT');

        return res.json({
            BTC: btc || 'Não configurado',
            ETH: eth || 'Não configurado',
            USDT: usdt || 'Não configurado'
        });
    }

    async getMyDonations(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const donations = await prisma.doacao.findMany({
            where: { usuarioId: userId },
            orderBy: { criadoEm: 'desc' }
        });
        return res.json(donations);
    }
}
