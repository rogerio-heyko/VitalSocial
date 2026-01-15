import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { RootStackParamList } from '../routes/Routes';

type ClassReportRouteProp = RouteProp<RootStackParamList, 'ClassReport'>;

interface Inscricao {
    id: string; // Inscricao ID
    aluno: {
        id: string;
        nome: string;
    };
    presente?: boolean; // UI state
}

export default function ClassReportScreen() {
    const route = useRoute<ClassReportRouteProp>();
    const navigation = useNavigation();
    const { atividadeId, turmaId, titulo } = route.params as any; // Cast to any to accept turmaId

    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [students, setStudents] = useState<Inscricao[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    async function loadStudents() {
        try {
            let data: Inscricao[] = [];

            if (turmaId) {
                // Fetch Turma Details which includes inscricoes
                const response = await api.get(`/turmas/${turmaId}`);
                // response.data.inscricoes -> list
                if (response.data.inscricoes) {
                    data = response.data.inscricoes.map((item: any) => ({
                        ...item,
                        presente: true
                    }));
                }
            } else {
                // Legacy Fallback for direct Activity
                const response = await api.get(`/atividades/${atividadeId}/inscritos`);
                data = response.data.map((item: any) => ({
                    ...item,
                    presente: true
                }));
            }

            setStudents(data);
        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Falha ao carregar alunos.');
        } finally {
            setLoading(false);
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted === false) {
            Alert.alert("É necessário permissão para usar a câmera.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    async function handleSubmit() {
        if (!description) {
            Alert.alert('Atenção', 'Escreva um breve texto sobre a aula.');
            return;
        }
        if (!image) {
            Alert.alert('Atenção', 'É obrigatório incluir uma foto da aula.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('atividadeId', atividadeId);
            if (turmaId) formData.append('turmaId', turmaId);
            formData.append('dataAula', new Date().toISOString());
            formData.append('descricao', description);

            // Build attendance list
            // Each item: { inscricaoId, presente }
            const presencas = students.map(s => ({
                inscricaoId: s.id,
                presente: s.presente
            }));
            formData.append('presencas', JSON.stringify(presencas));

            // Append Image
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            // @ts-ignore
            formData.append('foto', { uri: image, name: filename, type });

            await api.post('/relatorios', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Sucesso', 'Relatório enviado!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Falha ao enviar relatório.');
        } finally {
            setSubmitting(false);
        }
    }

    function toggleAttendance(id: string) {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, presente: !s.presente } : s
        ));
    }

    if (loading) return <ActivityIndicator className="flex-1" size="large" color="#00A09A" />;

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-xl font-bold text-gray-800 mb-4">{titulo}</Text>

                <Text className="text-base font-semibold text-gray-700 mb-2">1. Foto da Aula</Text>
                <View className="flex-row mb-4">
                    <TouchableOpacity onPress={takePhoto} className="bg-teal-600 p-3 rounded-lg mr-2 flex-1 items-center">
                        <Ionicons name="camera" size={24} color="#fff" />
                        <Text className="text-white mt-1">Câmera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage} className="bg-gray-200 p-3 rounded-lg flex-1 items-center">
                        <Ionicons name="images" size={24} color="#333" />
                        <Text className="text-gray-700 mt-1">Galeria</Text>
                    </TouchableOpacity>
                </View>

                {image && (
                    <Image source={{ uri: image }} className="w-full h-48 rounded-lg mb-4" resizeMode="cover" />
                )}

                <Text className="text-base font-semibold text-gray-700 mb-2">2. Resumo da Aula</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 h-24 mb-4 text-base"
                    multiline
                    placeholder="O que foi ensinado hoje?"
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                />

                <Text className="text-base font-semibold text-gray-700 mb-2">3. Chamada ({students.filter(s => s.presente).length} presentes)</Text>
                <View className="bg-gray-50 rounded-lg p-2 mb-6">
                    {students.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => toggleAttendance(item.id)}
                            className="flex-row items-center justify-between p-3 border-b border-gray-200"
                        >
                            <Text className="text-gray-800 text-base">{item.aluno.nome}</Text>
                            <View className={`w-6 h-6 rounded border ${item.presente ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'} items-center justify-center`}>
                                {item.presente && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    className={`p-4 rounded-xl items-center mb-10 ${submitting ? 'bg-gray-400' : 'bg-teal-600'}`}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Enviar Relatório</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
