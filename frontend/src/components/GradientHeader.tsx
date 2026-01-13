import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface GradientHeaderProps {
    title?: string;
    showBack?: boolean;
    showLogo?: boolean;
}

export default function GradientHeader({ title, showBack = false, showLogo = true }: GradientHeaderProps) {
    const navigation = useNavigation();

    return (
        <LinearGradient
            colors={['#00A09A', '#8BC441']} // Brand Teal to Green
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {showBack && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {showLogo && (
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Image
                                source={require('../../assets/icone_abasuperior.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    {title && !showLogo && <Text style={styles.title}>{title}</Text>}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        paddingBottom: 10,
    },
    safeArea: {
        width: '100%',
    },
    content: {
        height: 80, // Increased height to accommodate larger logo
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
        padding: 8,
    },
    logo: {
        width: 70,
        height: 70,
        // borderRadius: 35, // Removed, now using transparent PNG
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
