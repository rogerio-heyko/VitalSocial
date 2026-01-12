import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ConfigService {
    async getConfig(chave: string): Promise<string | null> {
        const config = await prisma.configuracao.findUnique({
            where: { chave }
        });
        return config ? config.valor : null;
    }

    async setConfig(chave: string, valor: string, descricao?: string): Promise<void> {
        await prisma.configuracao.upsert({
            where: { chave },
            update: { valor, descricao, atualizadoEm: new Date() },
            create: { chave, valor, descricao, atualizadoEm: new Date() }
        });
    }

    async getAllConfigs() {
        return await prisma.configuracao.findMany({
            orderBy: { chave: 'asc' }
        });
    }
}
