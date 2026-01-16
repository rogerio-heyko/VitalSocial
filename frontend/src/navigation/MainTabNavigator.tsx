import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ReadingPlanScreen from '../screens/ReadingPlanScreen';
import DonationScreen from '../screens/DonationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GradientHeader from '../components/GradientHeader';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
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
                    } else {
                        iconName = 'alert';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#00A09A', // Brand Teal
                tabBarInactiveTintColor: '#C9D193', // Brand Yellow (muted)
                header: ({ navigation, route, options }) => {
                    const title = options.title !== undefined ? options.title : route.name;
                    return <GradientHeader title={title} showBack={false} showLogo={true} />;
                },
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 10,
                    height: Platform.OS === 'android' ? 120 : 130, // Higher menu to lift icons
                    paddingBottom: Platform.OS === 'android' ? 50 : 50, // Icons start 72px from bottom (approx with padding)
                    paddingTop: 10,
                    backgroundColor: '#fff',
                }
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Início',
                    // HomeScreen has its own header implementation inside specific to "Hello User",
                    // but we can remove that and use the standard one or keep it custom.
                    // Let's keep it custom for Home for now to avoid breaking the "Olá user" layout,
                    // but we can add the gradient header if needed.
                }}
            />
            <Tab.Screen
                name="Reading"
                component={ReadingPlanScreen}
                options={{ title: 'Leitura' }}
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
