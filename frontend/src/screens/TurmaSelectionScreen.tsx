import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import api from '../services/api';
import GradientHeader from '../components/GradientHeader';
import { colors } from '../theme/colors';

interface Turma {
    id: string;
    nome: string;
    diasHorarios: string;
    vagasTotais: number;
    _count?: { inscricoes: number };
}

export default function TurmaSelectionScreen({ route, navigation }: any) {
    const { activityId, activityTitle } = route.params;
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTurmas();
    }, []);

    async function loadTurmas() {
        try {
            const response = await api.get(`/turmas/atividade/${activityId}`);
            setTurmas(response.data);
            if (response.data.length === 1) {
                // Se só tem uma turma, já deixa selecionada
                setSelectedTurmaId(response.data[0].id);
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar turmas disponíveis.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm() {
        if (!selectedTurmaId && turmas.length > 0) {
            Alert.alert('Atenção', 'Selecione uma turma para continuar.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/atividades/${activityId}/inscrever`, { turmaId: selectedTurmaId });
            Alert.alert('Sucesso', 'Inscrição realizada!');
            navigation.navigate('MainTabs', { screen: 'Home' }); // Voltar e forçar reload ou usar goBack
        } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.mensagem || 'Falha ao se inscrever.');
        } finally {
            setSubmitting(false);
        }
    }

    const renderTurmaItem = ({ item }: { item: Turma }) => {
        const vagasDisponiveis = item.vagasTotais > 0 ? item.vagasTotais - (item._count?.inscricoes || 0) : 'Ilimitado';
        const isSelected = selectedTurmaId === item.id;
        
        return (
            <TouchableOpacity 
                style={[styles.turmaCard, isSelected && styles.turmaCardSelected]}
                onPress={() => setSelectedTurmaId(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.turmaHeader}>
                    <Text style={[styles.turmaName, isSelected && styles.textSelected]}>{item.nome}</Text>
                    <View style={styles.radioButton}>
                        {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                </View>
                <Text style={styles.turmaDetails}>{item.diasHorarios || 'Horário a definir'}</Text>
                <Text style={styles.turmaDetails}>Vagas: {vagasDisponiveis}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.pageTitle}>Escolha sua Turma</Text>
                <Text style={styles.pageSubtitle}>Atividade: {activityTitle}</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : turmas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhuma turma disponível no momento.</Text>
                        <TouchableOpacity style={styles.buttonOutline} onPress={() => navigation.goBack()}>
                            <Text style={styles.buttonOutlineText}>Voltar</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={turmas}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTurmaItem}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {turmas.length > 0 && !loading && (
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.confirmButton, !selectedTurmaId && styles.confirmButtonDisabled]} 
                        onPress={handleConfirm}
                        disabled={!selectedTurmaId || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.confirmButtonText}>Confirmar Inscrição</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // gray-100
    },
    content: {
        flex: 1,
        padding: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 24,
    },
    turmaCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    turmaCardSelected: {
        borderColor: colors.primary,
        backgroundColor: '#F0FDFA', // teal-50
    },
    turmaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    turmaName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    textSelected: {
        color: colors.primary,
    },
    turmaDetails: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    radioButton: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonInner: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 40, // Extra space for home bar
    },
    confirmButton: {
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: '#9CA3AF', // gray-400
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonOutline: {
        borderWidth: 1,
        borderColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonOutlineText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
