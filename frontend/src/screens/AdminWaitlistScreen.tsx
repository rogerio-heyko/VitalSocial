import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface Enrollment {
    id: string;
    aluno: { nome: string; email: string; telefone: string };
    atividade: { titulo: string };
    turma?: { nome: string };
    dataInscricao: string;
}

interface Turma {
    id: string;
    nome: string;
    vagasTotais: number;
    _count: { inscricoes: number };
}

export default function AdminWaitlistScreen() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState<string | null>(null);

    // Approval Modal
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loadingTurmas, setLoadingTurmas] = useState(false);

    useEffect(() => {
        loadWaitlist();
    }, []);

    async function loadWaitlist() {
        try {
            const response = await api.get('/admin/enrollments/waitlist');
            setEnrollments(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar lista de espera.');
        } finally {
            setLoading(false);
        }
    }

    async function loadTurmas(atividadeId: string) {
        setLoadingTurmas(true);
        try {
            // We'll need a way to get activityId from enrollment.
            // Wait, the Enrollment object from backend should have activityId.
            // Correcting interface and API response if needed.
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTurmas(false);
        }
    }

    async function handleApprove(enrollmentId: string, turmaId?: string) {
        setApproving(enrollmentId);
        try {
            await api.put(`/admin/enrollments/${enrollmentId}/approve`, { turmaId });
            Alert.alert('Sucesso', 'Inscrição aprovada!');
            setSelectedEnrollment(null);
            loadWaitlist();
        } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.message || 'Falha ao aprovar.');
        } finally {
            setApproving(null);
        }
    }

    const renderItem = ({ item }: { item: Enrollment }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.aluno.nome}</Text>
                <Text style={styles.cardSubtitle}>{item.atividade.titulo}</Text>
                <Text style={styles.cardDate}>Inscrito em: {new Date(item.dataInscricao).toLocaleDateString('pt-BR')}</Text>
                <Text style={styles.cardContact}>{item.aluno.telefone || 'Sem telefone'}</Text>
            </View>
            <TouchableOpacity 
                style={styles.approveBtn} 
                onPress={() => handleApprove(item.id)}
                disabled={approving === item.id}
            >
                {approving === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.approveBtnText}>Aprovar</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cadastro de Reserva</Text>
                <Text style={styles.headerSubtitle}>Aprovação manual de vagas</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#00A09A" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={enrollments}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>Ninguém na fila de espera no momento.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', paddingTop: 60 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
    cardSubtitle: { fontSize: 14, color: '#00A09A', fontWeight: '600', marginTop: 2 },
    cardDate: { fontSize: 12, color: '#888', marginTop: 4 },
    cardContact: { fontSize: 12, color: '#666', marginTop: 2 },
    approveBtn: { backgroundColor: '#00A09A', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 10 },
    approveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, color: '#999', fontSize: 16, textAlign: 'center' }
});
