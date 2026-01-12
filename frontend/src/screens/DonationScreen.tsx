import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import api from '../services/api';

export default function DonationScreen() {
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
        if (metodo === 'CRIPTO' && !wallets) {
            fetchWallets();
        }
    }, [metodo]);

    const fetchWallets = async () => {
        try {
            const res = await api.get('/doacoes/crypto');
            setWallets(res.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar carteiras');
        }
    };

    const gerarPix = async () => {
        if (!valor) return Alert.alert('Atenção', 'Digite um valor');
        setLoading(true);
        try {
            const res = await api.post('/doacoes/pix', { valor: parseFloat(valor.replace(',', '.')) });
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

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Faça sua Doação</Text>
            <Text style={styles.subtitle}>Escolha como deseja contribuir</Text>

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
                    <Text style={styles.label}>Valor (R$)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="0,00"
                        value={valor}
                        onChangeText={setValor}
                    />

                    {!pixPayload && (
                        <TouchableOpacity style={styles.button} onPress={gerarPix} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Gerar QR Code</Text>}
                        </TouchableOpacity>
                    )}

                    {pixPayload ? (
                        <View style={styles.resultContainer}>
                            <QRCode value={pixPayload} size={200} />
                            <Text style={styles.instructions}>{qrCodeInstructions}</Text>
                            <TouchableOpacity style={styles.copyButton} onPress={() => copiarCodigo(pixPayload)}>
                                <Text style={styles.copyButtonText}>Copiar Código PIX</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.newButton} onPress={() => setPixPayload('')}>
                                <Text style={styles.newButtonText}>Nova Doação</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            ) : (
                <View style={styles.content}>
                    <Text style={styles.label}>Selecione a Moeda</Text>
                    <View style={styles.coinSelector}>
                        {['BTC', 'ETH', 'USDT'].map(coin => (
                            <TouchableOpacity
                                key={coin}
                                style={[styles.coinButton, selectedCoin === coin && styles.activeCoin]}
                                onPress={() => setSelectedCoin(coin)}
                            >
                                <Text style={[styles.coinText, selectedCoin === coin && styles.activeCoinText]}>{coin}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {wallets && (
                        <View style={styles.walletContainer}>
                            <Text style={styles.walletLabel}>Endereço da Carteira ({selectedCoin}):</Text>
                            <View style={styles.walletBox}>
                                <Text style={styles.walletAddress}>{wallets[selectedCoin]}</Text>
                            </View>
                            <TouchableOpacity style={styles.copyButton} onPress={() => copiarCodigo(wallets[selectedCoin])}>
                                <Text style={styles.copyButtonText}>Copiar Endereço</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
    tabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#e0e0e0', borderRadius: 8, padding: 4 },
    tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 6 },
    activeTab: { backgroundColor: '#4a90e2' },
    tabText: { fontWeight: '600', color: '#666' },
    activeTabText: { color: '#FFF' },
    content: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 2 },
    label: { fontSize: 16, marginBottom: 8, fontWeight: '600', color: '#333' },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 20 },
    button: { backgroundColor: '#00C853', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    resultContainer: { alignItems: 'center', marginTop: 20 },
    instructions: { textAlign: 'center', marginVertical: 15, color: '#666' },
    copyButton: { backgroundColor: '#4a90e2', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
    copyButtonText: { color: '#FFF', fontWeight: 'bold' },
    newButton: { marginTop: 15 },
    newButtonText: { color: '#666' },
    coinSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    coinButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', marginHorizontal: 4, borderRadius: 8 },
    activeCoin: { backgroundColor: '#333', borderColor: '#333' },
    coinText: { fontWeight: 'bold', color: '#333' },
    activeCoinText: { color: '#FFF' },
    walletContainer: { alignItems: 'center' },
    walletLabel: { marginBottom: 10, fontSize: 14, color: '#666' },
    walletBox: { backgroundColor: '#F0F0F0', padding: 15, borderRadius: 8, width: '100%', marginBottom: 15 },
    walletAddress: { fontFamily: 'monospace', textAlign: 'center', fontSize: 12 }
});
