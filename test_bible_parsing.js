const https = require('https');

// Simulate the bookMap from ReadingPlanScreen.tsx
const bookMap = {
    // Old Testament
    'Gn': 'Genesis', 'Gênesis': 'Genesis',
    'Ex': 'Exodus', 'Êxodo': 'Exodus',
    'Lv': 'Leviticus', 'Levítico': 'Leviticus',
    'Nm': 'Numbers', 'Números': 'Numbers',
    'Dt': 'Deuteronomy', 'Deuteronômio': 'Deuteronomy',
    'Js': 'Joshua', 'Josué': 'Joshua',
    'Jz': 'Judges', 'Juízes': 'Judges',
    'Rt': 'Ruth', 'Rute': 'Ruth',
    '1 Sm': '1 Samuel', '1 Samuel': '1 Samuel',
    '2 Sm': '2 Samuel', '2 Samuel': '2 Samuel',
    '1 Rs': '1 Kings', '1 Reis': '1 Kings',
    '2 Rs': '2 Kings', '2 Reis': '2 Kings',
    '1 Cr': '1 Chronicles', '1 Crônicas': '1 Chronicles',
    '2 Cr': '2 Chronicles', '2 Crônicas': '2 Chronicles',
    'Ed': 'Ezra', 'Esdras': 'Ezra',
    'Ne': 'Nehemiah', 'Neemias': 'Nehemiah',
    'Et': 'Esther', 'Ester': 'Esther',
    'Jó': 'Job',
    'Sl': 'Psalms', 'Salmos': 'Psalms', 'Salmo': 'Psalms',
    'Pv': 'Proverbs', 'Provérbios': 'Proverbs',
    'Ec': 'Ecclesiastes', 'Eclesiastes': 'Ecclesiastes',
    'Ct': 'Song of Songs', 'Cânticos': 'Song of Songs',
    'Is': 'Isaiah', 'Isaías': 'Isaiah',
    'Jr': 'Jeremiah', 'Jeremias': 'Jeremiah',
    'Lm': 'Lamentations', 'Lamentações': 'Lamentations',
    'Ez': 'Ezekiel', 'Ezequiel': 'Ezekiel',
    'Dn': 'Daniel',
    'Os': 'Hosea', 'Oseias': 'Hosea',
    'Jl': 'Joel',
    'Am': 'Amos',
    'Ob': 'Obadiah', 'Obadias': 'Obadiah',
    'Jn': 'Jonah', 'Jonas': 'Jonah',
    'Mq': 'Micah', 'Miqueias': 'Micah',
    'Na': 'Nahum', 'Naum': 'Nahum',
    'Hc': 'Habakkuk', 'Habacuque': 'Habakkuk',
    'Sf': 'Zephaniah', 'Sofonias': 'Zephaniah',
    'Ag': 'Haggai', 'Ageu': 'Haggai',
    'Zc': 'Zechariah', 'Zacarias': 'Zechariah',
    'Ml': 'Malachi', 'Malaquias': 'Malachi',

    // New Testament
    'Mt': 'Matthew', 'Mateus': 'Matthew',
    'Mc': 'Mark', 'Marcos': 'Mark',
    'Lc': 'Luke', 'Lucas': 'Luke',
    'Jo': 'John', 'João': 'John',
    'At': 'Acts', 'Atos': 'Acts',
    'Rm': 'Romans', 'Romanos': 'Romans',
    '1 Co': '1 Corinthians', '1 Coríntios': '1 Corinthians',
    '2 Co': '2 Corinthians', '2 Coríntios': '2 Corinthians',
    'Gl': 'Galatians', 'Gálatas': 'Galatians',
    'Ef': 'Ephesians', 'Efésios': 'Ephesians',
    'Fp': 'Philippians', 'Filipenses': 'Philippians',
    'Cl': 'Colossians', 'Colossenses': 'Colossians',
    '1 Ts': '1 Thessalonians', '1 Tessalonicenses': '1 Thessalonians',
    '2 Ts': '2 Thessalonians', '2 Tessalonicenses': '2 Thessalonians',
    '1 Tm': '1 Timothy', '1 Timóteo': '1 Timothy',
    '2 Tm': '2 Timothy', '2 Timóteo': '2 Timothy',
    'Tt': 'Titus', 'Tito': 'Titus',
    'Fm': 'Philemon', 'Filemom': 'Philemon',
    'Hb': 'Hebrews', 'Hebreus': 'Hebrews',
    'Tg': 'James', 'Tiago': 'James',
    '1 Pe': '1 Peter', '1 Pedro': '1 Peter',
    '2 Pe': '2 Peter', '2 Pedro': '2 Peter',
    '1 Jo': '1 John', '1 João': '1 John',
    '2 Jo': '2 John', '2 João': '2 John',
    '3 Jo': '3 John', '3 João': '3 John',
    'Jd': 'Jude', 'Judas': 'Jude',
    'Ap': 'Revelation', 'Apocalipse': 'Revelation'
};

const rawPlan = `
Dia 1: Sl 1, João 1, Efésios 1
Dia 15: Sl 15, João 15, 1 João 1
Dia 66: Sl 66, Atos 1, 1 Coríntios 1
Dia 137: Sl 119:25-48, Gênesis 1, Provérbios 1
Dia 394: Sl 150, João 20 e 21, 1 João 5
`; // Add more samples if needed

function parseAndVerify(line) {
    const match = line.match(/Dia (\d+): (.*)/);
    if (!match) return;

    const day = match[1];
    const trechos = match[2];

    const parts = trechos.split(',');
    const firstRef = parts[0].trim();

    const lastSpaceIndex = firstRef.lastIndexOf(' ');
    const bookName = firstRef.substring(0, lastSpaceIndex).trim();
    const chapter = firstRef.substring(lastSpaceIndex + 1).trim();

    const englishBook = bookMap[bookName] || 'ERROR_NOT_FOUND';

    if (englishBook === 'ERROR_NOT_FOUND') {
        console.error(`[FAIL] Day ${day}: Book '${bookName}' not found in map.`);
        return;
    }

    const query = `${englishBook} ${chapter}`;
    const url = `https://bible-api.com/${encodeURIComponent(query)}?translation=almeida`;

    console.log(`[OK] Day ${day}: ${firstRef} -> ${url}`);

    // Actually fetch the first one to test connectivity
    if (day === '1') {
        testFetch(url);
    }
}

function testFetch(url) {
    console.log(`Testing Fetch: ${url}`);
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode !== 200) {
                console.log(`HTTP Error: ${res.statusCode}`);
                console.log('Response:', data);
            } else {
                try {o
                    const json = JSON.parse(data);
                    if (json.text) {
                        console.log('✅ Fetch Success! Text preview:', json.text.substring(0, 50) + '...');
                    } else {
                        console.log('⚠️ Fetch returned JSON but no text:', json);
                    }
                } catch (e) {
                    console.log('JSON Parse Error:', e);
                }
            }
        });
    }).on('error', (err) => {
        console.error('Network Error:', err.message);
    });
}

const lines = rawPlan.trim().split('\n');
lines.forEach(parseAndVerify);
