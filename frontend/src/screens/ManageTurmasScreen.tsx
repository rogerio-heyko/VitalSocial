import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface Turma {
    id: string;
    nome: string; // "Turma A"
    diasHorarios: string; // "Seg 14:00"
    vagasTotais: number;
    professores: { id: string; nome: string }[];
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
    const [professoresIds, setProfessoresIds] = useState<string[]>([]);
    const [vagasTotais, setVagasTotais] = useState('0');

    // Modal
    const [showProfessoresSelect, setShowProfessoresSelect] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

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
        setProfessoresIds([]);
        setVagasTotais('0');
        setEditingId(null);
        setModalVisible(true);
    }

    async function handleDelete(id: string) {
        Alert.alert(
            "Excluir",
            "Deseja realmente excluir esta turma?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir", style: "destructive", onPress: async () => {
                        try {
                            await api.delete(`/turmas/${id}`);
                            Alert.alert("Sucesso", "Turma excluída.");
                            loadTurmas();
                        } catch (error: any) {
                            const msg = error.response?.data?.message || "Falha ao excluir.";
                            Alert.alert("Erro", msg);
                        }
                    }
                }
            ]
        );
    }

    function openEditModal(item: Turma) {
        setNome(item.nome);
        setDiasHorarios(item.diasHorarios);
        setVagasTotais(String(item.vagasTotais || 0));
        // Map professors array to IDs
        const pIds = item.professores ? item.professores.map((p: any) => p.id) : [];
        setProfessoresIds(pIds);
        setEditingId(item.id);
        setModalVisible(true);
    }

    async function handleSave() {
        if (!nome) {
            Alert.alert("Atenção", "Nome da turma é obrigatório.");
            return;
        }

        try {
            const payload = {
                nome,
                diasHorarios,
                atividadeId: activityId,
                professoresIds,
                vagasTotais: parseInt(vagasTotais) || 0
            };

            if (editingId) {
                await api.put(`/turmas/${editingId}`, payload);
                Alert.alert("Sucesso", "Turma atualizada!");
            } else {
                await api.post('/turmas', payload);
                Alert.alert("Sucesso", "Turma criada!");
            }
            setModalVisible(false);
            setEditingId(null);
            loadTurmas();
        } catch (error) {
            Alert.alert("Erro", "Falha ao salvar turma.");
        }
    }

    const getProfessoresNames = () => {
        if (professoresIds.length === 0) return "Nenhum selecionado";
        const names = allUsers.filter(u => professoresIds.includes(u.id)).map(u => u.nome);
        return names.join(', ');
    };

    function toggleProfessor(id: string) {
        if (professoresIds.includes(id)) {
            setProfessoresIds(professoresIds.filter(pid => pid !== id));
        } else {
            setProfessoresIds([...professoresIds, id]);
        }
    }

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View>
                <Text style={styles.cardTitle}>{item.nome}</Text>
                <Text style={styles.cardSubtitle}>{item.diasHorarios}</Text>
                <Text style={styles.cardVagas}>Capacidade: {item.vagasTotais === 0 ? 'Ilimitada' : `${item.vagasTotais} vagas`}</Text>
                {item.professores && item.professores.length > 0 && (
                    <Text style={styles.cardProf}>Profs: {item.professores.map((p: any) => p.nome).join(', ')}</Text>
                )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardSubs}>{item._count ? item._count.inscricoes : 0} alunos</Text>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.editBtn, { marginRight: 10 }]} onPress={() => openEditModal(item)}>
                        <Ionicons name="create-outline" size={20} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
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

            <TouchableOpacity style={styles.fab} onPress={() => { setEditingId(null); openModal(); }}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{editingId ? 'Editar Turma' : 'Nova Turma'}</Text>

                    <Text style={styles.label}>Nome da Turma</Text>
                    <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Turma A - Manhã" />

                    <Text style={styles.label}>Dias/Horários (Opcional)</Text>
                    <TextInput style={styles.input} value={diasHorarios} onChangeText={setDiasHorarios} placeholder="Ex: Seg/Qua 10:00" />

                    <Text style={styles.label}>Capacidade (Vagas)</Text>
                    <TextInput style={styles.input} value={vagasTotais} onChangeText={setVagasTotais} keyboardType="numeric" placeholder="0 = Ilimitada" />

                    <Text style={styles.label}>Professores Responsáveis</Text>
                    <TouchableOpacity style={styles.selector} onPress={() => setShowProfessoresSelect(true)}>
                        <Text style={{ color: professoresIds.length > 0 ? '#000' : '#888' }}>{getProfessoresNames()}</Text>
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

                {/* Professors Multi Select */}
                <Modal visible={showProfessoresSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione Professores</Text>
                        <ScrollView>
                            {allUsers.map(u => (
                                <TouchableOpacity key={u.id} style={styles.userItem} onPress={() => toggleProfessor(u.id)}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <View>
                                            <Text style={styles.userName}>{u.nome}</Text>
                                            <Text style={styles.userRole}>{u.tipo}</Text>
                                        </View>
                                        {professoresIds.includes(u.id) && <Ionicons name="checkmark-circle" size={24} color="green" />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={[styles.btn, styles.btnSave, { marginTop: 20 }]} onPress={() => setShowProfessoresSelect(false)}>
                            <Text style={styles.btnText}>Concluir</Text>
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
    userRole: { fontSize: 12, color: '#4a90e2' },

    actionButtons: { flexDirection: 'row', marginTop: 10 },
    editBtn: { backgroundColor: '#ff9800', padding: 8, borderRadius: 5, justifyContent: 'center' },
    deleteBtn: { backgroundColor: '#f44336', padding: 8, borderRadius: 5, justifyContent: 'center' }
});
