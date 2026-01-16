import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, ScrollView, ActivityIndicator, Platform } from 'react-native';
import api from '../services/api';
// Using fetch directly for external API or creating a new service method
import { Ionicons } from '@expo/vector-icons';

interface ReadingPlan {
    id: string; // UUID
    dia: number;
    trechosBiblicos: string;
    reflexao: string;
    lido: boolean;
}



import { useLanguage } from '../contexts/LanguageContext';
import { translateBibleRef } from '../utils/bibleTranslator';

export default function ReadingPlanScreen() {
    const { t, language } = useLanguage();
    const [plans, setPlans] = useState<ReadingPlan[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const flatListRef = React.useRef<FlatList>(null);

    // Reading Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [readingContent, setReadingContent] = useState<string | null>(null);
    const [loadingReading, setLoadingReading] = useState(false);
    const [currentReadingTitle, setCurrentReadingTitle] = useState('');

    async function loadData() {
        try {
            setRefreshing(true);
            const response = await api.get('/leitura');
            setPlans(response.data);

            // Optional: Auto-scroll to today
            // const dayOfYear = getDayOfYear();
            // const index = response.data.findIndex(p => p.dia === dayOfYear);
            // if (index !== -1 && flatListRef.current) {
            //    setTimeout(() => flatListRef.current?.scrollToIndex({ index, animated: true }), 500);
            // }
        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Não foi possível carregar o plano de leitura.');
        } finally {
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function toggleReadStatus(id: string) {
        try {
            const response = await api.post(`/leitura/${id}/concluir`);
            const updatedStatus = response.data.status === 'concluido';

            setPlans(currentPlans =>
                currentPlans.map(plan =>
                    plan.id === id ? { ...plan, lido: updatedStatus } : plan
                )
            );
        } catch (error) {
            Alert.alert('Erro', 'Falha ao atualizar status.');
        }
    }

    async function openReading(trechos: string) {
        setModalVisible(true);
        setLoadingReading(true);
        setCurrentReadingTitle(trechos);
        setReadingContent(null);

        try {
            // "Sl 1, João 1, Efésios 1"
            const parts = trechos.split(',');

            let fullText = '';

            for (const part of parts) {
                const ref = part.trim();
                if (!ref) continue;

                // Basic parsing: "Book Chapter"
                // Handle "1 Samuel 1" vs "João 1"
                // Logic: split by space. Last element is chapter. Rest is book.
                const refParts = ref.split(' ');
                const chapter = refParts.pop(); // Last one
                const bookName = refParts.join(' '); // The rest

                // Map PT references to English for bible-api.com
                const bookMap: Record<string, string> = {
                    // Old Testament
                    'Gn': 'Gênesis', 'Gênesis': 'Gênesis',
                    'Ex': 'Êxodo', 'Êxodo': 'Êxodo',
                    'Lv': 'Levítico', 'Levítico': 'Levítico',
                    'Nm': 'Números', 'Números': 'Números',
                    'Dt': 'Deuteronômio', 'Deuteronômio': 'Deuteronômio',
                    'Js': 'Josué', 'Josué': 'Josué',
                    'Jz': 'Juízes', 'Juízes': 'Juízes',
                    'Rt': 'Rute', 'Rute': 'Rute',
                    '1 Sm': '1 Samuel', '1 Samuel': '1 Samuel',
                    '2 Sm': '2 Samuel', '2 Samuel': '2 Samuel',
                    '1 Rs': '1 Reis', '1 Reis': '1 Reis',
                    '2 Rs': '2 Reis', '2 Reis': '2 Reis',
                    '1 Cr': '1 Crônicas', '1 Crônicas': '1 Crônicas',
                    '2 Cr': '2 Crônicas', '2 Crônicas': '2 Crônicas',
                    'Ed': 'Esdras', 'Esdras': 'Esdras',
                    'Ne': 'Neemias', 'Neemias': 'Neemias',
                    'Et': 'Ester', 'Ester': 'Ester',
                    'Jó': 'Jó',
                    'Sl': 'Salmos', 'Salmos': 'Salmos', 'Salmo': 'Salmos',
                    'Pv': 'Provérbios', 'Provérbios': 'Provérbios',
                    'Ec': 'Eclesiastes', 'Eclesiastes': 'Eclesiastes',
                    'Ct': 'Cânticos', 'Cânticos': 'Cânticos',
                    'Is': 'Isaías', 'Isaías': 'Isaías',
                    'Jr': 'Jeremias', 'Jeremias': 'Jeremias',
                    'Lm': 'Lamentações', 'Lamentações': 'Lamentações',
                    'Ez': 'Ezequiel', 'Ezequiel': 'Ezequiel',
                    'Dn': 'Daniel',
                    'Os': 'Oseias', 'Oseias': 'Oseias',
                    'Jl': 'Joel',
                    'Am': 'Amós', 'Amós': 'Amós',
                    'Ob': 'Obadias', 'Obadias': 'Obadias',
                    'Jn': 'Jonas', 'Jonas': 'Jonas',
                    'Mq': 'Miqueias', 'Miqueias': 'Miqueias',
                    'Na': 'Naum', 'Naum': 'Naum',
                    'Hc': 'Habacuque', 'Habacuque': 'Habacuque',
                    'Sf': 'Sofonias', 'Sofonias': 'Sofonias',
                    'Ag': 'Ageu', 'Ageu': 'Ageu',
                    'Zc': 'Zacarias', 'Zacarias': 'Zacarias',
                    'Ml': 'Malaquias', 'Malaquias': 'Malaquias',

                    // New Testament
                    'Mt': 'Mateus', 'Mateus': 'Mateus',
                    'Mc': 'Marcos', 'Marcos': 'Marcos',
                    'Lc': 'Lucas', 'Lucas': 'Lucas',
                    'Jo': 'João', 'João': 'João',
                    'At': 'Atos', 'Atos': 'Atos',
                    'Rm': 'Romanos', 'Romanos': 'Romanos',
                    '1 Co': '1 Coríntios', '1 Coríntios': '1 Coríntios',
                    '2 Co': '2 Coríntios', '2 Coríntios': '2 Coríntios',
                    'Gl': 'Gálatas', 'Gálatas': 'Gálatas',
                    'Ef': 'Efésios', 'Efésios': 'Efésios',
                    'Fp': 'Filipenses', 'Filipenses': 'Filipenses',
                    'Cl': 'Colossenses', 'Colossenses': 'Colossenses',
                    '1 Ts': '1 Tessalonicenses', '1 Tessalonicenses': '1 Tessalonicenses',
                    '2 Ts': '2 Tessalonicenses', '2 Tessalonicenses': '2 Tessalonicenses',
                    '1 Tm': '1 Timóteo', '1 Timóteo': '1 Timóteo',
                    '2 Tm': '2 Timóteo', '2 Timóteo': '2 Timóteo',
                    'Tt': 'Tito', 'Tito': 'Tito',
                    'Fm': 'Filemom', 'Filemom': 'Filemom',
                    'Hb': 'Hebreus', 'Hebreus': 'Hebreus',
                    'Tg': 'Tiago', 'Tiago': 'Tiago',
                    '1 Pe': '1 Pedro', '1 Pedro': '1 Pedro',
                    '2 Pe': '2 Pedro', '2 Pedro': '2 Pedro',
                    '1 Jo': '1 João', '1 João': '1 João',
                    '2 Jo': '2 João', '2 João': '2 João',
                    '3 Jo': '3 João', '3 João': '3 João',
                    'Jd': 'Judas', 'Judas': 'Judas',
                    'Ap': 'Apocalipse', 'Apocalipse': 'Apocalipse'
                };

                const englishBook = bookMap[bookName] || bookName;

                // bible-api.com URL Structure
                const query = `${englishBook} ${chapter}`;
                const url = `https://bible-api.com/${encodeURIComponent(query)}?translation=almeida`;

                console.log('Fetching Bible Text:', url);
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    if (fullText) fullText += '\n\n';
                    fullText += `--- ${ref} ---\n` + (data.text || '');
                } else {
                    if (fullText) fullText += '\n\n';
                    fullText += `--- ${ref} ---\n(Texto não encontrado)`;
                }
            }

            setReadingContent(fullText || "Texto não encontrado.");

        } catch (error) {
            console.log(error);
            setReadingContent("Não foi possível carregar o texto bíblico. (Serviço temporário Almeida)");
        } finally {
            setLoadingReading(false);
        }
    }

    const renderItem = ({ item }: { item: ReadingPlan }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.card, item.lido && styles.cardRead]}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.dayText}>{t('day')} {item.dia}</Text>
                        <Text style={[styles.title, item.lido && styles.textRead]}>
                            {translateBibleRef(item.trechosBiblicos, language)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkbox, item.lido && styles.checkboxChecked]}
                        onPress={() => toggleReadStatus(item.id)}
                    >
                        {item.lido && <Ionicons name="checkmark" size={18} color="#fff" />}
                    </TouchableOpacity>
                </View>

                {isExpanded && (
                    <View style={styles.content}>
                        <Text style={styles.reflectionLabel}>{t('reflection')}</Text>
                        <Text style={styles.reflectionText}>
                            {item.reflexao.replace(/(FASE \d+):? (.*)/i, (match, phasePart, descPart) => {
                                const phases: Record<string, string> = {
                                    'pt-BR': `FASE ${phasePart.split(' ')[1]}`,
                                    'pt-PT': `FASE ${phasePart.split(' ')[1]}`,
                                    'es': `FASE ${phasePart.split(' ')[1]}`,
                                    'en': `PHASE ${phasePart.split(' ')[1]}`
                                };

                                // Map known descriptions
                                const descriptions: Record<string, { en: string; es: string }> = {
                                    'A identidade e o Amor (João e Cartas da Graça) - Foco: Quem é Jesus e quem você é nEle.': {
                                        en: 'Identity and Love (John and Letters of Grace) - Focus: Who Jesus is and who you are in Him.',
                                        es: 'La identidad y el Amor (Juan y Cartas de la Gracia) - Enfoque: Quién es Jesús y quién eres tú en Él.'
                                    },
                                    // Fallback without dot just in case
                                    'A identidade e o Amor (João e Cartas da Graça) - Foco: Quem é Jesus e quem você é nEle': {
                                        en: 'Identity and Love (John and Letters of Grace) - Focus: Who Jesus is and who you are in Him',
                                        es: 'La identidad y el Amor (Juan y Cartas de la Gracia) - Enfoque: Quién es Jesús y quién eres tú en Él'
                                    },
                                    'Romanos e a Teologia da Salvação (Romanos e Gálatas) - Foco: Justificados pela Fé.': {
                                        en: 'Romans and the Theology of Salvation (Romans and Galatians) - Focus: Justified by Faith.',
                                        es: 'Romanos y la Teología de la Salvación (Romanos y Gálatas) - Enfoque: Justificados por la Fe.'
                                    },
                                    'A Igreja e a Missão (Atos e Epístolas Missionárias) - Foco: O Evangelho em movimento.': {
                                        en: 'The Church and the Mission (Acts and Missionary Epistles) - Focus: The Gospel in motion.',
                                        es: 'La Iglesia y la Misión (Hechos y Epístolas Misioneras) - Enfoque: El Evangelio en movimiento.'
                                    },
                                    'Sabedoria Prática e Vida Cristã (Tiago, Pedro, Hebreus) - Foco: A Fé que opera obras.': {
                                        en: 'Practical Wisdom and Christian Life (James, Peter, Hebrews) - Focus: Faith that produces works.',
                                        es: 'Sabiduría Práctica y Vida Cristiana (Santiago, Pedro, Hebreos) - Enfoque: La Fe que produce obras.'
                                    },
                                    'O Reino Prometido (Mateus e Marcos) - Foco: O Rei chegou.': {
                                        en: 'The Promised Kingdom (Matthew and Mark) - Focus: The King has arrived.',
                                        es: 'El Reino Prometido (Mateo y Marcos) - Enfoque: El Rey ha llegado.'
                                    },
                                    'O Início e a Sabedoria (Gênesis e Provérbios) - Foco: Deus como Criador. Lendo o AT com a mente renovada.': {
                                        en: 'The Beginning and Wisdom (Genesis and Proverbs) - Focus: God as Creator. Reading the OT with a renewed mind.',
                                        es: 'El Principio y la Sabiduría (Génesis y Proverbios) - Enfoque: Dios como Creador. Leyendo el AT con una mente renovada.'
                                    },
                                    'Providência e Êxodo (José e Moisés) - Foco: Deus cuida e Deus liberta.': {
                                        en: 'Providence and Exodus (Joseph and Moses) - Focus: God cares and God delivers.',
                                        es: 'Providencia y Éxodo (José y Moisés) - Enfoque: Dios cuida y Dios libera.'
                                    },
                                    'O Deserto e a Lei (Êxodo e Levítico Selecionado) - Foco: A Santidade de Deus.': {
                                        en: 'The Wilderness and the Law (Exodus and Selected Leviticus) - Focus: The Holiness of God.',
                                        es: 'El Desierto y la Ley (Éxodo y Levítico Seleccionado) - Enfoque: La Santidad de Dios.'
                                    },
                                    'A Terra Prometida e a História (Josué, Juízes, Rute) - Foco: Conquista, fracasso humano e fidelidade divina.': {
                                        en: 'The Promised Land and History (Joshua, Judges, Ruth) - Focus: Conquest, human failure, and divine faithfulness.',
                                        es: 'La Tierra Prometida y la Historia (Josué, Jueces, Rut) - Enfoque: Conquista, fracaso humano y fidelidad divina.'
                                    },
                                    'Reis e Profetas (Samuel, Davi e Isaías) - Foco: O coração de Deus e a promessa do Messias.': {
                                        en: 'Kings and Prophets (Samuel, David, and Isaiah) - Focus: The heart of God and the promise of the Messiah.',
                                        es: 'Reyes y Profetas (Samuel, David e Isaías) - Enfoque: El corazón de Dios y la promesa del Mesías.'
                                    },
                                    'Retorno aos Evangelhos (João e Revelação) - Foco: Consolidando a visão de Cristo e a Eternidade.': {
                                        en: 'Return to the Gospels (John and Revelation) - Focus: Consolidating the vision of Christ and Eternity.',
                                        es: 'Regreso a los Evangelios (Juan y Apocalipsis) - Enfoque: Consolidando la visión de Cristo y la Eternidad.'
                                    },
                                    'Aprofundamento e Conclusão (Releituras Chave) - Foco: Fixando o que mais importa nos últimos 3 meses.': {
                                        en: 'Deepening and Conclusion (Key Re-readings) - Focus: Fixing what matters most in the last 3 months.',
                                        es: 'Profundización y Conclusión (Relecturas Clave) - Enfoque: Fijando lo que más importa en los últimos 3 meses.'
                                    }
                                };

                                const langKey = language === 'es' ? 'es' : 'en';
                                const translatedDesc = (language === 'pt-BR' || language === 'pt-PT')
                                    ? descPart
                                    : (descriptions[descPart.trim()]?.[langKey] || descPart);

                                return `${phases[language] || phasePart}: ${translatedDesc}`;
                            })}
                        </Text>
                        <TouchableOpacity style={styles.readButton} onPress={() => openReading(item.trechosBiblicos)}>
                            <Ionicons name="book-outline" size={20} color="#fff" />
                            <Text style={styles.readButtonText}>{t('readExcerpt').replace('(NVI)', '(NVI)')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };



    return (
        <View className="flex-1 bg-white pt-16">
            <Text style={styles.screenTitle}>{t('readingPlanTitle')}</Text>
            <FlatList
                ref={flatListRef}
                data={plans}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 120 }} // updated padding
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
                ListEmptyComponent={<Text style={styles.empty}>{refreshing ? t('loading') : t('noPlanFound')}</Text>}
                initialNumToRender={10}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{currentReadingTitle}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20 }}>
                            {loadingReading ? (
                                <ActivityIndicator size="large" color="#00A09A" />
                            ) : (
                                <Text style={styles.bibleText}>{readingContent}</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screenTitle: { fontSize: 24, fontWeight: 'bold', margin: 20, marginBottom: 10, color: '#00A09A' },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    cardRead: { backgroundColor: '#f0fdf4' }, // Light green
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dayText: { fontSize: 14, color: '#EF5825', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    title: { fontSize: 16, fontWeight: '600', color: '#333' },
    textRead: { textDecorationLine: 'line-through', color: '#888' },
    checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#8BC441', borderColor: '#8BC441' },
    checkmark: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    content: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 },
    reflectionLabel: { fontWeight: 'bold', marginBottom: 4, color: '#555' },
    reflectionText: { color: '#666', lineHeight: 22 },
    empty: { textAlign: 'center', marginTop: 40, color: '#999' },
    readButton: {
        flexDirection: 'row',
        backgroundColor: '#00A09A',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15
    },
    readButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    modalContent: { backgroundColor: '#fff', margin: 20, borderRadius: 16, flex: 1, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#00A09A', flex: 1 },
    closeButton: { padding: 4 },
    bibleText: { fontSize: 18, lineHeight: 30, color: '#333' }
});
