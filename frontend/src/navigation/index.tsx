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
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import DonorOnboardingScreen from '../screens/DonorOnboardingScreen';
import BeneficiaryOnboardingScreen from '../screens/BeneficiaryOnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ActivityDetailsScreen from '../screens/ActivityDetailsScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminProjectsScreen from '../screens/AdminProjectsScreen';
import { View, Text, Button, StyleSheet } from 'react-native';

export type RootStackParamList = {
    auth: undefined;
    app: undefined;
    Login: undefined;
    Register: undefined;
    EmailVerification: { email: string };
    ForgotPassword: undefined;
    ResetPassword: { email: string };
    RoleSelection: undefined;
    DonorOnboarding: undefined;
    BeneficiaryOnboarding: undefined;
    Home: undefined;
    ReadingPlan: undefined;
    Profile: undefined;
    Donation: undefined;
    AdminConfig: undefined;
    AdminUsers: undefined;
    AdminProjects: undefined;
    ActivityDetails: { activityId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();



// HomeScreen logic moved to separate file

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
                    user.tipo === 'INDEFINIDO' ? (
                        /* Stack para Novos Usuários (Sem Role) */
                        <Stack.Group>
                            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                            <Stack.Screen name="DonorOnboarding" component={DonorOnboardingScreen} options={{ title: 'Doador', headerShown: true }} />
                            <Stack.Screen name="BeneficiaryOnboarding" component={BeneficiaryOnboardingScreen} options={{ title: 'Beneficiário', headerShown: true }} />
                        </Stack.Group>
                    ) : (
                        /* Stack Principal (Usuários com Role definida) */
                        <Stack.Group>
                            <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen name="ReadingPlan" component={ReadingPlanScreen} options={{ headerShown: true, title: 'Leitura Bíblica' }} />
                            <Stack.Screen name="Profile" component={ProfileScreen} />
                            <Stack.Screen name="Donation" component={DonationScreen} />
                            <Stack.Screen name="AdminConfig" component={AdminConfigScreen} />
                            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Gestão de Usuários' }} />
                            <Stack.Screen name="AdminProjects" component={AdminProjectsScreen} options={{ title: 'Gestão de Projetos' }} />
                            <Stack.Screen name="ActivityDetails" component={ActivityDetailsScreen} />
                            {/* Permite acessar Onboarding caso precise editar (opcional) ou criar rotas de edição separadas */}
                        </Stack.Group>
                    )
                ) : (
                    /* Stack de Autenticação */
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
