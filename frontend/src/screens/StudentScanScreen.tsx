import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function StudentScanScreen() {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', marginBottom: 20 }}>Precisamos da sua permissão para usar a câmera.</Text>
                <Button onPress={requestPermission} title="Conceder Permissão" />
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        setLoading(true);

        try {
            // Send token to backend
            const response = await api.post('/relatorios/attendance', { token: data });

            Alert.alert(
                "Sucesso!",
                response.data.message || "Presença registrada.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao registrar presença.";
            Alert.alert("Erro", msg, [
                { text: "Tentar Novamente", onPress: () => { setScanned(false); setLoading(false); } }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>Escaneie o QR Code do Professor</Text>
                <View style={styles.scanFrame} />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Ionicons name="close-circle" size={48} color="#fff" />
            </TouchableOpacity>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Registrando...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 8
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00A09A', // Brand Teal
        borderRadius: 20,
        backgroundColor: 'transparent'
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
    },
    loadingOverlay: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 20,
        borderRadius: 10
    }
});
