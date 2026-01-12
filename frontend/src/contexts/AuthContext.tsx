import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
    id: string;
    nome: string;
    email: string;
    tipo: string;
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    signIn: (email: string, senha: string) => Promise<void>;
    signOut: () => Promise<void>;
    signUp: (nome: string, email: string, senha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const storedToken = await SecureStore.getItemAsync('teleios_token');
            const storedUser = await SecureStore.getItemAsync('teleios_user');

            if (storedToken && storedUser) {
                api.defaults.headers.Authorization = `Bearer ${storedToken}`;
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        }

        loadStorageData();
    }, []);

    async function signIn(email: string, senha: string) {
        const response = await api.post('/auth/login', { email, senha });
        const { token, usuario } = response.data;

        api.defaults.headers.Authorization = `Bearer ${token}`;

        await SecureStore.setItemAsync('teleios_token', token);
        await SecureStore.setItemAsync('teleios_user', JSON.stringify(usuario));

        setUser(usuario);
    }

    async function signUp(nome: string, email: string, senha: string) {
        await api.post('/auth/registrar', { nome, email, senha });
        // Optional: automatically sign in after sign up
    }

    async function signOut() {
        await SecureStore.deleteItemAsync('teleios_token');
        await SecureStore.deleteItemAsync('teleios_user');
        api.defaults.headers.Authorization = null;
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
