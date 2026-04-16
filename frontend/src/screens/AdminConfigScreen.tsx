import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminConfigScreen() {
    const { t } = useLanguage();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();

    if (user?.tipo !== 'ADMIN') {
        return (

            <View className="flex-1 justify-center items-center bg-white">
                <Text>Acesso negado.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100 px-8 pt-16 pb-16">
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AdminUsers')}
            >
                <Text style={styles.cardTitle}>{t('teamManagement')}</Text>
                <Text style={styles.cardDesc}>{t('manageRoles')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AdminProjects')}
            >
                <Text style={styles.cardTitle}>{t('socialProjects')}</Text>
                <Text style={styles.cardDesc}>Gerenciar Projetos, Atividades e Turmas</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AdminWaitlist')}
            >
                <Text style={styles.cardTitle}>Lista de Espera</Text>
                <Text style={styles.cardDesc}>Gerenciar beneficiários no cadastro de reserva</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => { }} // Futuro: Relatórios
            >
                <Text style={styles.cardTitle}>{t('reportsAdmin')}</Text>
                <Text style={styles.cardDesc}>{t('viewStats')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#4a90e2', marginBottom: 5 },
    cardDesc: { color: '#666', fontSize: 14 }
});
