// Native fetch in Node 20


// Mock function from ReadingPlanScreen.tsx
async function testFetch(trechos) {
    console.log(`Testing: "${trechos}"`);

    const parts = trechos.split(',');
    const firstRef = parts[0].trim();
    console.log(`First Ref: "${firstRef}"`);

    const lastSpaceIndex = firstRef.lastIndexOf(' ');
    const bookName = firstRef.substring(0, lastSpaceIndex).trim();
    const chapter = firstRef.substring(lastSpaceIndex + 1).trim();

    console.log(`Parsed -> Book: "${bookName}", Chapter: "${chapter}"`);

    const bookMap = {
        'Sl': 'sl', 'Salmos': 'sl', 'Salmo': 'sl',
        'Gn': 'gn', 'Gênesis': 'gn',
        'Jo': 'jo', 'João': 'jo',
        'Ex': 'ex', 'Êxodo': 'ex',
        'Lv': 'lv', 'Levítico': 'lv',
        'Nm': 'nm', 'Números': 'nm',
        'Dt': 'dt', 'Deuteronômio': 'dt',
        'Js': 'js', 'Josué': 'js',
        'Jz': 'jz', 'Juízes': 'jz',
        'Rt': 'rt', 'Rute': 'rt',
        '1 Sm': '1sm', '1 Samuel': '1sm',
        '2 Sm': '2sm', '2 Samuel': '2sm',
        '1 Rs': '1rs', '1 Reis': '1rs',
        '2 Rs': '2rs', '2 Reis': '2rs',
        'Is': 'is', 'Isaías': 'is',
        'Ef': 'ef', 'Efésios': 'ef',
        'Fp': 'fp', 'Filipenses': 'fp',
        'Cl': 'cl', 'Colossenses': 'cl',
        '1 Jo': '1jo',
        '2 Jo': '2jo',
        '3 Jo': '3jo',
        'Jd': 'jd', 'Judas': 'jd',
        'Ap': 'ap', 'Apocalipse': 'ap',
        'Rm': 'rm', 'Romanos': 'rm',
        'Mt': 'mt', 'Mateus': 'mt',
        'Mc': 'mc', 'Marcos': 'mc',
        'Lc': 'lc', 'Lucas': 'lc',
        'At': 'at', 'Atos': 'at',
        'Hb': 'hb', 'Hebreus': 'hb',
        'Tg': 'tg', 'Tiago': 'tg',
        '1 Pe': '1pe', '1 Pedro': '1pe',
        '2 Pe': '2pe', '2 Pedro': '2pe',
        '1 Ts': '1ts', '1 Tessalonicenses': '1ts',
        '2 Ts': '2ts', '2 Tessalonicenses': '2ts',
        '1 Tm': '1tm', '1 Timóteo': '1tm',
        '2 Tm': '2tm', '2 Timóteo': '2tm',
        'Tt': 'tt', 'Tito': 'tt',
        'Fm': 'fm', 'Filemom': 'fm',
        'Gl': 'gl', 'Gálatas': 'gl',
        '1 Co': '1co', '1 Coríntios': '1co',
        '2 Co': '2co', '2 Coríntios': '2co'
    };

    const abbrev = bookMap[bookName] || 'gn';
    console.log(`Abbrev: "${abbrev}"`);

    const url = `https://www.abibliadigital.com.br/api/verses/nvi/${abbrev}/${chapter}`;
    console.log(`Fetching URL: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        console.log(`Status: ${response.status}`);
        if (!response.ok) {
            console.log('Error Body:', await response.text());
        } else {
            const data = await response.json();
            if (data.verses) {
                console.log(`Success! Got ${data.verses.length} verses.`);
                console.log(`Snippet: ${data.verses[0].text}`);
            } else {
                console.log('No verses found in response.');
            }
        }
    } catch (e) {
        console.error('Fetch Failed:', e);
    }
    console.log('---');
}

// Test cases based on Seed Data
testFetch('Sl 1, João 1, Efésios 1');       // Day 1 (Should work)
testFetch('Sl 119:1-24, Tito 3, 3 João 1'); // Day 119 (Parsing "119:1-24" might fail API?)
