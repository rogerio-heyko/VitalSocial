import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }: any) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
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
        <View style={styles.container}>
            <Text style={styles.title}>Criar Conta</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />
            <Button title={loading ? "Criando..." : "Cadastrar"} onPress={handleRegister} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
});
