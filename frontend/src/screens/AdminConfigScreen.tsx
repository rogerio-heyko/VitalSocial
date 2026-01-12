import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

interface ConfigItem {
    chave: string;
    valor: string;
    descricao?: string;
}

export default function AdminConfigScreen() {
    const [configs, setConfigs] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            const res = await api.get('/admin/config');
            setConfigs(res.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar configurações. Verifique suas permissões.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (chave: string, novoValor: string) => {
        setConfigs(prev => prev.map(c => c.chave === chave ? { ...c, valor: novoValor } : c));
    };

    const saveConfig = async (chave: string, valor: string) => {
        setSaving(true);
        try {
            await api.put(`/admin/config/${chave}`, { valor });
            Alert.alert('Sucesso', 'Configuração atualizada!');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4a90e2" /></View>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Configurações do Sistema</Text>
            <Text style={styles.subtitle}>Gerencie chaves PIX e Carteiras Crypto</Text>

            {configs.map(config => (
                <View key={config.chave} style={styles.card}>
                    <Text style={styles.label}>{config.descricao || config.chave}</Text>
                    <TextInput
                        style={styles.input}
                        value={config.valor}
                        onChangeText={text => handleUpdate(config.chave, text)}
                        placeholder="Não configurado"
                    />
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => saveConfig(config.chave, config.valor)}
                        disabled={saving}
                    >
                        <Text style={styles.saveText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingBottom: 50 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
    card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
    label: { fontWeight: 'bold', marginBottom: 8, color: '#444' },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, marginBottom: 10, color: '#333' },
    saveButton: { backgroundColor: '#4a90e2', padding: 10, borderRadius: 6, alignItems: 'center', alignSelf: 'flex-end', minWidth: 80 },
    saveText: { color: '#FFF', fontWeight: 'bold' }
});
