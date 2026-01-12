import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import api from '../services/api';

interface ReadingPlan {
    id: number;
    trechosBiblicos: string;
    reflexao: string;
    lido: boolean;
}

export default function ReadingPlanScreen() {
    const [plans, setPlans] = useState<ReadingPlan[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    async function loadData() {
        try {
            setRefreshing(true);
            const response = await api.get('/leitura');
            setPlans(response.data);
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

    async function toggleReadStatus(id: number) {
        try {
            const response = await api.post(`/leitura/${id}/concluir`);
            // Update local state to reflect change immediately (optimistic update or re-fetch)
            // Here we use the response to be sure
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

    const renderItem = ({ item }: { item: ReadingPlan }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                style={[styles.card, item.lido && styles.cardRead]}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.dayText}>Leitura #{item.id}</Text>
                        <Text style={[styles.title, item.lido && styles.textRead]}>{item.trechosBiblicos}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleReadStatus(item.id)}>
                        <View style={[styles.checkbox, item.lido && styles.checkboxChecked]}>
                            {item.lido && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                </View>

                {isExpanded && (
                    <View style={styles.content}>
                        <Text style={styles.reflectionLabel}>Reflexão:</Text>
                        <Text style={styles.reflectionText}>{item.reflexao}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Plano de Leitura</Text>
            <FlatList
                data={plans}
                keyExtractor={item => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
                ListEmptyComponent={<Text style={styles.empty}>Nenhum plano cadastrado.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    screenTitle: { fontSize: 24, fontWeight: 'bold', margin: 20, marginBottom: 10 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
    cardRead: { backgroundColor: '#e8f5e9' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dayText: { fontSize: 12, color: '#666', textTransform: 'uppercase', marginBottom: 4 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    textRead: { textDecorationLine: 'line-through', color: '#888' },
    checkbox: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
    checkmark: { color: '#fff', fontWeight: 'bold' },
    content: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
    reflectionLabel: { fontWeight: 'bold', marginBottom: 4, color: '#555' },
    reflectionText: { color: '#444', lineHeight: 22 },
    empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});
