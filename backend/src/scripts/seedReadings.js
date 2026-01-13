const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding 365 Reading Plans...');

    // Gerar plano para 365 dias
    const readings = [];
    for (let i = 1; i <= 365; i++) {
        readings.push({
            dia: i,
            trechosBiblicos: `Leitura do Dia ${i}: Salmo ${i % 150 + 1}, Provérbios ${i % 31 + 1}`,
            reflexao: `Reflexão para o dia ${i}: A sabedoria começa com a reverência ao Senhor. Dedique este dia para buscar entendimento e paz. Deus tem um propósito para você hoje.`
        });
    }

    // Inserir usando transaction para eficiência
    // Usamos upsert um a um ou createMany se tiver certeza que ta vazio.
    // Upsert é mais seguro.

    let count = 0;
    for (const r of readings) {
        await prisma.planoLeitura.upsert({
            where: { dia: r.dia },
            update: {}, // Se já existe, não faz nada
            create: r,
        });
        count++;
        if (count % 50 === 0) console.log(`... processados ${count} dias`);
    }

    console.log(`✅ ${count} Planos de Leitura inseridos com sucesso!`);
}

main()
    .catch((e) => {
        console.error('❌ Error Seeding Readings:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
