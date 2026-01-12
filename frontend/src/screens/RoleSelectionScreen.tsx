import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../contexts/AuthContext';

import { useLanguage } from '../contexts/LanguageContext';

export default function RoleSelectionScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { signOut } = useAuth();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/logo.jpg')} style={styles.logo} resizeMode="contain" />

            <Text style={styles.title}>{t('welcomeTitle')}</Text>
            <Text style={styles.subtitle}>Para continuar, escolha como você deseja participar da nossa comunidade:</Text>

            <TouchableOpacity
                style={[styles.card, styles.donorCard]}
                onPress={() => navigation.navigate('DonorOnboarding')}
            >
                <Text style={styles.cardTitle}>Quero Doar ❤️</Text>
                <Text style={styles.cardDescription}>
                    Contribua mensalmente para manter nossas obras sociais e atividades.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.card, styles.beneficiaryCard]}
                onPress={() => navigation.navigate('BeneficiaryOnboarding')}
            >
                <Text style={[styles.cardTitle, { color: '#333' }]}>Preciso de Apoio 🤝</Text>
                <Text style={[styles.cardDescription, { color: '#555' }]}>
                    Cadastre-se para participar das atividades e receber suporte.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    logo: { width: 120, height: 120, marginBottom: 20 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
    card: {
        width: '100%',
        padding: 25,
        borderRadius: 15,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    donorCard: { backgroundColor: '#4a90e2' }, // Blue
    beneficiaryCard: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' }, // Light Gray
    cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    cardDescription: { fontSize: 14, color: '#eef', lineHeight: 20 },
    logoutButton: { marginTop: 30, padding: 10 },
    logoutText: { color: '#999', fontSize: 16 }
});
