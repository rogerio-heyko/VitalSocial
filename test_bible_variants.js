const https = require('https');

const variants = [
    'https://bible-api.com/Psalms+1?translation=almeida',
    'https://bible-api.com/Psalm+1?translation=almeida',
    'https://bible-api.com/Psalmos+1?translation=almeida',
    'https://bible-api.com/Genesis+1?translation=almeida', // Control
    'https://bible-api.com/Psalms+1?translation=arc',
    'https://bible-api.com/Psalms+1?translation=almeida-rc',
    'https://bible-api.com/Psalms+1', // Default (WEB)
];

function test(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const status = res.statusCode;
                if (status === 200) {
                    try {
                        const json = JSON.parse(data);
                        if (json.error) {
                            console.log(`[FAIL] ${url} -> API Error: ${json.error}`);
                        } else {
                            console.log(`[PASS] ${url} -> Found! Text: ${json.text.substring(0, 20)}...`);
                        }
                    } catch (e) {
                        console.log(`[FAIL] ${url} -> JSON Parse Error`);
                    }
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
