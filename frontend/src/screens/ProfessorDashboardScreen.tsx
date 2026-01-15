import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../routes/Routes'; // Ensure this matches actual location

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfessorDashboard'>;

interface Turma {
    id: string;
    nome: string;
    atividadeId: string;
    atividade: {
        titulo: string;
        tipo: string;
    };
    _count: { inscricoes: number };
}

export default function ProfessorDashboardScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuth();
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyClasses();
    }, []);

    async function loadMyClasses() {
        try {
            const response = await api.get('/turmas/minhas');
            setTurmas(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const renderItem = ({ item }: { item: Turma }) => (
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
            <View>
                <Text className="text-lg font-bold text-gray-800">{item.nome}</Text>
                <Text className="text-gray-500">{item.atividade.titulo} ({item.atividade.tipo})</Text>
                <Text className="text-gray-400 text-xs mt-1">{item._count?.inscricoes || 0} alunos</Text>
            </View>
            <TouchableOpacity
                className="bg-teal-600 px-4 py-2 rounded-lg flex-row items-center"
                onPress={() => navigation.navigate('ClassReport', {
                    atividadeId: item.atividadeId,
                    turmaId: item.id,
                    titulo: `${item.atividade.titulo} - ${item.nome}`
                } as any)}
            >
                <Ionicons name="checkbox-outline" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">Chamada</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 p-4 pt-6">
            <Text className="text-2xl font-bold text-teal-700 mb-6">Minhas Turmas</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#00A09A" />
            ) : (
                <FlatList
                    data={turmas}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text className="text-gray-400 text-center mt-10">Nenhuma turma encontrada.</Text>}
                />
            )}
        </View>
    );
}
