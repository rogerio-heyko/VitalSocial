import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ReadingPlanScreen from '../screens/ReadingPlanScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DonationScreen from '../screens/DonationScreen';
import AdminConfigScreen from '../screens/AdminConfigScreen';
import ActivityDetailsScreen from '../screens/ActivityDetailsScreen';
import { View, Text, Button, StyleSheet } from 'react-native';

export type RootStackParamList = {
    auth: undefined;
    app: undefined;
    Login: undefined;
    Register: undefined;
    Home: undefined;
    ReadingPlan: undefined;
    Profile: undefined;
    Donation: undefined;
    AdminConfig: undefined;
    ActivityDetails: { activityId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen() {
    const { signOut, user } = useAuth();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo, {user?.nome}!</Text>
            <Text>Email: {user?.email}</Text>
            <Text>Tipo: {user?.tipo}</Text>
            <Button title="Sair" onPress={signOut} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 }
});

export default function Routes() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="ReadingPlan" component={ReadingPlanScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
