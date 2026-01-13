import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../routes/Routes'; // Ensure this matches actual location

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfessorDashboard'>;

interface Atividade {
    id: string;
    titulo: string;
    tipo: string;
    dataHora: string;
}

export default function ProfessorDashboardScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuth();
    const [activities, setActivities] = useState<Atividade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, []);

    async function loadActivities() {
        try {
            // Assuming this endpoint returns activities where user is professor
            const response = await api.get('/atividades/minhas');
            setActivities(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const renderItem = ({ item }: { item: Atividade }) => (
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
            <View>
                <Text className="text-lg font-bold text-gray-800">{item.titulo}</Text>
                <Text className="text-gray-500">{new Date(item.dataHora).toLocaleDateString()} - {item.tipo}</Text>
            </View>
            <TouchableOpacity
                className="bg-teal-600 px-4 py-2 rounded-lg flex-row items-center"
                onPress={() => navigation.navigate('ClassReport', { atividadeId: item.id, titulo: item.titulo })}
            >
                <Ionicons name="document-text-outline" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">Relatório</Text>
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
                    data={activities}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text className="text-gray-400 text-center mt-10">Nenhuma atividade encontrada.</Text>}
                />
            )}
        </View>
    );
}
