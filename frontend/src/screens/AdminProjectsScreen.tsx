import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView } from 'react-native';
import api from '../services/api';

interface Projeto {
    id: string;
    nome: string;
    descricao?: string;
    instituicao?: string;
    chavePix?: string;
    walletBtc?: string;
    walletEth?: string;
    walletUsdt?: string;
}

export default function AdminProjectsScreen({ navigation }: any) {
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProject, setEditingProject] = useState<Projeto | null>(null);

    // Form States
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [instituicao, setInstituicao] = useState('');
    const [chavePix, setChavePix] = useState('');
    const [walletUsdt, setWalletUsdt] = useState('');

    async function loadProjects() {
        try {
            // Admin rota para listar tudo (se houver, ou a pública)
            // Aqui usando a pública por enquanto, idealmente teria uma /admin/projects que lista inativos também
            const response = await api.get('/admin/projects');
            setProjetos(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    function openModal(projeto?: Projeto) {
        if (projeto) {
            setEditingProject(projeto);
            setNome(projeto.nome);
            setDescricao(projeto.descricao || '');
            setInstituicao(projeto.instituicao || '');
            setChavePix(projeto.chavePix || '');
            setWalletUsdt(projeto.walletUsdt || '');
        } else {
            setEditingProject(null);
            setNome('');
            setDescricao('');
            setInstituicao('');
            setChavePix('');
            setWalletUsdt('');
        }
        setModalVisible(true);
    }

    async function handleSave() {
        try {
            const data = { nome, descricao, instituicao, chavePix, walletUsdt };
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

    const renderItem = ({ item }: { item: Projeto }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.projectName}>{item.nome}</Text>
                {item.instituicao && <Text style={{ fontSize: 12, color: '#4a90e2', fontWeight: 'bold' }}>{item.instituicao}</Text>}
                <Text numberOfLines={1} style={styles.projectDesc}>{item.descricao}</Text>

                <TouchableOpacity
                    style={styles.activityBtn}
                    onPress={() => navigation.navigate('AdminProjectActivities', { projectId: item.id, projectName: item.nome })}
                >
                    <Text style={styles.activityBtnText}>Gerenciar Atividades</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.editBtn}>
                    <Text style={{ color: '#fff' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.delBtn}>
                    <Text style={{ color: '#fff' }}>X</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 px-8 pt-16 pb-16 bg-gray-100">
            <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
                <Text style={styles.addButtonText}>+ Novo Projeto</Text>
            </TouchableOpacity>

            <FlatList
                data={projetos}
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</Text>
                    <ScrollView>
                        <Text style={styles.label}>Nome do Projeto *</Text>
                        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Sede Social" />

                        <Text style={styles.label}>Descrição</Text>
                        <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholder="Breve descrição..." />

                        <Text style={styles.label}>Instituição Responsável</Text>
                        <TextInput style={styles.input} value={instituicao} onChangeText={setInstituicao} placeholder="Ex: Instituto Farol" />

                        <Text style={styles.sectionTitle}>Chaves de Doação</Text>

                        <Text style={styles.label}>Chave PIX</Text>
                        <TextInput style={styles.input} value={chavePix} onChangeText={setChavePix} placeholder="CPF, Email, Aleatória..." />



                        <Text style={styles.label}>Wallet USDT (Rede Polygon)</Text>
                        <TextInput style={styles.input} value={walletUsdt} onChangeText={setWalletUsdt} placeholder="Endereço USDT (Polygon)" />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    addButton: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
    projectName: { fontSize: 18, fontWeight: 'bold' },
    projectDesc: { color: '#666' },
    actions: { flexDirection: 'row', gap: 10 },
    editBtn: { backgroundColor: '#f0ad4e', padding: 8, borderRadius: 5 },
    delBtn: { backgroundColor: '#d9534f', padding: 8, borderRadius: 5 },

    modalContainer: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#4a90e2' },
    label: { fontWeight: '600', marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, backgroundColor: '#f9f9f9' },
    saveButton: { backgroundColor: '#5cb85c', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    cancelButton: { marginTop: 15, alignItems: 'center' },
    cancelButtonText: { color: '#888', fontSize: 16 },
    activityBtn: { marginTop: 8, backgroundColor: '#e1f5fe', padding: 6, borderRadius: 4, alignSelf: 'flex-start' },
    activityBtnText: { color: '#0288d1', fontSize: 12, fontWeight: 'bold' }
});
