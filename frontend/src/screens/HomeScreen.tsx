import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
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

export default function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [myInscriptions, setMyInscriptions] = useState<Inscription[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    async function loadData() {
        try {
            setRefreshing(true);
            // Load all activities
            const acts = await api.get('/atividades');
            setActivities(acts.data);

            // Load my inscriptions
            const inscs = await api.get('/atividades/minhas');
            setMyInscriptions(inscs.data);
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

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        >
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Olá, {user?.nome?.split(' ')[0]}</Text>
                        <Text style={styles.subtitle}>Bem-vindo ao Teleios</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.profileIcon}>
                            <Text style={styles.profileInitials}>{user?.nome?.charAt(0)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Leitura do Dia Widget */}
            <View style={styles.readingWidget}>
                <Text style={styles.sectionTitle}>📖 Leitura de Hoje</Text>
                <Text style={styles.readingText}>Gênesis 1-3</Text>
                <Text style={styles.readingSub}>Toque para ler e refletir</Text>
            </View>

            {/* Minhas Inscrições */}
            {myInscriptions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Minhas Inscrições</Text>
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
                <Text style={styles.sectionTitle}>Próximas Atividades</Text>
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
                {activities.length === 0 && <Text style={styles.emptyText}>Nenhuma atividade disponível.</Text>}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', paddingBottom: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    profileIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    profileInitials: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#000' },
    subtitle: { fontSize: 16, color: '#666' },
    section: { marginTop: 20, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#333' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
    readingWidget: {
        margin: 20,
        backgroundColor: '#000', // Premium dark
        padding: 20,
        borderRadius: 16,
    },
    readingText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
    readingSub: { color: '#ccc', fontSize: 14, marginTop: 4 }
});
