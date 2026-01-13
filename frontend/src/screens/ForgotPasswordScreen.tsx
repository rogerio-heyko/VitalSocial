import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import api from '../services/api';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSendCode() {
        if (!email) {
            Alert.alert('Erro', 'Por favor, digite seu e-mail.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            Alert.alert(
                'Sucesso',
                'Se o e-mail estiver cadastrado, você receberá um código de recuperação.',
                [{ text: 'OK', onPress: () => navigation.navigate('ResetPassword', { email }) }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Ocorreu um erro ao processar sua solicitação.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-white justify-center px-8 pt-16 pb-16">
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
                Digite seu e-mail cadastrado para receber o código de redefinição.
            </Text>

            <Text style={styles.label}>E-mail</Text>
            <TextInput
                style={styles.input}
                placeholder="exemplo@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSendCode}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Enviar Código</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
                <Text style={styles.linkText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
    label: { fontSize: 16, color: '#444', marginBottom: 8, fontWeight: '600' },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9'
    },
    button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    linkButton: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#666' }
});
