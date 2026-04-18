import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import { colors } from '../theme/colors';

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
    const { user, loading: authLoading } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [feed, setFeed] = useState<any[]>([]);
    const [myInscriptions, setMyInscriptions] = useState<Inscription[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [nextReading, setNextReading] = useState<any>(null);
    const [connectionError, setConnectionError] = useState(false);

    async function loadData() {
        if (authLoading) return;

        try {
            setRefreshing(true);
            setConnectionError(false);
            
            const acts = await api.get('/atividades');
            setActivities(acts.data);

            const inscs = await api.get('/atividades/minhas');
            setMyInscriptions(inscs.data);

            const feedRes = await api.get('/relatorios/feed');
            setFeed(feedRes.data);

            const planRes = await api.get('/leitura');
            const plans = planRes.data;
            let next = null;
            if (Array.isArray(plans) && plans.length > 0) {
                next = plans.find((p: any) => !p.lido) || plans[plans.length - 1];
            }
            setNextReading(next);
        } catch (error: any) {
            console.log("Error loading Home Data:", error);
            // Se for 401, o interceptor global vai tratar (redirecionar).
            // Só mostramos erro de conexão para falhas reais de rede.
            if (error.response?.status !== 401) {
                setConnectionError(true);
            }
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!authLoading) {
            loadData();
        }
    }, [authLoading]);

    async function handleSubscribe(activityId: string) {
        try {
            await api.post(`/atividades/${activityId}/inscrever`);
            Alert.alert('Sucesso', 'Inscrição realizada!');
            loadData();
        } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.mensagem || 'Falha ao se inscrever.');
        }
    }

    const isEnrolled = useCallback((actId: string) => myInscriptions.some(ins => ins.atividade.id === actId), [myInscriptions]);

    const renderMyInscriptionItem = useCallback(({ item }: { item: Inscription }) => (
        <View style={{ width: 280, marginRight: 16 }}>
            <ActivityCard
                title={item.atividade.titulo}
                type={item.atividade.tipo}
                date={item.atividade.dataHora}
                isEnrolled={true}
                onPress={() => { }}
            />
        </View>
    ), []);

    const renderActivityItem = useCallback(({ item }: { item: Activity }) => (
        <View style={{ width: 280, marginRight: 16 }}>
            <ActivityCard
                title={item.titulo}
                type={item.tipo}
                date={item.dataHora}
                isEnrolled={isEnrolled(item.id)}
                onPress={() => isEnrolled(item.id) ? {} : handleSubscribe(item.id)}
            />
        </View>
    ), [isEnrolled]);

    const renderFeedItem = useCallback(({ item }: { item: any }) => (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden mx-8">
            <View className="p-4 flex-row items-center border-b border-gray-100">
                <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-3">
                    <Text className="font-bold text-teal-700">{item.professor.charAt(0)}</Text>
                </View>
                <View>
                    <Text className="font-bold text-gray-900">{item.professor}</Text>
                    <Text className="text-xs text-teal-600 font-bold">{item.projeto}</Text>
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

            {item.videoUrl && (
                <View className="w-full h-80 bg-black">
                    <Video
                        source={{ uri: item.videoUrl }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        className="w-full h-full"
                    />
                </View>
            )}

            <View className="p-4">
                <Text className="text-gray-800 leading-6">{item.descricao}</Text>
            </View>
        </View>
    ), []);

    const ListHeader = () => (
        <View style={{ paddingHorizontal: 32 }}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greeting}>{t('hello')}, {user?.nome?.split(' ')[0]}</Text>
                    <Text style={styles.subtitle}>{t('welcome')}</Text>
                </View>
            </View>

            {connectionError && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>Você está offline ou ocorreu um erro de conexão.</Text>
                    <TouchableOpacity onPress={loadData} style={styles.retryButton}>
                        <Text style={styles.retryText}>Tentar Novamente</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={styles.readingWidgetContainer}
                onPress={() => navigation.navigate('Reading')}
                activeOpacity={0.9}
            >
                <View style={[styles.readingWidget, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.sectionTitleWhite}>📖 {t('todaysReading')}</Text>
                    <Text style={styles.readingText}>
                        {nextReading
                            ? `${t('day')} ${nextReading.dia}: ${translateBibleRef(nextReading.trechosBiblicos, language)}`
                            : (!loading && !refreshing) ? t('noPlanFound') : `${t('loading')}...`
                        }
                    </Text>
                    <Text style={styles.readingSub}>{t('tapToRead')}</Text>
                </View>
            </TouchableOpacity>

            {myInscriptions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('myInscriptions')}</Text>
                    <FlatList
                        horizontal
                        data={myInscriptions}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        renderItem={renderMyInscriptionItem}
                        removeClippedSubviews={true}
                        initialNumToRender={2}
                    />
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('nextActivities')}</Text>
                <FlatList
                    horizontal
                    data={activities}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderActivityItem}
                    removeClippedSubviews={true}
                    initialNumToRender={2}
                    ListEmptyComponent={<Text style={styles.emptyText}>{t('noActivities')}</Text>}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Acontecendo Agora</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white pt-16">
            <FlatList
                data={feed}
                keyExtractor={item => item.id.toString()}
                renderItem={renderFeedItem}
                ListHeaderComponent={ListHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary} />}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={5}
                ListEmptyComponent={
                    !loading && feed.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhuma postagem recente.</Text>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
    subtitle: { fontSize: 16, color: '#666' },
    section: { marginTop: 20 },
    sectionHeader: { marginTop: 32, marginBottom: 12 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
    sectionTitleWhite: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#fff' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
    readingWidgetContainer: { marginTop: 10, borderRadius: 16, overflow: 'hidden' },
    readingWidget: { padding: 24, borderRadius: 16 },
    readingText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
    readingSub: { color: '#fff', opacity: 0.9, fontSize: 14, marginTop: 4 },
    errorBanner: { backgroundColor: colors.error + '20', padding: 16, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
    errorText: { color: colors.error, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    retryButton: { backgroundColor: colors.error, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    retryText: { color: '#fff', fontWeight: 'bold' }
});
