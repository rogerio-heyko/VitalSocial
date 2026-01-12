import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

interface Usuario {
    id: string;
    nome: string;
    email: string;
    tipo: string;
    cargo?: string;
}

export default function AdminUsersScreen() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal de Edição
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [newCargo, setNewCargo] = useState('');

    async function loadUsers() {
        setLoading(true);
        try {
            const response = await api.get('/admin/users', { params: { search } });
            setUsuarios(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, [search]); // Recarrega ao buscar

    async function updateUserRole(tipo: string) {
        if (!selectedUser) return;
        try {
            await api.put(`/admin/users/${selectedUser.id}/role`, {
                tipo,
                cargo: newCargo // Salva o cargo junto
            });
            Alert.alert('Sucesso', `Usuário atualizado para ${tipo}`);
            setModalVisible(false);
            loadUsers();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao atualizar usuário.');
        }
    }

    function openModal(user: Usuario) {
        setSelectedUser(user);
        setNewCargo(user.cargo || '');
        setModalVisible(true);
    }

    const renderItem = ({ item }: { item: Usuario }) => (
        <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
            <View>
                <Text style={styles.name}>{item.nome}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.role}>{item.tipo} {item.cargo ? `- ${item.cargo}` : ''}</Text>
            </View>
            <Text style={styles.editLabel}>EDITAR</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Buscar por nome ou email..."
                value={search}
                onChangeText={setSearch}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#4a90e2" />
            ) : (
                <FlatList
                    data={usuarios}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Usuário</Text>
                        <Text style={styles.modalSubtitle}>{selectedUser?.nome}</Text>

                        <Text style={styles.label}>Cargo (Opcional - ex: Diretor)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o cargo..."
                            value={newCargo}
                            onChangeText={setNewCargo}
                        />

                        <Text style={styles.label}>Definir Permissão:</Text>
                        <View style={styles.roleButtons}>
                            <TouchableOpacity style={[styles.roleBtn, { backgroundColor: '#4a90e2' }]} onPress={() => updateUserRole('ADMIN')}>
                                <Text style={styles.roleBtnText}>ADMIN (Master)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.roleBtn, { backgroundColor: '#5bc0de' }]} onPress={() => updateUserRole('STAFF')}>
                                <Text style={styles.roleBtnText}>STAFF (Worker)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.roleBtn, { backgroundColor: '#ccc' }]} onPress={() => updateUserRole('DOADOR')}>
                                <Text style={styles.roleBtnText}>DOADOR (Comum)</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    searchBar: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 16, fontWeight: 'bold' },
    email: { color: '#666', fontSize: 12 },
    role: { color: '#4a90e2', fontWeight: '600', marginTop: 2 },
    editLabel: { color: '#888', fontSize: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    modalSubtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
    label: { fontWeight: '600', marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 15 },
    roleButtons: { gap: 10 },
    roleBtn: { padding: 12, borderRadius: 8, alignItems: 'center' },
    roleBtnText: { color: '#fff', fontWeight: 'bold' },
    closeButton: { marginTop: 20, alignItems: 'center' },
    closeText: { color: '#666' }
});
