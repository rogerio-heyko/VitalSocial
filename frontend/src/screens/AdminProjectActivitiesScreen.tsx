import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Activity {
    id: string;
    titulo: string;
    tipo: 'AULA' | 'CURSO' | 'EVENTO';
    dataHora: string;
    endereco?: string;
    fusoHorario?: string;
    professor: { nome: string, id: string };
    _count?: { inscricoes: number };
}

interface User {
    id: string;
    nome: string;
    tipo: string;
}

const TIMEZONES = [
    { label: 'Brasília (UTC-3)', value: 'UTC-3' },
    { label: 'Portugal (UTC+0)', value: 'UTC+0' },
    { label: 'Portugal Verão (UTC+1)', value: 'UTC+1' },
    { label: 'Manaus (UTC-4)', value: 'UTC-4' },
    { label: 'Acre (UTC-5)', value: 'UTC-5' },
    { label: 'UTC', value: 'UTC' },
];

export default function AdminProjectActivitiesScreen({ route, navigation }: any) {
    const { projectId, projectName } = route.params;
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form
    const [modalVisible, setModalVisible] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Form Data
    const [titulo, setTitulo] = useState('');
    const [tipo, setTipo] = useState<'AULA' | 'CURSO' | 'EVENTO'>('AULA');
    const [date, setDate] = useState(new Date());
    const [endereco, setEndereco] = useState('');
    const [fusoHorario, setFusoHorario] = useState('UTC-3');
    const [professorId, setProfessorId] = useState('');
    
    // UI Helpers
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showTypeSelect, setShowTypeSelect] = useState(false);
    const [showUserSelect, setShowUserSelect] = useState(false);
    const [showTzSelect, setShowTzSelect] = useState(false);

    useEffect(() => {
        loadActivities();
        loadUsers();
    }, []);

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
            // Include LIDER_SOCIAL
            const staff = response.data.filter((u: User) => u.tipo === 'STAFF' || u.tipo === 'ADMIN' || u.tipo === 'LIDER_SOCIAL');
            setAllUsers(staff);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoadingUsers(false);
        }
    }

    function openModal(activity?: Activity) {
        if (activity) {
            setEditingActivity(activity);
            setTitulo(activity.titulo);
            setTipo(activity.tipo);
            setDate(new Date(activity.dataHora));
            setEndereco(activity.endereco || '');
            setFusoHorario(activity.fusoHorario || 'UTC-3');
            setProfessorId(activity.professor.id);
        } else {
            setEditingActivity(null);
            setTitulo('');
            setTipo('AULA');
            setDate(new Date());
            setEndereco('');
            setFusoHorario('UTC-3');
            setProfessorId('');
        }
        setModalVisible(true);
    }

    async function handleSave() {
        if (!titulo || !professorId) {
            Alert.alert("Atenção", "Título e Professor são obrigatórios.");
            return;
        }

        try {
            const payload = {
                titulo,
                tipo,
                dataHora: date.toISOString(),
                projetoId: projectId,
                professorResponsavelId: professorId,
                endereco,
                fusoHorario
            };

            if (editingActivity) {
                await api.put(`/atividades/${editingActivity.id}`, payload);
                Alert.alert("Sucesso", "Atividade atualizada!");
            } else {
                await api.post('/atividades', payload);
                Alert.alert("Sucesso", "Atividade criada!");
            }
            
            setModalVisible(false);
            loadActivities();
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Falha ao salvar atividade.");
        }
    }

    async function handleDelete(id: string) {
        Alert.alert("Excluir", "Tem certeza que deseja excluir esta atividade?", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Excluir", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        await api.delete(`/atividades/${id}`);
                        loadActivities();
                    } catch (error) {
                        Alert.alert("Erro", "Falha ao excluir atividade.");
                    }
                }
            }
        ]);
    }

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const newDate = new Date(date);
            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setDate(newDate);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const newDate = new Date(date);
            newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
            setDate(newDate);
        }
    };

    const getProfessorName = () => {
        const p = allUsers.find(u => u.id === professorId);
        return p ? p.nome : "Selecione um Professor";
    };

    const formatDateTime = (date: Date) => {
        return `${date.toLocaleDateString()} às ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const renderActivity = ({ item }: { item: Activity }) => (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.titulo}</Text>
                    <Text style={styles.cardType}>{item.tipo}</Text>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity 
                        onPress={() => openModal(item)} 
                        style={[styles.iconBtn, { marginRight: 10 }]}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
                    >
                        <Ionicons name="create-outline" size={26} color="#4a90e2" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleDelete(item.id)} 
                        style={styles.iconBtn}
                        hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
                    >
                        <Ionicons name="trash-outline" size={26} color="#d9534f" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.cardInfo}>{new Date(item.dataHora).toLocaleString()} ({item.fusoHorario})</Text>
            </View>
            
            {item.endereco && (
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.cardInfo}>{item.endereco}</Text>
                </View>
            )}
            
            <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color="#666" />
                <Text style={styles.cardInfo}>Prof: {item.professor?.nome}</Text>
            </View>

            {item._count && (
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={14} color="#666" />
                    <Text style={[styles.cardInfo, { color: '#4a90e2', fontWeight: 'bold' }]}>
                        {item._count.inscricoes} inscritos
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.activityBtn}
                onPress={() => navigation.navigate('ManageTurmas', { activityId: item.id, activityTitle: item.titulo })}
            >
                <Text style={styles.activityBtnText}>Gerenciar Turmas</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{projectName}</Text>
                <Text style={styles.headerSubtitle}>Gestão de Atividades</Text>
            </View>

            <TouchableOpacity style={styles.topButton} onPress={() => openModal()}>
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.topButtonText}>Nova Atividade</Text>
            </TouchableOpacity>

            <FlatList
                data={activities}
                keyExtractor={item => item.id}
                renderItem={renderActivity}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                ListEmptyComponent={loading ? <ActivityIndicator size="large" color="#4a90e2" style={{ marginTop: 50 }} /> : <Text style={styles.emptyText}>Nenhuma atividade encontrada.</Text>}
            />

            {/* Main Modal */}
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingActivity ? 'Editar Atividade' : 'Nova Atividade'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Título *</Text>
                        <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ex: Aula de Música" />

                        <Text style={styles.label}>Tipo</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowTypeSelect(true)}>
                            <Text>{tipo}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Data e Hora</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity style={[styles.selector, { flex: 1 }]} onPress={() => setShowDatePicker(true)}>
                                <Text>{date.toLocaleDateString()}</Text>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.selector, { flex: 1 }]} onPress={() => setShowTimePicker(true)}>
                                <Text>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                <Ionicons name="time-outline" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
                        )}
                        {showTimePicker && (
                            <DateTimePicker value={date} mode="time" display="default" is24Hour={true} onChange={onTimeChange} />
                        )}

                        <Text style={styles.label}>Fuso Horário</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowTzSelect(true)}>
                            <Text>{TIMEZONES.find(t => t.value === fusoHorario)?.label || fusoHorario}</Text>
                            <Ionicons name="globe-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Endereço Completo (incluindo país)</Text>
                        <TextInput 
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                            value={endereco} 
                            onChangeText={setEndereco} 
                            placeholder="Ex: Rua das Flores, 123, Lisboa, Portugal" 
                            multiline
                        />

                        <Text style={styles.label}>Professor Responsável *</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowUserSelect(true)}>
                            <Text style={{ color: professorId ? '#000' : '#888' }}>{getProfessorName()}</Text>
                            <Ionicons name="person-add-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>SALVAR ATIVIDADE</Text>
                        </TouchableOpacity>
                        
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>

                {/* Sub-Modals (Type, TZ, User) */}
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

                <Modal visible={showTzSelect} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowTzSelect(false)}>
                        <View style={styles.selectBox}>
                            <ScrollView>
                                {TIMEZONES.map((tz) => (
                                    <TouchableOpacity key={tz.value} style={styles.selectItem} onPress={() => { setFusoHorario(tz.value); setShowTzSelect(false); }}>
                                        <Text style={styles.selectText}>{tz.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* User Selection Full Screen */}
                <Modal visible={showUserSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Professor</Text>
                            <TouchableOpacity onPress={() => setShowUserSelect(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={allUsers}
                            keyExtractor={u => u.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.userItem} onPress={() => { setProfessorId(item.id); setShowUserSelect(false); }}>
                                    <View>
                                        <Text style={styles.userName}>{item.nome}</Text>
                                        <Text style={styles.userRole}>{item.tipo}</Text>
                                    </View>
                                    {professorId === item.id && <Ionicons name="checkmark-circle" size={24} color="#5cb85c" />}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={loadingUsers ? <ActivityIndicator style={{ marginTop: 20 }} /> : <Text style={styles.emptyText}>Nenhum responsável encontrado.</Text>}
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
    headerSubtitle: { fontSize: 14, color: '#4a90e2', fontWeight: '600', textTransform: 'uppercase' },
    
    topButton: {
        backgroundColor: '#4a90e2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 20,
        marginTop: 20,
        elevation: 4,
        shadowColor: '#4a90e2',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    topButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

    card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#4a90e2', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    cardType: { fontSize: 10, fontWeight: '800', backgroundColor: '#e1f5fe', color: '#0288d1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    cardActions: { flexDirection: 'row' },
    iconBtn: { padding: 5 },
    
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    cardInfo: { fontSize: 13, color: '#666', flex: 1 },
    
    activityBtn: { 
        marginTop: 15, 
        backgroundColor: '#f0f4f8', 
        padding: 12, 
        borderRadius: 12, 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#d1d9e6',
        minHeight: 48,
        justifyContent: 'center'
    },
    activityBtnText: { color: '#4a90e2', fontWeight: 'bold', fontSize: 14 },
    
    emptyText: { textAlign: 'center', marginTop: 100, color: '#999', fontSize: 16 },

    modalContainer: { flex: 1, backgroundColor: '#fff', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingTop: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    
    label: { fontWeight: '700', fontSize: 14, color: '#444', marginBottom: 8, marginTop: 20 },
    input: { backgroundColor: '#f5f7fa', borderWidth: 1, borderColor: '#e1e8f0', borderRadius: 10, padding: 15, fontSize: 16 },
    selector: { backgroundColor: '#f5f7fa', borderWidth: 1, borderColor: '#e1e8f0', borderRadius: 10, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    
    saveButton: { backgroundColor: '#4a90e2', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 40 },
    saveButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    selectBox: { width: '85%', maxHeight: '70%', backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 20 },
    selectItem: { padding: 20, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    selectText: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
    
    userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    userRole: { fontSize: 12, color: '#4a90e2', marginTop: 2 },
});
