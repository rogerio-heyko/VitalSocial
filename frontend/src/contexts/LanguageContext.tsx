import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'pt-BR' | 'pt-PT' | 'es' | 'en';

type Translations = {
    [key: string]: {
        'pt-BR': string;
        'pt-PT': string;
        'es': string;
        'en': string;
    };
};

const translations: Translations = {
    // Welcome Screen
    welcomeTitle: {
        'pt-BR': 'Bem-vindo ao Vital.Social!',
        'pt-PT': 'Bem-vindo ao Vital.Social!',
        'es': '¡Bienvenido a Vital.Social!',
        'en': 'Welcome to Vital.Social!'
    },
    // Auth / General
    email: {
        'pt-BR': 'Email',
        'pt-PT': 'Email',
        'es': 'Correo electrónico',
        'en': 'Email',
    },
    password: {
        'pt-BR': 'Senha',
        'pt-PT': 'Palavra-passe',
        'es': 'Contraseña',
        'en': 'Password',
    },
    login: {
        'pt-BR': 'Entrar',
        'pt-PT': 'Entrar',
        'es': 'Entrar',
        'en': 'Login',
    },
    register: {
        'pt-BR': 'Criar Conta',
        'pt-PT': 'Registar Conta',
        'es': 'Crear Cuenta',
        'en': 'Create Account',
    },
    forgotPassword: {
        'pt-BR': 'Esqueci minha senha',
        'pt-PT': 'Esqueci-me da palavra-passe',
        'es': 'Olvidé mi contraseña',
        'en': 'Forgot Password',
    },
    tagline: {
        'pt-BR': 'Conectando corações, construindo futuros',
        'pt-PT': 'A ligar corações, a construir futuros',
        'es': 'Conectando corazones, construyendo futuros',
        'en': 'Connecting hearts, building futures',
    },

    // Profile
    name: {
        'pt-BR': 'Nome',
        'pt-PT': 'Nome',
        'es': 'Nombre',
        'en': 'Name',
    },
    newPassword: {
        'pt-BR': 'Nova Senha (Opcional)',
        'pt-PT': 'Nova Palavra-passe (Opcional)',
        'es': 'Nueva Contraseña (Opcional)',
        'en': 'New Password (Optional)',
    },
    leaveBlank: {
        'pt-BR': 'Deixe em branco para manter',
        'pt-PT': 'Deixe em branco para manter',
        'es': 'Dejar en blanco para mantener',
        'en': 'Leave blank to keep current',
    },
    saveChanges: {
        'pt-BR': 'Salvar Alterações',
        'pt-PT': 'Guardar Alterações',
        'es': 'Guardar Cambios',
        'en': 'Save Changes',
    },
    donate: {
        'pt-BR': '🙏 Fazer Doação',
        'pt-PT': '🙏 Fazer Doação',
        'es': '🙏 Hacer Donación',
        'en': '🙏 Donate',
    },
    adminConfig: {
        'pt-BR': '⚙️ Configurações (Admin)',
        'pt-PT': '⚙️ Configurações (Admin)',
        'es': '⚙️ Configuraciones (Admin)',
        'en': '⚙️ Settings (Admin)',
    },
    logout: {
        'pt-BR': 'Sair do App',
        'pt-PT': 'Sair da App',
        'es': 'Cerrar Sesión',
        'en': 'Logout',
    },
    logoutConfirmTitle: {
        'pt-BR': 'Sair',
        'pt-PT': 'Sair',
        'es': 'Salir',
        'en': 'Logout',
    },
    logoutConfirmMessage: {
        'pt-BR': 'Tem certeza que deseja sair?',
        'pt-PT': 'Tem a certeza que deseja sair?',
        'es': '¿Estás seguro de que quieres salir?',
        'en': 'Are you sure you want to logout?',
    },
    cancel: {
        'pt-BR': 'Cancelar',
        'pt-PT': 'Cancelar',
        'es': 'Cancelar',
        'en': 'Cancel',
    },
    language: {
        'pt-BR': 'Idioma',
        'pt-PT': 'Idioma',
        'es': 'Idioma',
        'en': 'Language',
    }
};

interface LanguageContextData {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextData>({} as LanguageContextData);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('pt-BR');

    function t(key: string): string {
        const item = translations[key];
        if (!item) return key; // Return key if translation not found
        return item[language] || item['pt-BR'] || key;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
