
// Map of Portuguese Bible books to English and Spanish
export const bibleBooksMap: Record<string, { en: string; es: string }> = {
    'Gênesis': { en: 'Genesis', es: 'Génesis' },
    'Êxodo': { en: 'Exodus', es: 'Éxodo' },
    'Levítico': { en: 'Leviticus', es: 'Levítico' },
    'Números': { en: 'Numbers', es: 'Números' },
    'Deuteronômio': { en: 'Deuteronomy', es: 'Deuteronomio' },
    'Josué': { en: 'Joshua', es: 'Josué' },
    'Juízes': { en: 'Judges', es: 'Jueces' },
    'Rute': { en: 'Ruth', es: 'Rut' },
    '1 Samuel': { en: '1 Samuel', es: '1 Samuel' },
    '2 Samuel': { en: '2 Samuel', es: '2 Samuel' },
    '1 Reis': { en: '1 Kings', es: '1 Reyes' },
    '2 Reis': { en: '2 Kings', es: '2 Reyes' },
    '1 Crônicas': { en: '1 Chronicles', es: '1 Crónicas' },
    '2 Crônicas': { en: '2 Chronicles', es: '2 Crónicas' },
    'Esdras': { en: 'Ezra', es: 'Esdras' },
    'Neemias': { en: 'Nehemiah', es: 'Nehemías' },
    'Ester': { en: 'Esther', es: 'Ester' },
    'Jó': { en: 'Job', es: 'Job' },
    'Salmos': { en: 'Psalms', es: 'Salmos' },
    'Sl': { en: 'Ps', es: 'Sal' },
    'Provérbios': { en: 'Proverbs', es: 'Proverbios' },
    'Eclesiastes': { en: 'Ecclesiastes', es: 'Eclesiastés' },
    'Cânticos': { en: 'Song of Solomon', es: 'Cantares' },
    'Isaías': { en: 'Isaiah', es: 'Isaías' },
    'Jeremias': { en: 'Jeremiah', es: 'Jeremías' },
    'Lamentações': { en: 'Lamentations', es: 'Lamentaciones' },
    'Ezequiel': { en: 'Ezekiel', es: 'Ezequiel' },
    'Daniel': { en: 'Daniel', es: 'Daniel' },
    'Oseias': { en: 'Hosea', es: 'Oseas' },
    'Joel': { en: 'Joel', es: 'Joel' },
    'Amós': { en: 'Amos', es: 'Amós' },
    'Obadias': { en: 'Obadiah', es: 'Abdías' },
    'Jonas': { en: 'Jonah', es: 'Jonás' },
    'Miqueias': { en: 'Micah', es: 'Miqueas' },
    'Naum': { en: 'Nahum', es: 'Nahúm' },
    'Habacuque': { en: 'Habakkuk', es: 'Habacuc' },
    'Sofonias': { en: 'Zephaniah', es: 'Sofonías' },
    'Ageu': { en: 'Haggai', es: 'Hageo' },
    'Zacarias': { en: 'Zechariah', es: 'Zacarías' },
    'Malaquias': { en: 'Malachi', es: 'Malaquías' },
    'Mateus': { en: 'Matthew', es: 'Mateo' },
    'Marcos': { en: 'Mark', es: 'Marcos' },
    'Lucas': { en: 'Luke', es: 'Lucas' },
    'João': { en: 'John', es: 'Juan' },
    'Atos': { en: 'Acts', es: 'Hechos' },
    'Romanos': { en: 'Romans', es: 'Romanos' },
    '1 Coríntios': { en: '1 Corinthians', es: '1 Corintios' },
    '2 Coríntios': { en: '2 Corinthians', es: '2 Corintios' },
    'Gálatas': { en: 'Galatians', es: 'Gálatas' },
    'Efésios': { en: 'Ephesians', es: 'Efesios' },
    'Filipenses': { en: 'Philippians', es: 'Filipenses' },
    'Colossenses': { en: 'Colossians', es: 'Colosenses' },
    '1 Tessalonicenses': { en: '1 Thessalonians', es: '1 Tesalonicenses' },
    '2 Tessalonicenses': { en: '2 Thessalonians', es: '2 Tesalonicenses' },
    '1 Timóteo': { en: '1 Timothy', es: '1 Timoteo' },
    '2 Timóteo': { en: '2 Timothy', es: '2 Timoteo' },
    'Tito': { en: 'Titus', es: 'Tito' },
    'Filemom': { en: 'Philemon', es: 'Filemón' },
    'Hebreus': { en: 'Hebrews', es: 'Hebreos' },
    'Tiago': { en: 'James', es: 'Santiago' },
    '1 Pedro': { en: '1 Peter', es: '1 Pedro' },
    '2 Pedro': { en: '2 Peter', es: '2 Pedro' },
    '1 João': { en: '1 John', es: '1 Juan' },
    '2 João': { en: '2 John', es: '2 Juan' },
    '3 João': { en: '3 John', es: '3 Juan' },
    'Judas': { en: 'Jude', es: 'Judas' },
    'Apocalipse': { en: 'Revelation', es: 'Apocalipsis' }
};

export function translateBibleRef(reference: string, language: 'pt-BR' | 'pt-PT' | 'es' | 'en'): string {
    if (language === 'pt-BR' || language === 'pt-PT') return reference;

    let translated = reference;
    const langKey = language === 'es' ? 'es' : 'en';

    // Sort keys by length desc to avoid partial matches (e.g. replacing "João" inside "1 João")
    const keys = Object.keys(bibleBooksMap).sort((a, b) => b.length - a.length);

    for (const key of keys) {
        if (translated.includes(key)) {
            // Use regex to replace whole words or specific patterns if needed, but simple replace works for most
            translated = translated.replace(key, bibleBooksMap[key][langKey]);
        }
    }
    return translated;
}
