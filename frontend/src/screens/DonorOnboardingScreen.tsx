import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DonorOnboardingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { refreshUser } = useAuth();
    const [valor, setValor] = useState('');
    const [dia, setDia] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!valor || !dia) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        const diaNum = parseInt(dia);
        if (isNaN(diaNum) || diaNum < 1 || diaNum > 30) {
            Alert.alert('Erro', 'Dia de vencimento inválido (1-30).');
            return;
        }

        setLoading(true);
        try {
            await api.put('/perfil/doador', {
                valorMensal: parseFloat(valor.replace(',', '.')),
                diaVencimento: diaNum
            });
            Alert.alert('Sucesso', 'Perfil de Doador criado! Bem-vindo.');
            await refreshUser(); // Atualiza o contexto, redirecionando para Home automaticamente via Navigation
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar perfil.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Torne-se um Doador</Text>
            <Text style={styles.description}>
                Sua contribuição mensal ajuda a manter nossos projetos. Você pode cancelar a qualquer momento.
            </Text>

            <Text style={styles.label}>Valor Mensal (R$)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: 50.00"
                keyboardType="numeric"
                value={valor}
                onChangeText={setValor}
            />

            <Text style={styles.label}>Melhor Dia para Vencimento</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: 10"
                keyboardType="number-pad"
                maxLength={2}
                value={dia}
                onChangeText={setDia}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Confirmar</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#4a90e2', marginBottom: 10 },
    description: { fontSize: 16, color: '#666', marginBottom: 30 },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 20, backgroundColor: '#f9f9f9' },
    button: { backgroundColor: '#4a90e2', padding: 16, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
