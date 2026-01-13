
// Native fetch in Node 20

async function testFetch(trechos) {
    console.log(`Testing: "${trechos}"`);

    // Split "Sl 1, João 1..." -> take first part "Sl 1"
    const parts = trechos.split(',');
    const firstRef = parts[0].trim(); // "Sl 119:1-24" or "Sl 1"

    // Split book and chapter/verse
    // Logic: Look for the last space. "Sl 1" -> "Sl", "1"
    const lastSpaceIndex = firstRef.lastIndexOf(' ');
    const bookAbbrev = firstRef.substring(0, lastSpaceIndex).trim();
    const chapter = firstRef.substring(lastSpaceIndex + 1).trim();

    console.log(`Parsed -> Book: "${bookAbbrev}", Chapter/Verse: "${chapter}"`);

    // bible-api.com expects ENGLISH book names for query, e.g. "Psalms+1"
    // We need to map our PT abbreviations to EN names
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
        '1 Cr': '1 Chronicles',
        '2 Cr': '2 Chronicles',
        'Ed': 'Ezra',
        'Ne': 'Nehemiah',
        'Et': 'Esther',
        'Jó': 'Job',
        'Sl': 'Psalms', 'Salmos': 'Psalms', 'Salmo': 'Psalms',
        'Pv': 'Proverbs', 'Provérbios': 'Proverbs',
        'Ec': 'Ecclesiastes', 'Eclesiastes': 'Ecclesiastes',
        'Ct': 'Song of Songs',
        'Is': 'Isaiah', 'Isaías': 'Isaiah',
        'Jr': 'Jeremiah',
        'Lm': 'Lamentations',
        'Ez': 'Ezekiel',
        'Dn': 'Daniel',
        'Os': 'Hosea',
        'Jl': 'Joel',
        'Am': 'Amos',
        'Ob': 'Obadiah',
        'Jn': 'Jonah', 'Jonas': 'Jonah',
        'Mq': 'Micah', 'Miqueias': 'Micah',
        'Na': 'Nahum',
        'Hc': 'Habakkuk',
        'Sf': 'Zephaniah',
        'Ag': 'Haggai',
        'Zc': 'Zechariah',
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

    const englishBook = bookMap[bookAbbrev] || 'Genesis';
    console.log(`Mapped to EN: "${englishBook}"`);

    // Construct URL for bible-api.com
    // e.g. https://bible-api.com/Psalms+1?translation=almeida
    const query = `${englishBook} ${chapter}`;
    const url = `https://bible-api.com/${encodeURIComponent(query)}?translation=almeida`;

    console.log(`Fetching URL: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);

        if (!response.ok) {
            console.log('Error Body:', await response.text());
        } else {
            const data = await response.json();
            if (data.text) {
                console.log(`Success! Found text.`);
                console.log(`Snippet: ${data.text.substring(0, 100).replace(/\n/g, ' ')}...`);
            } else {
                console.log('No text found in response.');
            }
        }
    } catch (e) {
        console.error('Fetch Failed:', e);
    }
    console.log('---');
}

// Test cases
testFetch('Sl 1, João 1, Efésios 1');
testFetch('Sl 119:1-24, Tito 3, 3 João 1'); 
