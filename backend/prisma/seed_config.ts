import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const configs = [
        { chave: 'PIX_KEY', valor: '', descricao: 'Chave CPF/Email/Phone/Aleatoria' },
        { chave: 'WALLET_BTC', valor: '', descricao: 'Endereço Bitcoin' },
        { chave: 'WALLET_ETH', valor: '', descricao: 'Endereço Ethereum' },
        { chave: 'WALLET_USDT', valor: '', descricao: 'Endereço USDT (Polygon/ERC20)' },
    ];

    for (const config of configs) {
        await prisma.configuracao.upsert({
            where: { chave: config.chave },
            update: {},
            create: config,
        });
    }
    console.log('Configs seeded!');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
