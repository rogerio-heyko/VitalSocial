import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ActivityCardProps {
    title: string;
    type: string;
    date: string;
    isEnrolled?: boolean;
    onPress: () => void;
}

export default function ActivityCard({ title, type, date, isEnrolled, onPress }: ActivityCardProps) {
    const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.type}>{type}</Text>
                {isEnrolled && <Text style={styles.enrolledBadge}>Inscrito</Text>}
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.date}>{formattedDate}</Text>

            <TouchableOpacity
                style={[styles.button, isEnrolled ? styles.buttonOutline : styles.buttonPrimary]}
                onPress={onPress}
            >
                <Text style={[styles.buttonText, isEnrolled ? styles.textOutline : styles.textPrimary]}>
                    {isEnrolled ? 'Ver Detalhes' : 'Inscrever-se'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 4, // for carousel spacing
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    type: { fontSize: 12, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' },
    enrolledBadge: { fontSize: 10, color: '#fff', backgroundColor: '#4CAF50', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#333' },
    date: { fontSize: 14, color: '#666', marginBottom: 16 },
    button: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonPrimary: { backgroundColor: '#000' },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#000' },
    buttonText: { fontWeight: '600' },
    textPrimary: { color: '#fff' },
    textOutline: { color: '#000' }
});
