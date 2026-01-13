import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import api from '../services/api';

interface Project {
    id: string;
    nome: string;
    descricao?: string;
}

import { useLanguage } from '../contexts/LanguageContext';

export default function DonationScreen() {
    const { t } = useLanguage();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [pickingProject, setPickingProject] = useState(false);

    const [valor, setValor] = useState('');
    const [metodo, setMetodo] = useState<'PIX' | 'CRIPTO'>('PIX');
    const [loading, setLoading] = useState(false);

    // PIX State
    const [pixPayload, setPixPayload] = useState('');
    const [qrCodeInstructions, setQrInstructions] = useState('');

    // Crypto State
    const [wallets, setWallets] = useState<any>(null);
    const [selectedCoin, setSelectedCoin] = useState('BTC');

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        // Reset states when project changes
        setPixPayload('');
        setWallets(null);
        if (metodo === 'CRIPTO') {
            fetchWallets();
        }
    }, [selectedProject, metodo]);

    async function loadProjects() {
        try {
            const res = await api.get('/projetos');
            setProjects(res.data);
            if (res.data.length > 0) {
                setSelectedProject(res.data[0]); // Default to first
            }
        } catch (error) {
            console.error('Falha ao carregar projetos', error);
        }
    }

    const fetchWallets = async () => {
        try {
            const params = selectedProject ? { projetoId: selectedProject.id } : {};
            const res = await api.get('/doacoes/crypto', { params });
            setWallets(res.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar carteiras');
        }
    };

    const gerarPix = async () => {
        if (!valor) return Alert.alert('Atenção', 'Digite um valor');
        setLoading(true);
        try {
            const body = {
                valor: parseFloat(valor.replace(',', '.')),
                projetoId: selectedProject?.id
            };
            const res = await api.post('/doacoes/pix', body);
            setPixPayload(res.data.payloadPix);
            setQrInstructions(res.data.qrCodeInstructions);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao gerar PIX');
        } finally {
            setLoading(false);
        }
    };

    const copiarCodigo = (texto: string) => {
        Clipboard.setStringAsync(texto);
        Alert.alert('Copiado!', 'Código copiado para a área de transferência.');
    };

    const renderProjectItem = ({ item }: { item: Project }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setSelectedProject(item);
                setPickingProject(false);
            }}
        >
            <Text style={styles.modalItemText}>{item.nome}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{t('donateTitle')}</Text>

            <Text style={styles.label}>{t('destinedTo')}</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setPickingProject(true)}>
                <Text style={styles.pickerText}>
                    {selectedProject ? selectedProject.nome : t('selectProject')}
                </Text>
                <Text>▼</Text>
            </TouchableOpacity>

            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, metodo === 'PIX' && styles.activeTab]} onPress={() => setMetodo('PIX')}>
                    <Text style={[styles.tabText, metodo === 'PIX' && styles.activeTabText]}>PIX</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, metodo === 'CRIPTO' && styles.activeTab]} onPress={() => setMetodo('CRIPTO')}>
                    <Text style={[styles.tabText, metodo === 'CRIPTO' && styles.activeTabText]}>Cripto</Text>
                </TouchableOpacity>
            </View>

            {metodo === 'PIX' ? (
                <View style={styles.content}>
                    <Text style={styles.label}>{t('amount')}</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="0,00"
                        value={valor}
                        onChangeText={setValor}
                    />

                    {!pixPayload && (
                        <TouchableOpacity style={styles.button} onPress={gerarPix} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('generateQRCode')}</Text>}
                        </TouchableOpacity>
                    )}

                    {pixPayload ? (
                        <View style={styles.resultContainer}>
                            <QRCode value={pixPayload} size={200} />
                            <Text style={styles.instructions}>{qrCodeInstructions}</Text>
                            <TouchableOpacity style={styles.copyButton} onPress={() => copiarCodigo(pixPayload)}>
                                <Text style={styles.copyButtonText}>{t('copyPix')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.newButton} onPress={() => setPixPayload('')}>
                                <Text style={styles.newButtonText}>{t('newDonation')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            ) : (
                <View style={styles.content}>
                    <Text style={styles.label}>{t('selectCoin')}</Text>
                    <View style={styles.coinSelector}>
                        {[
                            { code: 'BTC', label: 'BTC (Bitcoin)' },
                            { code: 'ETH', label: 'ETH (Ethereum)' },
                            { code: 'USDT', label: 'USDT (Polygon)' }
                        ].map(coin => (
                            <TouchableOpacity
                                key={coin.code}
                                style={[styles.coinButton, selectedCoin === coin.code && styles.activeCoin]}
                                onPress={() => setSelectedCoin(coin.code)}
                            >
                                <Text style={[styles.coinText, selectedCoin === coin.code && styles.activeCoinText]}>{coin.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {wallets && (
                        <View style={styles.walletContainer}>
                            <Text style={styles.walletLabel}>{t('walletAddress')} ({selectedCoin}):</Text>
                            <View style={styles.walletBox}>
                                <Text style={styles.walletAddress}>{wallets[selectedCoin]}</Text>
                            </View>
                            <TouchableOpacity style={styles.copyButton} onPress={() => copiarCodigo(wallets[selectedCoin])}>
                                <Text style={styles.copyButtonText}>{t('copyAddress')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Modal de Seleção de Projeto */}
            <Modal visible={pickingProject} animationType="fade" transparent>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setPickingProject(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecione o Projeto</Text>
                        <FlatList
                            data={projects}
                            keyExtractor={item => item.id}
                            renderItem={renderProjectItem}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
}

import { colors } from '../theme/colors';

// ... (imports remain the same)

// ... (component logic remains the same)

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 64, paddingBottom: 64, backgroundColor: colors.background },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: colors.text },
    pickerButton: { backgroundColor: colors.white, padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, elevation: 1 },
    pickerText: { fontSize: 16, color: colors.text },
    tabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#e0e0e0', borderRadius: 8, padding: 4 },
    tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 6 },
    activeTab: { backgroundColor: colors.primary },
    tabText: { fontWeight: '600', color: colors.textLight },
    activeTabText: { color: colors.white },
    content: { backgroundColor: colors.white, padding: 20, borderRadius: 12, elevation: 2 },
    label: { fontSize: 16, marginBottom: 8, fontWeight: '600', color: colors.text },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 20, color: colors.text },
    button: { backgroundColor: colors.success, padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
    resultContainer: { alignItems: 'center', marginTop: 20 },
    instructions: { textAlign: 'center', marginVertical: 15, color: colors.textLight },
    copyButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
    copyButtonText: { color: colors.white, fontWeight: 'bold' },
    newButton: { marginTop: 15 },
    newButtonText: { color: colors.textLight },
    coinSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    coinButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginHorizontal: 4, borderRadius: 8 },
    activeCoin: { backgroundColor: colors.text, borderColor: colors.text },
    coinText: { fontWeight: 'bold', color: colors.text },
    activeCoinText: { color: colors.white },
    walletContainer: { alignItems: 'center' },
    walletLabel: { marginBottom: 10, fontSize: 14, color: colors.textLight },
    walletBox: { backgroundColor: colors.background, padding: 15, borderRadius: 8, width: '100%', marginBottom: 15 },
    walletAddress: { fontFamily: 'monospace', textAlign: 'center', fontSize: 12, color: colors.text },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 40 },
    modalContent: { backgroundColor: colors.white, borderRadius: 10, padding: 20, maxHeight: 400 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: colors.text },
    modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalItemText: { fontSize: 16, color: colors.text }
});
