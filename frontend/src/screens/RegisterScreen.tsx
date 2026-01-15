import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }: any) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { signUp } = useAuth();
    const [loading, setLoading] = useState(false);

    async function handleRegister() {
        if (loading) return;
        setLoading(true);
        try {
            await signUp(nome, email, senha);
            // Alert.alert('Sucesso', 'Conta criada! Faça login.');
            navigation.navigate('EmailVerification', { email });
        } catch (error: any) {
            console.error("Erro detalhado no registro:", JSON.stringify(error, null, 2));
            if (error.response) {
                console.error("Response Data:", error.response.data);
                console.error("Response Status:", error.response.status);
            } else if (error.request) {
                console.error("No Response Received (Network Request Failed)");
            } else {
                console.error("Error Message:", error.message);
            }
            Alert.alert('Erro', 'Falha no cadastro. Verifique seus dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-white justify-center px-8 pt-16 pb-16">
            <Text style={styles.title}>Crie sua conta</Text>

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: João da Silva"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: joao@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#999"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#999" />
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20 }}>
                <Button title={loading ? "Criando..." : "Cadastrar"} onPress={handleRegister} color="#00A09A" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#00A09A' },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 8, fontSize: 16, color: '#333' },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15 },
    passwordInput: { flex: 1, padding: 12, fontSize: 16, color: '#333' },
    eyeIcon: { padding: 10 },
});
