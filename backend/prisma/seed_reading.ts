import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bibleBooks = [
    "Mundo e Origens (Gênesis 1-11)",
    "Os Patriarcas (Gênesis 12-50)",
    "O Êxodo (Êxodo 1-15)",
    "A Lei e o Tabernáculo (Êxodo 16-40)",
    "Santidade e Ofertas (Levítico)",
    "No Deserto (Números)",
    "Últimos discursos de Moisés (Deuteronômio)",
    "A Conquista (Josué)",
    "Tempo dos Juízes (Juízes)",
    "Rute e início da Monarquia (Rute, 1 Samuel 1-7)",
    "Reinado de Saul e Davi (1 Samuel 8-31)",
    "Davi Rei (2 Samuel)",
    "Salomão e a Divisão (1 Reis)",
    "Reis de Israel e Judá (2 Reis)",
    "Crônicas de Judá (1 e 2 Crônicas)",
    "O Retorno e a Reconstrução (Esdras e Neemias)",
    "A Rainha Ester (Ester)",
    "A Sabedoria de Jó (Jó)",
    "Cânticos de Adoração (Salmos)",
    "Sabedoria Prática (Provérbios)",
    "O Sentido da Vida (Eclesiastes, Cânticos)",
    "Profecias e Esperança (Isaías)",
    "O Profeta Chorão (Jeremias e Lamentações)",
    "Visões no Exílio (Ezequiel)",
    "Fidelidade na Babilônia (Daniel)",
    "Profetas Menores (Oseias a Malaquias)",
    "O Nascimento e Início (Mateus 1-4)",
    "Sermão do Monte (Mateus 5-7)",
    "Milagres de Jesus (Marcos)",
    "Parábolas do Reino (Lucas)",
    "Eu Sou (João)",
    "O Início da Igreja (Atos 1-12)",
    "Viagens de Paulo (Atos 13-28)",
    "A Graça de Deus (Romanos)",
    "A Vida na Igreja (1 e 2 Coríntios)",
    "A Liberdade em Cristo (Gálatas a Colossenses)",
    "Cartas aos Pastores (Tessalonicenses a Filemom)",
    "A Superioridade de Cristo (Hebreus)",
    "A Fé Prática (Tiago e Pedro)",
    "Amor e Verdade (João e Judas)",
    "A Revelação e Vitória (Apocalipse)"
];

async function main() {
    console.log('Iniciando o Seed do Plano Bíblico Anual...');

    const dataToInsert = [];

    // Preenchendo 365 dias
    for (let day = 1; day <= 365; day++) {
        // Lógica simples para distribuir os temas ao longo do ano
        const temaIndex = Math.floor((day - 1) * (bibleBooks.length / 365));
        const tema = bibleBooks[Math.min(temaIndex, bibleBooks.length - 1)];

        dataToInsert.push({
            dia: day,
            trechosBiblicos: `${tema} - Leitura do Dia ${day}`,
            reflexao: 'A Palavra de Deus é viva e eficaz. Reserve um momento de oração após a leitura e deixe que o Espírito Santo guie suas ações através deste aprendizado hoje.'
        });
    }

    // Inserindo na tabela PlanoLeitura (usa update/upsert ou ignore duplicate se já existir)
    // Usamos o createMany pois a tabela do cliente foi apagada com o db.
    try {
        const result = await prisma.planoLeitura.createMany({
            data: dataToInsert,
            skipDuplicates: true // Garante que não duplique se já existir dia 1, dia 2...
        });
        console.log(`\n✅ Sucesso! Foram cadastrados ${result.count} planos de leitura diários.`);
    } catch (e) {
        console.error('Erro ao preencher tabela PlanoLeitura:', e);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
