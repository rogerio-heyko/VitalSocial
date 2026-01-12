import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import api from '../services/api';

type EmailVerificationScreenRouteProp = RouteProp<RootStackParamList, 'EmailVerification'>;

export default function EmailVerificationScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<EmailVerificationScreenRouteProp>();

    // Recebe o e-mail via parâmetro de navegação (vindo do Cadastro)
    const { email } = route.params;

    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleVerify() {
        if (!token) {
            Alert.alert('Erro', 'Digite o código de verificação.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/verify', { email, token });
            Alert.alert('Sucesso', 'E-mail verificado! Agora você pode fazer login.');
            navigation.navigate('Login');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Erro', error.response?.data?.message || 'Código inválido ou expirado.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verifique seu E-mail</Text>
            <Text style={styles.subtitle}>Enviamos um código para:</Text>
            <Text style={styles.email}>{email}</Text>

            <Text style={styles.instruction}>
                Copie o código que chegou no seu e-mail (verifique o console do backend se estiver testando localmente) e cole abaixo:
            </Text>

            <TextInput
                style={styles.input}
                placeholder="CÓDIGO (ex: A1B2C3)"
                placeholderTextColor="#aaa"
                value={token}
                onChangeText={setToken}
                autoCapitalize="characters"
                maxLength={6}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleVerify}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Confirmar</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
                <Text style={styles.linkText}>Voltar para Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
    email: { fontSize: 18, fontWeight: 'bold', color: '#4a90e2', textAlign: 'center', marginBottom: 20 },
    instruction: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 20
    },
    button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    linkButton: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#666' }
});
