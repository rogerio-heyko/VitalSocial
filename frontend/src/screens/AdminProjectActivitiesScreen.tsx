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
    const [professorId, setProfessorId] = useState('');
    const [scheduleText, setScheduleText] = useState('');

    // Selection Modals
    const [showTypeSelect, setShowTypeSelect] = useState(false);
    const [showUserSelect, setShowUserSelect] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        loadActivities();
        loadUsers();
    }, []);

    const getProfessorName = () => {
        const p = allUsers.find(u => u.id === professorId);
        return p ? p.nome : "Selecione um Professor";
    };

    async function loadActivities() {
        try {
            const response = await api.get(`/atividades/projeto/${projectId}`);
            // Convert strings to nice format if needed, but keeping raw for now
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
        setDataHora(new Date().toISOString().slice(0, 16).replace('T', ' ')); // "2023-01-01 10:00"
        setProfessorId('');
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

    function openEditModal(item: Activity) {
        setTitulo(item.titulo.split(' (')[0]);
        // Try to extract schedule text if present in title "Title (Schedule)"
        const match = item.titulo.match(/\(([^)]+)\)$/);
        setScheduleText(match ? match[1] : '');

        setTipo(item.tipo);
        // Ensure date string is compatible with TextInput (YYYY-MM-DD HH:mm)
        const d = new Date(item.dataHora);
        // Adjust for timezone offset if necessary or just use ISO string slice
        // Simple approach:
        const iso = d.toISOString();
        const datePart = iso.slice(0, 10);
        const timePart = iso.slice(11, 16);
        setDataHora(`${datePart} ${timePart}`);

        setProfessorId(item.professor?.id || ''); // Assuming item.professor has ID, if not needed to fetch
        // Note: The list endpoint might not return professor ID in item.professor object based on previous controller code.
        // Let's check: Controller list method includes professor: { select: { nome: true, email: true } } -> NO ID.
        // We will need to rely on the user re-selecting or backend changing. 
        // For now, let's keep it empty or try to match by name? No, risky. 
        // User will have to select professor again or we update backend to return ID.
        // -> I'll update backend to return ID in list method for better UX.

        // Wait, I can't update backend in this same step easily without context switching.
        // Let's assume for now user re-selects or we just show "Select" if unknown.

        // Actually, let's check if the list endpoint return ID.
        // Controller: select: { nome: true, email: true } -> ID MISSING.
        // I will do a quick "blind" fix in frontend to assume user re-selects it for now.

        setEditingId(item.id);
        setModalVisible(true);
    }

    async function handleSave() {
        if (!titulo || !dataHora) {
            Alert.alert("Atenção", "Preencha título e data/hora.");
            return;
        }

        try {
            const payload = {
                titulo: (tipo === 'AULA' && scheduleText) ? `${titulo} (${scheduleText})` : titulo,
                tipo,
                dataHora,
                projetoId: projectId,
                professorResponsavelId: professorId || undefined
            };

            if (editingId) {
                await api.put(`/atividades/${editingId}`, payload);
                Alert.alert("Sucesso", "Atividade atualizada!");
            } else {
                if (!professorId) {
                    Alert.alert("Atenção", "Preencha o professor.");
                    return;
                }
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



    // ... inside renderActivity ...
    const renderActivity = ({ item }: { item: Activity }) => (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardType}>{item.tipo}</Text>
            </View>
            <Text style={styles.cardDate}>{new Date(item.dataHora).toLocaleString()}</Text>
            <Text style={styles.cardProf}>Prof: {item.professor?.nome}</Text>
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

                    <Text style={styles.label}>Título</Text>
                    <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ex: Aula de Música" />

                    <Text style={styles.label}>Tipo</Text>
                    <TouchableOpacity style={styles.selector} onPress={() => setShowTypeSelect(true)}>
                        <Text>{tipo}</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>{tipo === 'AULA' ? 'Data de Início (Referência)' : 'Data e Hora'}</Text>
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

                    <Text style={styles.label}>Professor Responsável</Text>
                    <TouchableOpacity style={styles.selector} onPress={() => setShowUserSelect(true)}>
                        <Text style={{ color: professorId ? '#000' : '#888' }}>{getProfessorName()}</Text>
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

                {/* Sub Modals (Type/User) remain same */}
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

                <Modal visible={showUserSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione o Professor</Text>
                        <ScrollView>
                            {allUsers.map(u => (
                                <TouchableOpacity key={u.id} style={styles.userItem} onPress={() => { setProfessorId(u.id); setShowUserSelect(false); }}>
                                    <Text style={styles.userName}>{u.nome}</Text>
                                    <Text style={styles.userRole}>{u.tipo}</Text>
                                </TouchableOpacity>
                            ))}
                            {allUsers.length === 0 && <Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhum STAFF/ADMIN encontrado.</Text>}
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
