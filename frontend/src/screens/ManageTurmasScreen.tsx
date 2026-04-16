import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface Turma {
    id: string;
    nome: string; // "Turma A"
    diasHorarios: string; // "Seg 14:00"
    vagasTotais: number;
    professor: { nome: string }; // Lead professor
    professores: { id: string, nome: string }[]; // All teachers
    _count?: { inscricoes: number };
}

interface User {
    id: string;
    nome: string;
    tipo: string;
}

export default function ManageTurmasScreen({ route, navigation }: any) {
    const { activityId, activityTitle } = route.params;
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form
    const [modalVisible, setModalVisible] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Form Data
    const [nome, setNome] = useState('');
    const [diasHorarios, setDiasHorarios] = useState('');
    const [professorId, setProfessorId] = useState(''); // Lead
    const [professorIds, setProfessorIds] = useState<string[]>([]); // All
    const [vagasTotais, setVagasTotais] = useState('0');

    const [showUserSelect, setShowUserSelect] = useState(false);

    useEffect(() => {
        loadTurmas();
        loadUsers();
    }, []);

    async function loadTurmas() {
        try {
            const response = await api.get(`/turmas/atividade/${activityId}`);
            setTurmas(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar turmas.');
        } finally {
            setLoading(false);
        }
    }

    async function loadUsers() {
        setLoadingUsers(true);
        try {
            const response = await api.get('/admin/users');
            const staff = response.data.filter((u: User) => u.tipo === 'STAFF' || u.tipo === 'ADMIN');
            setAllUsers(staff);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUsers(false);
        }
    }

    function openModal() {
        setNome('');
        setDiasHorarios('');
        setProfessorId('');
        setProfessorIds([]);
        setVagasTotais('0');
        setModalVisible(true);
    }

    async function handleSave() {
        if (!nome || !professorId) {
            Alert.alert("Atenção", "Preencha nome e professor.");
            return;
        }

        try {
            await api.post('/turmas', {
                nome,
                diasHorarios,
                atividadeId: activityId,
                professorResponsavelId: professorId,
                professorIds,
                vagasTotais: parseInt(vagasTotais) || 0
            });
            Alert.alert("Sucesso", "Turma criada!");
            setModalVisible(false);
            loadTurmas();
        } catch (error) {
            Alert.alert("Erro", "Falha ao criar turma.");
        }
    }

    const getProfessorName = () => {
        const p = allUsers.find(u => u.id === professorId);
        return p ? p.nome : "Selecione um Professor";
    };

    const renderItem = ({ item }: { item: Turma }) => (
        <View style={styles.card}>
            <View>
                <Text style={styles.cardTitle}>{item.nome}</Text>
                <Text style={styles.cardSubtitle}>{item.diasHorarios}</Text>
                <Text style={styles.cardVagas}>Capacidade: {item.vagasTotais === 0 ? 'Ilimitada' : `${item.vagasTotais} vagas`}</Text>
                <Text style={styles.cardProf}>Professores: {item.professores.map(p => p.nome).join(', ')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardSubs}>{item._count ? item._count.inscricoes : 0} alunos</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{activityTitle}</Text>
                <Text style={styles.headerSubtitle}>Gestão de Turmas</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4a90e2" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={turmas}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma turma cadastrada.</Text>}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={openModal}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Nova Turma</Text>

                    <Text style={styles.label}>Nome da Turma</Text>
                    <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Turma A - Manhã" />

                    <Text style={styles.label}>Dias/Horários (Opcional)</Text>
                    <TextInput style={styles.input} value={diasHorarios} onChangeText={setDiasHorarios} placeholder="Ex: Seg/Qua 10:00" />

                    <Text style={styles.label}>Capacidade (Vagas)</Text>
                    <TextInput style={styles.input} value={vagasTotais} onChangeText={setVagasTotais} keyboardType="numeric" placeholder="0 = Ilimitada" />

                    <Text style={styles.label}>Professores (Selecione um ou mais)</Text>
                    <TouchableOpacity style={styles.selector} onPress={() => setShowUserSelect(true)}>
                        <Text style={{ color: professorIds.length > 0 ? '#000' : '#888' }}>
                            {professorIds.length > 0 
                                ? `${professorIds.length} selecionado(s)` 
                                : "Selecione os Professores"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                            <Text style={styles.btnText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                            <Text style={styles.btnText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* User Selection Modal (Copied logic from previous screen) */}
                <Modal visible={showUserSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione o Professor</Text>
                        <ScrollView>
                            {allUsers.map(u => {
                                const isSelected = professorIds.includes(u.id);
                                return (
                                    <TouchableOpacity 
                                        key={u.id} 
                                        style={[styles.userItem, isSelected && styles.userItemActive]} 
                                        onPress={() => { 
                                            if (isSelected) {
                                                setProfessorIds(prev => prev.filter(id => id !== u.id));
                                                if (professorId === u.id) setProfessorId('');
                                            } else {
                                                setProfessorIds(prev => [...prev, u.id]);
                                                if (!professorId) setProfessorId(u.id); // Default lead to first selected
                                            }
                                        }}
                                    >
                                        <View>
                                            <Text style={styles.userName}>{u.nome}</Text>
                                            <Text style={styles.userRole}>{u.tipo} {u.id === professorId ? '(Principal)' : ''}</Text>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#5cb85c" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        <TouchableOpacity style={[styles.btn, styles.btnCancel, { marginTop: 20 }]} onPress={() => setShowUserSelect(false)}>
                            <Text style={styles.btnText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#4a90e2' },
    headerSubtitle: { fontSize: 14, color: '#666' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowOpacity: 0.1, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { color: '#666', marginTop: 2 },
    cardVagas: { fontSize: 12, color: '#4a90e2', marginTop: 2 },
    cardProf: { color: '#444', marginTop: 5, fontStyle: 'italic', fontSize: 13 },
    cardSubs: { fontSize: 12, color: '#888', fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
    fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#4a90e2', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },

    modalContainer: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 50 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontWeight: '600', marginBottom: 5, marginTop: 15, color: '#444' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, backgroundColor: '#f9f9f9', fontSize: 16 },
    selector: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, backgroundColor: '#f9f9f9' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
    btn: { flex: 0.48, padding: 15, borderRadius: 8, alignItems: 'center' },
    btnCancel: { backgroundColor: '#ccc' },
    btnSave: { backgroundColor: '#5cb85c' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    userItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    userItemActive: { backgroundColor: '#f0f9ff' },
    userName: { fontSize: 16, fontWeight: 'bold' },
    userRole: { fontSize: 12, color: '#4a90e2' }
});
