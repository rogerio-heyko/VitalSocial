import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface ActivityCardProps {
    title: string;
    type: string;
    date: string;
    isEnrolled?: boolean;
    onPress: () => void;
}

const ActivityCard = React.memo(function ActivityCard({ title, type, date, isEnrolled, onPress }: ActivityCardProps) {
    const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <View style={styles.card}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.type}>{type}</Text>
                    {isEnrolled && <Text style={styles.enrolledBadge}>Inscrito</Text>}
                </View>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.date}>{formattedDate}</Text>
            </View>

            <View style={styles.footerContainer}>
                <TouchableOpacity
                    style={[styles.button, isEnrolled ? styles.buttonOutline : styles.buttonPrimary]}
                    onPress={onPress}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.buttonText, isEnrolled ? styles.textOutline : styles.textPrimary]}>
                        {isEnrolled ? 'Ver Detalhes' : 'Inscrever-se'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default ActivityCard;

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
        marginHorizontal: 8, // for carousel spacing
        width: 280, // Fixed width for consistent horizontal scrolling
        minHeight: 200, // Ensure height is consistent
        flexDirection: 'column',
    },
    contentContainer: {
        flex: 1, // Takes up remaining space, pushing the footer down
    },
    footerContainer: {
        marginTop: 'auto',
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
    type: { fontSize: 12, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' },
    enrolledBadge: { fontSize: 10, color: '#fff', backgroundColor: colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#333' },
    date: { fontSize: 14, color: '#666', marginBottom: 16 },
    button: { minHeight: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    buttonPrimary: { backgroundColor: colors.primary },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    buttonText: { fontWeight: '600', fontSize: 16 },
    textPrimary: { color: '#fff' },
    textOutline: { color: colors.primary }
});

