import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [name, setName] = useState(user?.nome || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { language, setLanguage, t } = useLanguage();

    async function handleSave() {
        if (loading) return;
        setLoading(true);
        try {
            Alert.alert('Aviso', 'Funcionalidade de editar dados básicos (Nome/Senha) será implementada na próxima fase de Backend. Por enquanto, gerencie seus detalhes de Benficiário/Doador.');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        Alert.alert(
            t('logoutConfirmTitle'),
            t('logoutConfirmMessage'),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('logout'), style: 'destructive', onPress: signOut }
            ]
        );
    }

    return (
        <View className="flex-1 bg-gray-100 px-8 pt-16 pb-16">
            <View className="items-center mb-10 mt-10">
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.nome?.charAt(0)}</Text>
                </View>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.role}>{user?.tipo}</Text>
            </View>

            <View style={styles.form}>

                {/* Language Selector */}
                <View style={styles.languageContainer}>
                    <Text style={[styles.label, { marginBottom: 0 }]}>{t('language')}</Text>
                    <View style={styles.languageOptions}>
                        <TouchableOpacity onPress={() => setLanguage('pt-BR')} style={[styles.langButton, language === 'pt-BR' && styles.langButtonActive]}>
                            <Text style={styles.langText}>🇧🇷</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setLanguage('pt-PT')} style={[styles.langButton, language === 'pt-PT' && styles.langButtonActive]}>
                            <Text style={styles.langText}>🇵🇹</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setLanguage('es')} style={[styles.langButton, language === 'es' && styles.langButtonActive]}>
                            <Text style={styles.langText}>🇪🇸</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setLanguage('en')} style={[styles.langButton, language === 'en' && styles.langButtonActive]}>
                            <Text style={styles.langText}>🇺🇸</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.divider} />

                <Text style={styles.label}>{t('name')}</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>{t('newPassword')}</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder={t('leaveBlank')}
                />

                <TouchableOpacity className="bg-[#8BC441] p-4 rounded-lg items-center mt-8" onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>}
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Donation')}>
                    <Text style={styles.actionButtonText}>{t('donate')}</Text>
                </TouchableOpacity>

                {(user?.tipo === 'ADMIN' || user?.tipo === 'STAFF') && (
                    <>
                        <TouchableOpacity style={[styles.actionButton, styles.adminButton]} onPress={() => navigation.navigate('AdminConfig')}>
                            <Text style={styles.actionButtonText}>{t('adminConfig')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#EF5825' }]} onPress={() => navigation.navigate('ProfessorDashboard')}>
                            <Text style={styles.actionButtonText}>Minhas Turmas (Prof)</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>{t('logout')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    email: { fontSize: 16, color: '#666' },
    role: { fontSize: 14, color: '#999', marginTop: 4, fontWeight: 'bold' },
    form: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
    label: { color: '#333', marginBottom: 6, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 16, backgroundColor: '#fafafa' },
    saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    divider: { height: 1, backgroundColor: '#DDD', marginVertical: 20 },
    actionButton: { backgroundColor: '#00A09A', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 }, // Brand Teal
    adminButton: { backgroundColor: '#333' }, // Keep Dark for Admin? Or use Brand Teal/Orange? Let's use darker brand or keep Black as distinct
    actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    logoutButton: { marginTop: 10, padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#EE282F' }, // Brand Red
    logoutButtonText: { color: '#EE282F', fontWeight: 'bold', fontSize: 16 },
    languageContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    languageOptions: { flexDirection: 'row' },
    langButton: { padding: 8, borderRadius: 8, marginLeft: 8, backgroundColor: '#f0f0f0' },
    langButtonActive: { backgroundColor: '#e0f7fa', borderWidth: 1, borderColor: '#00A09A' },
    langText: { fontSize: 20 }
});
