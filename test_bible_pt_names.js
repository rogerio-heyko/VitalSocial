const https = require('https');

const variants = [
    'https://bible-api.com/Apocalipse+1?translation=almeida',
    'https://bible-api.com/Revelation+1?translation=almeida',
    'https://bible-api.com/Gênesis+1?translation=almeida', // With accent
    'https://bible-api.com/Genesis+1?translation=almeida', // Without accent
];

function test(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const status = res.statusCode;
                if (status === 200) {
                    console.log(`[PASS] ${url}`);
                } else {
                    console.log(`[FAIL] ${url} -> HTTP ${status}`);
                }
                resolve();
            });
        }).on('error', (e) => {
            console.log(`[ERR] ${url} -> ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    for (const v of variants) {
        await test(v);
    }
}

run();
