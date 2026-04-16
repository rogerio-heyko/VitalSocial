import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Activity {
    id: string;
    titulo: string;
    tipo: 'AULA' | 'CURSO' | 'EVENTO';
    dataHora?: string;
    endereco?: string;
    fusoHorario?: string;
    coordenador: { nome: string, id: string };
    professores?: { nome: string, id: string }[];
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
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Form Data
    const [editingId, setEditingId] = useState<string | null>(null);
    const [titulo, setTitulo] = useState('');
    const [tipo, setTipo] = useState<'AULA' | 'CURSO' | 'EVENTO'>('AULA');
    const [date, setDate] = useState(new Date());
    const [useManualDate, setUseManualDate] = useState(false);
    const [dataHoraText, setDataHoraText] = useState('');
    const [endereco, setEndereco] = useState('');
    const [fusoHorario, setFusoHorario] = useState('UTC-3');
    const [coordenadorId, setCoordenadorId] = useState('');
    const [professoresIds, setProfessoresIds] = useState<string[]>([]);
    const [scheduleText, setScheduleText] = useState('');

    // UI Helpers / Selection Modals
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showTypeSelect, setShowTypeSelect] = useState(false);
    const [showTzSelect, setShowTzSelect] = useState(false);
    const [showCoordenadorSelect, setShowCoordenadorSelect] = useState(false);
    const [showProfessoresSelect, setShowProfessoresSelect] = useState(false);
    const [showCoordenadorSelect, setShowCoordenadorSelect] = useState(false);
    const [showProfessoresSelect, setShowProfessoresSelect] = useState(false);
    const [showTzSelect, setShowTzSelect] = useState(false);

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
            // Include LIDER_SOCIAL
            const staff = response.data.filter((u: User) => u.tipo === 'STAFF' || u.tipo === 'ADMIN' || u.tipo === 'LIDER_SOCIAL');
            setAllUsers(staff);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoadingUsers(false);
        }
    }

    function openModal(item?: any) {
        if (item) {
            setEditingId(item.id);
            setTitulo(item.titulo.split(' (')[0]);
            const match = item.titulo.match(/\(([^)]+)\)$/);
            setScheduleText(match ? match[1] : '');
            setTipo(item.tipo);
            if (item.dataHora) {
                const d = new Date(item.dataHora);
                setDate(d);
                const iso = d.toISOString();
                setDataHoraText(`${iso.slice(0, 10)} ${iso.slice(11, 16)}`);
            } else {
                setDataHoraText('');
            }
            setEndereco(item.endereco || '');
            setFusoHorario(item.fusoHorario || 'UTC-3');
            setCoordenadorId(item.coordenador?.id || item.coordenadorId || '');
            setProfessoresIds(item.professores ? item.professores.map((p: any) => p.id) : []);
        } else {
            setEditingId(null);
            setTitulo('');
            setTipo('AULA');
            setDate(new Date());
            setDataHoraText('');
            setEndereco('');
            setFusoHorario('UTC-3');
            setCoordenadorId('');
            setProfessoresIds([]);
            setScheduleText('');
        }
        setModalVisible(true);
    }

    async function handleSave() {
        if (!titulo || !coordenadorId) {
            Alert.alert("Atenção", "Título e Coordenador são obrigatórios.");
            return;
        }

        try {
            const finalDataHora = useManualDate ? (dataHoraText || null) : date.toISOString();

            const payload = {
                titulo: (tipo === 'AULA' && scheduleText) ? `${titulo} (${scheduleText})` : titulo,
                tipo,
                dataHora: finalDataHora,
                projetoId: projectId,
                coordenadorId,
                professoresIds,
                endereco,
                fusoHorario
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
                        Alert.alert("Sucesso", "Atividade excluída.");
                    } catch (error) {
                        Alert.alert("Erro", "Falha ao excluir atividade.");
                    }
                }
            }
        ]);
    }

    function toggleProfessor(id: string) {
        if (professoresIds.includes(id)) {
            setProfessoresIds(professoresIds.filter(pid => pid !== id));
        } else {
            setProfessoresIds([...professoresIds, id]);
        }
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

    const getCoordenadorName = () => {
        if (!coordenadorId) return "Selecione um Responsável";
        const u = allUsers.find(u => u.id === coordenadorId);
        return u ? u.nome : "Carregando...";
    };

    const getProfessoresNames = () => {
        if (professoresIds.length === 0) return "Nenhum professor auxiliar";
        const names = allUsers.filter(u => professoresIds.includes(u.id)).map(u => u.nome);
        return names.join(', ');
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
            {item.dataHora && (
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.cardInfo}>{new Date(item.dataHora).toLocaleString()} ({item.fusoHorario})</Text>
                </View>
            )}
            
            {item.endereco && (
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.cardInfo}>{item.endereco}</Text>
                </View>
            )}
            
            <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color="#666" />
                <Text style={styles.cardInfo}>Coord: {item.coordenador?.nome}</Text>
            </View>

            {item.professores && item.professores.length > 0 && (
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={14} color="#666" />
                    <Text style={styles.cardInfo}>Profs: {item.professores.map((p: any) => p.nome).join(', ')}</Text>
                </View>
            )}

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

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingId ? 'Editar Atividade' : 'Nova Atividade'}</Text>
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
                        <View style={styles.dateToggle}>
                            <TouchableOpacity 
                                style={[styles.dateToggleBtn, !useManualDate && styles.dateToggleBtnActive]} 
                                onPress={() => setUseManualDate(false)}
                            >
                                <Text style={[styles.dateToggleText, !useManualDate && styles.dateToggleTextActive]}>Automático</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.dateToggleBtn, useManualDate && styles.dateToggleBtnActive]} 
                                onPress={() => setUseManualDate(true)}
                            >
                                <Text style={[styles.dateToggleText, useManualDate && styles.dateToggleTextActive]}>Manual</Text>
                            </TouchableOpacity>
                        </View>

                        {!useManualDate ? (
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
                        ) : (
                            <TextInput 
                                style={styles.input} 
                                value={dataHoraText} 
                                onChangeText={setDataHoraText} 
                                placeholder="YYYY-MM-DD HH:mm (Ex: 2025-01-20 14:00)" 
                            />
                        )}

                        {showDatePicker && (
                            <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
                        )}
                        {showTimePicker && (
                            <DateTimePicker value={date} mode="time" display="default" is24Hour={true} onChange={onTimeChange} />
                        )}

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

                        <Text style={styles.label}>Coordenador Responsável *</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowCoordenadorSelect(true)}>
                            <Text style={{ color: coordenadorId ? '#000' : '#888' }}>{getCoordenadorName()}</Text>
                            <Ionicons name="person-add-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Professores Auxiliares</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowProfessoresSelect(true)}>
                            <Text style={{ color: professoresIds.length > 0 ? '#000' : '#888' }}>{getProfessoresNames()}</Text>
                            <Ionicons name="people-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>SALVAR ATIVIDADE</Text>
                        </TouchableOpacity>
                        
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>

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

                <Modal visible={showCoordenadorSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Coordenador</Text>
                            <TouchableOpacity onPress={() => setShowCoordenadorSelect(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={allUsers}
                            keyExtractor={u => u.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.userItem} onPress={() => { setCoordenadorId(item.id); setShowCoordenadorSelect(false); }}>
                                    <View>
                                        <Text style={styles.userName}>{item.nome}</Text>
                                        <Text style={styles.userRole}>{item.tipo}</Text>
                                    </View>
                                    {coordenadorId === item.id && <Ionicons name="checkmark-circle" size={24} color="#5cb85c" />}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={loadingUsers ? <ActivityIndicator style={{ marginTop: 20 }} /> : <Text style={styles.emptyText}>Nenhum responsável encontrado.</Text>}
                        />
                    </View>
                </Modal>

                <Modal visible={showProfessoresSelect} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecione Professores</Text>
                            <TouchableOpacity onPress={() => setShowProfessoresSelect(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
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

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    selectBox: { width: '85%', maxHeight: '70%', backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 20 },
    selectItem: { padding: 20, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    selectText: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
    
    userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    userRole: { fontSize: 12, color: '#4a90e2', marginTop: 2 },

    dateToggle: { flexDirection: 'row', backgroundColor: '#f5f7fa', borderRadius: 10, padding: 4, marginBottom: 12 },
    dateToggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    dateToggleBtnActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    dateToggleText: { fontSize: 12, fontWeight: '600', color: '#666' },
    dateToggleTextActive: { color: '#4a90e2' },

    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 20 },
    btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
    btnCancel: { backgroundColor: '#f5f7fa', borderWidth: 1, borderColor: '#e1e8f0' },
    btnSave: { backgroundColor: '#4a90e2' },
    btnText: { fontWeight: 'bold', fontSize: 16, color: '#333' }

});
