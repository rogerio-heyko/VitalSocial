import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface Projeto {
    id: string;
    nome: string;
    descricao?: string;
    instituicao?: string;
    chavePix?: string;
    walletUsdt?: string;
    responsavelId?: string;
    responsavel?: { nome: string };
}

interface User {
    id: string;
    nome: string;
    tipo: string;
}

export default function AdminProjectsScreen({ navigation }: any) {
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProject, setEditingProject] = useState<Projeto | null>(null);
    const [loading, setLoading] = useState(true);

    // Form States
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [instituicao, setInstituicao] = useState('');
    const [chavePix, setChavePix] = useState('');
    const [walletUsdt, setWalletUsdt] = useState('');
    const [responsavelId, setResponsavelId] = useState('');

    // User Selection
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [showUserSelect, setShowUserSelect] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    async function loadProjects() {
        setLoading(true);
        try {
            const response = await api.get('/admin/projects');
            setProjetos(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function loadUsers() {
        setLoadingUsers(true);
        try {
            const response = await api.get('/admin/users');
            // Include LIDER_SOCIAL
            const staff = response.data.filter((u: User) => u.tipo === 'STAFF' || u.tipo === 'ADMIN' || u.tipo === 'LIDER_SOCIAL');
            setAllUsers(staff);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUsers(false);
        }
    }

    useEffect(() => {
        loadProjects();
        loadUsers();
    }, []);

    function openModal(projeto?: Projeto) {
        if (projeto) {
            setEditingProject(projeto);
            setNome(projeto.nome);
            setDescricao(projeto.descricao || '');
            setInstituicao(projeto.instituicao || '');
            setChavePix(projeto.chavePix || '');
            setWalletUsdt(projeto.walletUsdt || '');
            setResponsavelId(projeto.responsavelId || '');
        } else {
            setEditingProject(null);
            setNome('');
            setDescricao('');
            setInstituicao('');
            setChavePix('');
            setWalletUsdt('');
            setResponsavelId('');
        }
        setModalVisible(true);
    }

    async function handleSave() {
        try {
            const data = { nome, descricao, instituicao, chavePix, walletUsdt, responsavelId };
            if (editingProject) {
                await api.put(`/admin/projects/${editingProject.id}`, data);
                Alert.alert('Sucesso', 'Projeto atualizado!');
            } else {
                await api.post('/admin/projects', data);
                Alert.alert('Sucesso', 'Projeto criado!');
            }
            setModalVisible(false);
            loadProjects();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar projeto.');
        }
    }

    async function handleDelete(id: string) {
        Alert.alert('Excluir', 'Tem certeza que deseja excluir este projeto?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/admin/projects/${id}`);
                        loadProjects();
                    } catch (error) {
                        Alert.alert('Erro', 'Não foi possível excluir (verifique se há doações vinculadas).');
                    }
                }
            }
        ]);
    }

    const getResponsavelName = () => {
        const u = allUsers.find(x => x.id === responsavelId);
        return u ? u.nome : "Selecione o Responsável";
    };

    const renderItem = ({ item }: { item: Projeto }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.projectName}>{item.nome}</Text>
                <Text style={styles.projectInst}>{item.instituicao || 'Sem instituição'}</Text>
                {item.responsavel && (
                    <Text style={styles.projectLider}>Líder: {item.responsavel.nome}</Text>
                )}
                <Text numberOfLines={2} style={styles.projectDesc}>{item.descricao}</Text>

                <TouchableOpacity
                    style={styles.activityBtn}
                    onPress={() => navigation.navigate('AdminProjectActivities', { projectId: item.id, projectName: item.nome })}
                >
                    <Text style={styles.activityBtnText}>Gerenciar Atividades</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.editBtn}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.delBtn}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Projetos & Entidades</Text>
                <Text style={styles.headerSubtitle}>Administração</Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Novo Projeto</Text>
            </TouchableOpacity>

            <FlatList
                data={projetos}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                ListEmptyComponent={loading ? <ActivityIndicator size="large" color="#4a90e2" /> : <Text style={styles.emptyText}>Nenhum projeto cadastrado.</Text>}
            />

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Nome do Projeto *</Text>
                        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Sede Social" />

                        <Text style={styles.label}>Descrição</Text>
                        <TextInput style={[styles.input, { height: 80 }]} value={descricao} onChangeText={setDescricao} placeholder="Breve descrição..." multiline />

                        <Text style={styles.label}>Entidade/Instituição Responsável</Text>
                        <TextInput style={styles.input} value={instituicao} onChangeText={setInstituicao} placeholder="Ex: Instituto Farol" />

                        <Text style={styles.label}>Líder Social (Responsável pelo Projeto) *</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowUserSelect(true)}>
                            <Text style={{ color: responsavelId ? '#000' : '#888' }}>{getResponsavelName()}</Text>
                            <Ionicons name="person-add-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Canais de Doação</Text>

                        <Text style={styles.label}>Chave PIX</Text>
                        <TextInput style={styles.input} value={chavePix} onChangeText={setChavePix} placeholder="Ex: pix@instituto.org" />

                        <Text style={styles.label}>Wallet USDT (Polygon)</Text>
                        <TextInput style={styles.input} value={walletUsdt} onChangeText={setWalletUsdt} placeholder="0x..." />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>SALVAR PROJETO</Text>
                        </TouchableOpacity>

                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>

                {/* User Selection Modal */}
                <Modal visible={showUserSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Líder</Text>
                            <TouchableOpacity onPress={() => setShowUserSelect(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={allUsers}
                            keyExtractor={u => u.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.userItem} onPress={() => { setResponsavelId(item.id); setShowUserSelect(false); }}>
                                    <View>
                                        <Text style={styles.userName}>{item.nome}</Text>
                                        <Text style={styles.userRole}>{item.tipo}</Text>
                                    </View>
                                    {responsavelId === item.id && <Ionicons name="checkmark-circle" size={24} color="#5cb85c" />}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={loadingUsers ? <ActivityIndicator size="large" /> : <Text style={styles.emptyText}>Nenhum Líder encontrado.</Text>}
                        />
                    </View>
                </Modal>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', paddingTop: 40 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    headerSubtitle: { fontSize: 13, color: '#4a90e2', fontWeight: 'bold', textTransform: 'uppercase' },
    
    addButton: { backgroundColor: '#4a90e2', flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', margin: 20 },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

    card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, flexDirection: 'row', alignItems: 'flex-start', borderLeftWidth: 5, borderLeftColor: '#4a90e2', elevation: 2 },
    projectName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    projectInst: { fontSize: 12, color: '#4a90e2', fontWeight: 'bold', marginTop: 2 },
    projectLider: { fontSize: 12, color: '#666', marginTop: 2, fontStyle: 'italic' },
    projectDesc: { color: '#888', marginTop: 10, fontSize: 13 },
    
    actions: { gap: 10, marginLeft: 10 },
    editBtn: { backgroundColor: '#f0ad4e', padding: 8, borderRadius: 10 },
    delBtn: { backgroundColor: '#d9534f', padding: 8, borderRadius: 10 },

    modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    
    label: { fontWeight: '700', fontSize: 14, color: '#444', marginBottom: 5, marginTop: 15 },
    input: { backgroundColor: '#f5f7fa', borderWidth: 1, borderColor: '#e1e8f0', borderRadius: 10, padding: 12, fontSize: 16 },
    selector: { backgroundColor: '#f5f7fa', borderWidth: 1, borderColor: '#e1e8f0', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, color: '#4a90e2' },
    saveButton: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 30 },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
    activityBtn: { marginTop: 12, backgroundColor: '#e1f5fe', padding: 8, borderRadius: 8, alignSelf: 'flex-start' },
    activityBtnText: { color: '#0288d1', fontSize: 12, fontWeight: 'bold' },

    userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    userRole: { fontSize: 12, color: '#4a90e2' },
});
