import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, TouchableOpacity } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import ReadingPlanScreen from '../screens/ReadingPlanScreen';
import DonationScreen from '../screens/DonationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StudentScanScreen from '../screens/StudentScanScreen';
import GradientHeader from '../components/GradientHeader';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

// Custom Center Button
const CustomTabBarButton = ({ children, onPress }: any) => (
    <TouchableOpacity
        style={{
            top: -20,
            justifyContent: 'center',
            alignItems: 'center',
        }}
        onPress={onPress}
    >
        <View style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#00A09A', // Brand Teal
            borderWidth: 4,
            borderColor: '#f5f5f5', // Match background
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {children}
        </View>
    </TouchableOpacity>
);

export default function MainTabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Reading') {
                        iconName = focused ? 'book' : 'book-outline';
                    } else if (route.name === 'Donation') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Scan') {
                        return <Ionicons name="qr-code" size={32} color="#fff" />;
                    } else {
                        iconName = 'alert';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: '#C9D193', // Brand Yellow (muted)
                header: ({ navigation, route, options }) => {
                    if (route.name === 'Scan') return null; // No header for scan
                    const title = options.title !== undefined ? options.title : route.name;
                    return <GradientHeader title={title} showBack={false} showLogo={true} />;
                },
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 10,
                    height: Platform.OS === 'android' ? 60 + insets.bottom : 70 + insets.bottom,
                    paddingBottom: Math.max(insets.bottom, 10), // Ensures at least 10px even if inset is 0

                    paddingTop: 10,
                    backgroundColor: '#fff',
                },
                tabBarShowLabel: true,
                tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' }
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Início' }}
            />
            <Tab.Screen
                name="Reading"
                component={ReadingPlanScreen}
                options={{ title: 'Leitura' }}
            />

            {/* Center Scan Button */}
            <Tab.Screen
                name="Scan"
                component={StudentScanScreen}
                options={{
                    title: '',
                    tabBarLabel: '',
                    tabBarButton: (props) => (
                        <CustomTabBarButton {...props}>
                            <Ionicons name="qr-code" size={32} color="#fff" />
                        </CustomTabBarButton>
                    ),
                    tabBarStyle: { display: 'none' } // Hide tab bar when on Scan screen if desired, or keep it.
                    // Actually, for a modal-like feel, hiding tab bar is good, but navigating back handles it.
                    // Let's keep it simple.
                }}
            />

            <Tab.Screen
                name="Donation"
                component={DonationScreen}
                options={{ title: 'Doar' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Perfil' }}
            />
        </Tab.Navigator>
    );
}
