import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

export default function ActivityDetailsScreen({ route }: any) {
    const { activityId, activity } = route.params;

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32, paddingTop: 64, paddingBottom: 64, backgroundColor: '#fff' }}>
            <Image source={{ uri: activity.image }} style={styles.image} />
            <Text style={styles.title}>Detalhes da Atividade</Text>
            <Text>ID: {activityId}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold' }
});
