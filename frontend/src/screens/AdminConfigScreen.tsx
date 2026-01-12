import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../contexts/AuthContext';

export default function AdminConfigScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();

    if (user?.tipo !== 'ADMIN') {
        return (
            <View style={styles.container}>
                <Text>Acesso negado.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Painel do Administrador</Text>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AdminUsers')}
            >
                <Text style={styles.cardTitle}>👥 Gestão de Equipe</Text>
                <Text style={styles.cardDesc}>Gerenciar cargos (Diretoria, Funcionários) e permissões.</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AdminProjects')}
            >
                <Text style={styles.cardTitle}>📂 Projetos Sociais</Text>
                <Text style={styles.cardDesc}>Criar projetos e configurar chaves PIX/Crypto.</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => { }} // Futuro: Relatórios
            >
                <Text style={styles.cardTitle}>📊 Relatórios (Em breve)</Text>
                <Text style={styles.cardDesc}>Visualizar estatísticas de doações e atividades.</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
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
