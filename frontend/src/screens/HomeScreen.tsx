import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';

interface Activity {
    id: string;
    titulo: string;
    tipo: string;
    dataHora: string;
}

interface Inscription {
    id: string;
    atividade: Activity;
}

import { useLanguage } from '../contexts/LanguageContext';
import { translateBibleRef } from '../utils/bibleTranslator';

export default function HomeScreen({ navigation }: any) {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [feed, setFeed] = useState<any[]>([]);
    const [myInscriptions, setMyInscriptions] = useState<Inscription[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [nextReading, setNextReading] = useState<any>(null);

    async function loadData() {
        try {
            setRefreshing(true);
            // Load all activities
            const acts = await api.get('/atividades');
            setActivities(acts.data);

            // Load my inscriptions
            const inscs = await api.get('/atividades/minhas');
            setMyInscriptions(inscs.data);

            // Load Social Feed
            const feedRes = await api.get('/relatorios/feed');
            setFeed(feedRes.data);

            // Load reading plan to find next unread
            const planRes = await api.get('/leitura');
            const plans = planRes.data;
            const next = plans.find((p: any) => !p.lido) || plans[plans.length - 1];
            setNextReading(next);
        } catch (error) {
            console.log(error);
            // Silently fail or show simple toast
        } finally {
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleSubscribe(activityId: string) {
        try {
            await api.post(`/atividades/${activityId}/inscrever`);
            Alert.alert('Sucesso', 'Inscrição realizada!');
            loadData();
        } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.mensagem || 'Falha ao se inscrever.');
        }
    }

    // Helper check
    const isEnrolled = (actId: string) => myInscriptions.some(ins => ins.atividade.id === actId);

    // Import LinearGradient here or use NativeWind class
    // Since we are inside the component, we can use <LinearGradient> in the return

    return (
        <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ paddingBottom: 100 }} // Extra padding for bottom tab
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        >
            <View className="pt-6 px-8 pb-4 bg-white">
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>{t('hello')}, {user?.nome?.split(' ')[0]}</Text>
                        <Text style={styles.subtitle}>{t('welcome')}</Text>
                    </View>
                </View>
            </View>

            {/* Leitura do Dia Widget - Now with Brand Gradient */}
            {/* Leitura do Dia Widget - Now with Brand Gradient */}
            <TouchableOpacity
                style={styles.readingWidgetContainer}
                onPress={() => navigation.navigate('Reading')} // Navigation fix
                activeOpacity={0.9}
            >
                <View style={[styles.readingWidget, { backgroundColor: '#EF5825' }]}>
                    <Text style={styles.sectionTitleWhite}>📖 {t('todaysReading')}</Text>
                    <Text style={styles.readingText}>


                        {nextReading
                            ? `${t('day')} ${nextReading.dia}: ${translateBibleRef(nextReading.trechosBiblicos, language)}`
                            : `${t('loading')}...`
                        }
                    </Text>
                    <Text style={styles.readingSub}>{t('tapToRead')}</Text>
                </View>
            </TouchableOpacity>

            {/* Minhas Inscrições */}
            {myInscriptions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('myInscriptions')}</Text>
                    <FlatList
                        horizontal
                        data={myInscriptions}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={{ width: 280 }}>
                                <ActivityCard
                                    title={item.atividade.titulo}
                                    type={item.atividade.tipo}
                                    date={item.atividade.dataHora}
                                    isEnrolled={true}
                                    onPress={() => { }}
                                />
                            </View>
                        )}
                    />
                </View>
            )}

            {/* Feed de Atividades */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('nextActivities')}</Text>
                {activities.map(act => (
                    <ActivityCard
                        key={act.id}
                        title={act.titulo}
                        type={act.tipo}
                        date={act.dataHora}
                        isEnrolled={isEnrolled(act.id)}
                        onPress={() => isEnrolled(act.id) ? {} : handleSubscribe(act.id)}
                    />
                ))}
                {activities.length === 0 && <Text style={styles.emptyText}>{t('noActivities')}</Text>}
            </View>

            {/* Social Feed Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Feed da Comunidade</Text>
                {feed.map(item => (
                    <View key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                        <View className="p-4 flex-row items-center border-b border-gray-100">
                            <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-3">
                                <Text className="font-bold text-teal-700">{item.professor.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text className="font-bold text-gray-900">{item.professor}</Text>
                                <Text className="text-xs text-gray-500">{new Date(item.data).toLocaleDateString()} • {item.titulo}</Text>
                            </View>
                        </View>

                        {item.fotoUrl && (
                            <Image
                                source={{ uri: item.fotoUrl }}
                                className="w-full h-64 bg-gray-200"
                                resizeMode="cover"
                            />
                        )}

                        <View className="p-4">
                            <Text className="text-gray-800 leading-6">{item.descricao}</Text>
                        </View>
                    </View>
                ))}
                {feed.length === 0 && <Text style={styles.emptyText}>Nenhuma postagem recente.</Text>}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#00A09A' }, // Brand Teal
    subtitle: { fontSize: 16, color: '#666' },
    section: { marginTop: 20, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#00A09A' },
    sectionTitleWhite: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#fff' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
    readingWidgetContainer: { marginHorizontal: 20, marginTop: 10, borderRadius: 16, overflow: 'hidden' },
    readingWidget: {
        padding: 24,
        borderRadius: 16,
        // Gradient fallback color
        backgroundColor: '#EF5825',
    },
    readingText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
    readingSub: { color: '#fff', opacity: 0.9, fontSize: 14, marginTop: 4 }
});
