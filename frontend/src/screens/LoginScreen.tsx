import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (loading) return;
        setLoading(true);
        try {
            await signIn(email, password);
        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title={loading ? "Carregando..." : "Entrar"} onPress={handleLogin} />
            <Button title="Criar conta" onPress={() => navigation.navigate('Register')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    logo: { width: '100%', height: 100, marginBottom: 30 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
});
