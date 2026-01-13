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
import MainTabNavigator from './MainTabNavigator';
import GradientHeader from '../components/GradientHeader';
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
    ProfessorDashboard: undefined;
    ClassReport: { atividadeId: string; titulo: string };
    MainTabs: undefined;
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
                        <Stack.Group screenOptions={{
                            headerShown: true,
                            header: ({ navigation, route, options }) => {
                                const title = options.title !== undefined ? options.title : route.name;
                                return <GradientHeader title={title} showBack={true} showLogo={true} />;
                            }
                        }}>
                            <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />

                            {/* Telas que ficam POR CIMA das abas (sem Bottom Tabs) */}
                            <Stack.Screen name="AdminConfig" component={AdminConfigScreen} options={{ title: 'Configurações' }} />
                            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Gestão de Equipe' }} />
                            <Stack.Screen name="AdminProjects" component={AdminProjectsScreen} options={{ title: 'Projetos' }} />
                            <Stack.Screen name="AdminProjects" component={AdminProjectsScreen} options={{ title: 'Projetos' }} />
                            <Stack.Screen name="ActivityDetails" component={ActivityDetailsScreen} options={{ title: 'Detalhes' }} />

                            {/* Professor Flow */}
                            <Stack.Screen name="ProfessorDashboard" component={require('../screens/ProfessorDashboardScreen').default} options={{ title: 'Minhas Turmas' }} />
                            <Stack.Screen name="ClassReport" component={require('../screens/ClassReportScreen').default} options={{ title: 'Relatório de Aula' }} />
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
