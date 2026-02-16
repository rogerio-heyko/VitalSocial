import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface Activity {
    id: string;
    titulo: string;
    tipo: 'AULA' | 'CURSO' | 'EVENTO';
    dataHora: string;
    professor: { nome: string; id?: string }; // Make id optional to avoid breaking if backend doesn't send it yet
    _count?: { inscricoes: number };
}

interface User {
    id: string;
    nome: string;
    tipo: string;
}

export default function AdminProjectActivitiesScreen({ route, navigation }: any) {
    const { projectId, projectName } = route.params;
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form
    const [modalVisible, setModalVisible] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Form Data
    const [titulo, setTitulo] = useState('');
    const [tipo, setTipo] = useState<'AULA' | 'CURSO' | 'EVENTO'>('AULA');
    const [dataHora, setDataHora] = useState(''); // Text "YYYY-MM-DD HH:mm"
    const [coordenadorId, setCoordenadorId] = useState('');
    const [professoresIds, setProfessoresIds] = useState<string[]>([]);
    const [scheduleText, setScheduleText] = useState('');

    // Selection Modals
    const [showTypeSelect, setShowTypeSelect] = useState(false);
    const [showCoordenadorSelect, setShowCoordenadorSelect] = useState(false);
    const [showProfessoresSelect, setShowProfessoresSelect] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        loadActivities();
        loadUsers();
    }, []);

    const getCoordenadorName = () => {
        const p = allUsers.find(u => u.id === coordenadorId);
        return p ? p.nome : "Selecione o Coordenador";
    };

    const getProfessoresNames = () => {
        if (professoresIds.length === 0) return "Nenhum selecionado";
        const names = allUsers.filter(u => professoresIds.includes(u.id)).map(u => u.nome);
        return names.join(', ');
    };

    async function loadActivities() {
        try {
            const response = await api.get(`/atividades/projeto/${projectId}`);
            setActivities(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao carregar atividades.');
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
            console.error("Error loading users:", error);
        } finally {
            setLoadingUsers(false);
        }
    }

    function openModal() {
        setTitulo('');
        setTipo('AULA');
        setDataHora('');
        setCoordenadorId('');
        setProfessoresIds([]);
        setScheduleText('');
        setModalVisible(true);
    }

    async function handleDelete(id: string) {
        Alert.alert(
            "Excluir",
            "Deseja realmente excluir esta atividade?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir", style: "destructive", onPress: async () => {
                        try {
                            await api.delete(`/atividades/${id}`);
                            Alert.alert("Sucesso", "Atividade excluída.");
                            loadActivities();
                        } catch (error: any) {
                            const msg = error.response?.data?.message || "Falha ao excluir.";
                            Alert.alert("Erro", msg);
                        }
                    }
                }
            ]
        );
    }

    function openEditModal(item: any) {
        setTitulo(item.titulo.split(' (')[0]);
        const match = item.titulo.match(/\(([^)]+)\)$/);
        setScheduleText(match ? match[1] : '');

        setTipo(item.tipo);

        if (item.dataHora) {
            const d = new Date(item.dataHora);
            const iso = d.toISOString();
            setDataHora(`${iso.slice(0, 10)} ${iso.slice(11, 16)}`);
        } else {
            setDataHora('');
        }

        setCoordenadorId(item.coordenador?.id || item.coordenadorId || '');

        // Map professors array to IDs
        const pIds = item.professores ? item.professores.map((p: any) => p.id) : [];
        setProfessoresIds(pIds);

        setEditingId(item.id);
        setModalVisible(true);
    }

    async function handleSave() {
        if (!titulo || !coordenadorId) {
            Alert.alert("Atenção", "Título e Coordenador são obrigatórios.");
            return;
        }

        try {
            const payload = {
                titulo: (tipo === 'AULA' && scheduleText) ? `${titulo} (${scheduleText})` : titulo,
                tipo,
                dataHora: dataHora || null,
                projetoId: projectId,
                coordenadorId,
                professoresIds
            };

            if (editingId) {
                await api.put(`/atividades/${editingId}`, payload);
                Alert.alert("Sucesso", "Atividade atualizada!");
            } else {
                await api.post('/atividades', payload);
                Alert.alert("Sucesso", "Atividade criada!");
            }

            setModalVisible(false);
            setEditingId(null);
            loadActivities();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Falha ao salvar atividade.";
            Alert.alert("Erro", msg);
        }
    }

    // Toggle professor selection
    function toggleProfessor(id: string) {
        if (professoresIds.includes(id)) {
            setProfessoresIds(professoresIds.filter(pid => pid !== id));
        } else {
            setProfessoresIds([...professoresIds, id]);
        }
    }

    // ... inside renderActivity ...
    const renderActivity = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardType}>{item.tipo}</Text>
            </View>
            {item.dataHora && <Text style={styles.cardDate}>{new Date(item.dataHora).toLocaleString()}</Text>}
            <Text style={styles.cardProf}>Coord: {item.coordenador?.nome}</Text>
            {item.professores && item.professores.length > 0 && (
                <Text style={styles.cardProf}>Profs: {item.professores.map((p: any) => p.nome).join(', ')}</Text>
            )}
            {item._count && <Text style={styles.cardSubs}>{item._count.inscricoes} inscritos</Text>}

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.activityBtn, { marginRight: 10 }]}
                    onPress={() => navigation.navigate('ManageTurmas', { activityId: item.id, activityTitle: item.titulo })}
                >
                    <Text style={styles.activityBtnText}>Turmas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.editBtn, { marginRight: 10 }]} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{projectName}</Text>
                <Text style={styles.headerSubtitle}>Gestão de Atividades</Text>
            </View>

            <TouchableOpacity style={styles.topButton} onPress={() => { setEditingId(null); openModal(); }}>
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.topButtonText}>Nova Atividade</Text>
            </TouchableOpacity>

            <FlatList
                data={activities}
                keyExtractor={item => item.id}
                renderItem={renderActivity}
                contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 120, paddingTop: 64 }}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade cadastrada neste projeto.</Text>}
            />

            {/* Create/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{editingId ? 'Editar Atividade' : 'Nova Atividade'}</Text>

                    <ScrollView>
                        <Text style={styles.label}>Título</Text>
                        <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ex: Aula de Música" />

                        <Text style={styles.label}>Tipo</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowTypeSelect(true)}>
                            <Text>{tipo}</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>{tipo === 'AULA' ? 'Data de Início (Opcional)' : 'Data e Hora (Opcional)'}</Text>
                        <TextInput style={styles.input} value={dataHora} onChangeText={setDataHora} placeholder="2025-01-20 14:00" />

                        {tipo === 'AULA' && (
                            <>
                                <Text style={styles.label}>Dias e Horários (Texto)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Terças e Quintas às 19h"
                                    value={scheduleText}
                                    onChangeText={setScheduleText}
                                />
                            </>
                        )}

                        <Text style={styles.label}>Coordenador (Responsável)</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowCoordenadorSelect(true)}>
                            <Text style={{ color: coordenadorId ? '#000' : '#888' }}>{getCoordenadorName()}</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Professores Auxiliares</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowProfessoresSelect(true)}>
                            <Text style={{ color: professoresIds.length > 0 ? '#000' : '#888' }}>{getProfessoresNames()}</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                            <Text style={styles.btnText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                            <Text style={styles.btnText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Type Modal */}
                <Modal visible={showTypeSelect} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowTypeSelect(false)}>
                        <View style={styles.selectBox}>
                            {['AULA', 'CURSO', 'EVENTO'].map((t) => (
                                <TouchableOpacity key={t} style={styles.selectItem} onPress={() => { setTipo(t as any); setShowTypeSelect(false); }}>
                                    <Text style={styles.selectText}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Coordenador Select Only */}
                <Modal visible={showCoordenadorSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione o Coordenador</Text>
                        <ScrollView>
                            {allUsers.map(u => (
                                <TouchableOpacity key={u.id} style={styles.userItem} onPress={() => { setCoordenadorId(u.id); setShowCoordenadorSelect(false); }}>
                                    <Text style={styles.userName}>{u.nome}</Text>
                                    <Text style={styles.userRole}>{u.tipo}</Text>
                                    {coordenadorId === u.id && <Ionicons name="checkmark" size={20} color="green" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={[styles.btn, styles.btnCancel, { marginTop: 20 }]} onPress={() => setShowCoordenadorSelect(false)}>
                            <Text style={styles.btnText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

                {/* Professors Select Multi */}
                <Modal visible={showProfessoresSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione Professores</Text>
                        <ScrollView>
                            {allUsers.map(u => (
                                <TouchableOpacity key={u.id} style={styles.userItem} onPress={() => toggleProfessor(u.id)}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#4a90e2' },
    headerSubtitle: { fontSize: 14, color: '#666' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cardType: { fontSize: 12, fontWeight: 'bold', color: '#fff', backgroundColor: '#4a90e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
    cardDate: { color: '#666', marginTop: 5 },
    cardProf: { color: '#444', marginTop: 5, fontStyle: 'italic' },
    cardSubs: { marginTop: 8, fontSize: 12, color: '#888' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
    topButton: {
        backgroundColor: '#4a90e2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        margin: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 }
    },
    topButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

    modalContainer: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 50 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontWeight: '600', marginBottom: 5, marginTop: 15, color: '#444' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, backgroundColor: '#f9f9f9', fontSize: 16, color: '#333' },
    selector: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, backgroundColor: '#f9f9f9' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
    btn: { flex: 0.48, padding: 15, borderRadius: 8, alignItems: 'center' },
    btnCancel: { backgroundColor: '#ccc' },
    btnSave: { backgroundColor: '#5cb85c' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    selectBox: { width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 10 },
    selectItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    selectText: { fontSize: 18, textAlign: 'center' },

    userItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    userName: { fontSize: 16, fontWeight: 'bold' },
    userRole: { fontSize: 12, color: '#4a90e2' },

    // New Styles for Actions
    actionButtons: { flexDirection: 'row', marginTop: 15, justifyContent: 'flex-start' },
    activityBtn: { backgroundColor: '#e0f7fa', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5, borderWidth: 1, borderColor: '#00A09A', justifyContent: 'center' },
    activityBtnText: { color: '#00A09A', fontWeight: 'bold', fontSize: 12 },
    editBtn: { backgroundColor: '#ff9800', padding: 8, borderRadius: 5, justifyContent: 'center' },
    deleteBtn: { backgroundColor: '#f44336', padding: 8, borderRadius: 5, justifyContent: 'center' }
});
