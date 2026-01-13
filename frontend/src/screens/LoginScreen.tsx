import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (loading) return;

        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-white justify-center px-8 pt-16 pb-16">
            <View style={styles.logoContainer}>
                <Image source={require('../../assets/logo.jpg')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.tagline}>{t('tagline')}</Text>

            <TextInput
                style={styles.input}
                placeholder={t('email')}
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{t('login')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotButton}>
                <Text style={styles.forgotButtonText}>{t('forgotPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerButtonText}>{t('register')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logo: { width: '100%', height: 120, marginBottom: 10 },
    tagline: { fontSize: 14, color: colors.secondary, textAlign: 'center', marginBottom: 30, fontStyle: 'italic' },
    input: { width: '100%', height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, backgroundColor: colors.white, fontSize: 16, color: colors.text },
    loginButton: { width: '100%', height: 50, backgroundColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 2 },
    registerButton: { width: '100%', height: 50, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
    registerButtonText: { color: colors.primary, fontSize: 18, fontWeight: 'bold' },
    forgotButton: { marginBottom: 20, alignItems: 'center' },
    forgotButtonText: { color: colors.textLight, fontSize: 16 }
});
