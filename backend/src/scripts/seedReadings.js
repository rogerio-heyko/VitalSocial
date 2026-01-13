const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding 365 Reading Plans (Compatible with NVI Fetcher)...');

    const readings = [];

    // Simple logic to rotate through some books to simulate a plan
    // The Frontend expects format: "Book Chapter" (e.g. "Gênesis 1")
    // It handles: Gênesis, Êxodo, Salmos, Provérbios, Mateus, Marcos, Lucas, João, Romanos...

    for (let i = 1; i <= 365; i++) {
        let ref = '';

        // Cycle through a few books for demonstration
        if (i <= 50) {
            ref = `Gênesis ${i}`; // Gn 1-50
        } else if (i <= 90) {
            ref = `Êxodo ${i - 50}`; // Ex 1-40
        } else if (i <= 240) {
            ref = `Salmos ${i - 90}`; // Sl 1-150
        } else if (i <= 271) {
            ref = `Provérbios ${i - 240}`; // Pv 1-31
        } else if (i <= 300) {
            ref = `Mateus ${i - 271}`; // Mt 1-28
        } else {
            ref = `João ${i - 300}`; // Jo 1-21 (loops a bit if needed)
        }

        readings.push({
            dia: i,
            // Format MUST be "Book Chapter" for the App to parse and fetch NVI
            trechosBiblicos: `${ref}, Leitura Complementar`,
            reflexao: `Reflexão do Dia ${i}: "A tua palavra é lâmpada que ilumina os meus passos e luz que clareia o meu caminho." (Salmos 119:105). Dedique este dia para meditar em ${ref}.`
        });
    }

    let count = 0;
    for (const r of readings) {
        await prisma.planoLeitura.upsert({
            where: { dia: r.dia },
            update: {
                trechosBiblicos: r.trechosBiblicos,
                reflexao: r.reflexao
            },
            create: r,
        });
        count++;
        if (count % 50 === 0) console.log(`... processados ${count} dias`);
    }

    console.log(`✅ ${count} Planos de Leitura (Formato NVI) inseridos/atualizados!`);
}

main()
    .catch((e) => {
        console.error('❌ Error Seeding Readings:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
