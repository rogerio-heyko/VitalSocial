import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import api from '../services/api';

type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<ResetPasswordScreenRouteProp>();

    const { email } = route.params;

    const [token, setToken] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleResetPassword() {
        if (!token || !novaSenha) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, token, novaSenha });
            Alert.alert('Sucesso', 'Sua senha foi redefinida com sucesso!', [
                { text: 'Ir para Login', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Erro', error.response?.data?.message || 'Token inválido ou expirado.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-white justify-center px-8 pt-16 pb-16">
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.subtitle}>
                Insira o código enviado para: <Text style={{ fontWeight: 'bold' }}>{email}</Text> e crie sua nova senha.
            </Text>

            <Text style={styles.label}>Código de Recuperação</Text>
            <TextInput
                style={styles.inputToken}
                placeholder="CÓDIGO (ex: A1B2C3)"
                value={token}
                onChangeText={setToken}
                autoCapitalize="characters"
                maxLength={6}
            />

            <Text style={styles.label}>Nova Senha</Text>
            <TextInput
                style={styles.input}
                placeholder="Nova senha"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry
            />

            <Text style={styles.label}>Confirmar Nova Senha</Text>
            <TextInput
                style={styles.input}
                placeholder="Confirme a nova senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleResetPassword}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Redefinir Senha</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
                <Text style={styles.linkText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
    label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '600' },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: '#f9f9f9'
    },
    inputToken: {
        borderWidth: 1,
        borderColor: '#4a90e2',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 3,
        marginBottom: 20,
        backgroundColor: '#f0f8ff'
    },
    button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    linkButton: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#666' }
});
