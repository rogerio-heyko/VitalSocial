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
    },
    readingPlanTitle: {
        'pt-BR': 'Plano de Leitura',
        'pt-PT': 'Plano de Leitura',
        'es': 'Plan de Lectura',
        'en': 'Reading Plan',
    },
    noPlanFound: {
        'pt-BR': 'Nenhum plano encontrado.',
        'pt-PT': 'Nenhum plano encontrado.',
        'es': 'Ningún plan encontrado.',
        'en': 'No plan found.',
    },
    loading: {
        'pt-BR': 'Carregando...',
        'pt-PT': 'A carregar...',
        'es': 'Cargando...',
        'en': 'Loading...',
    },
    readExcerpt: {
        'pt-BR': 'Ler Trecho (NVI)',
        'pt-PT': 'Ler Trecho (NVI)',
        'es': 'Leer Pasaje (NVI)',
        'en': 'Read Passage (NVI)',
    },
    day: {
        'pt-BR': 'Dia',
        'pt-PT': 'Dia',
        'es': 'Día',
        'en': 'Day',
    },
    reflection: {
        'pt-BR': 'Sobre esta fase:',
        'pt-PT': 'Sobre esta fase:',
        'es': 'Sobre esta fase:',
        'en': 'About this phase:',
    },
    today: {
        'pt-BR': 'Hoje',
        'pt-PT': 'Hoje',
        'es': 'Hoy',
        'en': 'Today',
    },
    todaysReading: {
        'pt-BR': 'Leitura de Hoje',
        'pt-PT': 'Leitura de Hoje',
        'es': 'Lectura de Hoy',
        'en': 'Today\'s Reading',
    },
    tapToRead: {
        'pt-BR': 'Toque para ler e refletir',
        'pt-PT': 'Toque para ler e refletir',
        'es': 'Toca para leer',
        'en': 'Tap to read',
    },
    hello: {
        'pt-BR': 'Olá',
        'pt-PT': 'Olá',
        'es': 'Hola',
        'en': 'Hello',
    },
    welcome: {
        'pt-BR': 'Bem-vindo ao Vital.Social',
        'pt-PT': 'Bem-vindo ao Vital.Social',
        'es': 'Bienvenido a Vital.Social',
        'en': 'Welcome to Vital.Social',
    },
    myInscriptions: {
        'pt-BR': 'Minhas Inscrições',
        'pt-PT': 'As Minhas Inscrições',
        'es': 'Mis Inscripciones',
        'en': 'My Inscriptions',
    },
    nextActivities: {
        'pt-BR': 'Próximas Atividades',
        'pt-PT': 'Próximas Atividades',
        'es': 'Próximas Actividades',
        'en': 'Upcoming Activities',
    },
    noActivities: {
        'pt-BR': 'Nenhuma atividade disponível.',
        'pt-PT': 'Nenhuma atividade disponível.',
        'es': 'No hay actividades.',
        'en': 'No activities available.',
    },
    // Donation Screen
    donateTitle: {
        'pt-BR': 'Faça sua Doação',
        'pt-PT': 'Faça a sua Doação',
        'es': 'Haz tu Donación',
        'en': 'Make your Donation',
    },
    destinedTo: {
        'pt-BR': 'Destinar para:',
        'pt-PT': 'Destinar a:',
        'es': 'Destinar a:',
        'en': 'Destined to:',
    },
    selectProject: {
        'pt-BR': 'Selecione um Projeto...',
        'pt-PT': 'Selecione um Projeto...',
        'es': 'Selecciona un Proyecto...',
        'en': 'Select a Project...',
    },
    amount: {
        'pt-BR': 'Valor (R$)',
        'pt-PT': 'Valor (€)',
        'es': 'Monto ($)',
        'en': 'Amount ($)',
    },
    generateQRCode: {
        'pt-BR': 'Gerar QR Code',
        'pt-PT': 'Gerar Código QR',
        'es': 'Generar Código QR',
        'en': 'Generate QR Code',
    },
    copyPix: {
        'pt-BR': 'Copiar Código PIX',
        'pt-PT': 'Copiar Código',
        'es': 'Copiar Código',
        'en': 'Copy Code',
    },
    newDonation: {
        'pt-BR': 'Nova Doação',
        'pt-PT': 'Nova Doação',
        'es': 'Nueva Donación',
        'en': 'New Donation',
    },
    selectCoin: {
        'pt-BR': 'Selecione a Moeda',
        'pt-PT': 'Selecione a Moeda',
        'es': 'Selecciona la Moneda',
        'en': 'Select Currency',
    },
    walletAddress: {
        'pt-BR': 'Endereço da Carteira',
        'pt-PT': 'Endereço da Carteira',
        'es': 'Dirección de la Billetera',
        'en': 'Wallet Address',
    },
    copyAddress: {
        'pt-BR': 'Copiar Endereço',
        'pt-PT': 'Copiar Endereço',
        'es': 'Copiar Dirección',
        'en': 'Copy Address',
    },
    // Admin Screen
    teamManagement: {
        'pt-BR': '👥 Gestão de Equipe',
        'pt-PT': '👥 Gestão de Equipa',
        'es': '👥 Gestión de Equipo',
        'en': '👥 Team Management',
    },
    manageRoles: {
        'pt-BR': 'Gerenciar cargos (Diretoria, Funcionários) e permissões.',
        'pt-PT': 'Gerir cargos e permissões.',
        'es': 'Gestionar cargos y permisos.',
        'en': 'Manage roles and permissions.',
    },
    socialProjects: {
        'pt-BR': '📂 Projetos Sociais',
        'pt-PT': '📂 Projetos Sociais',
        'es': '📂 Proyectos Sociales',
        'en': '📂 Social Projects',
    },
    manageProjects: {
        'pt-BR': 'Criar projetos e configurar chaves PIX/Crypto.',
        'pt-PT': 'Criar projetos e configurar chaves.',
        'es': 'Crear proyectos y configurar claves.',
        'en': 'Create projects and configure keys.',
    },
    reportsAdmin: {
        'pt-BR': '📊 Relatórios (Em breve)',
        'pt-PT': '📊 Relatórios (Em breve)',
        'es': '📊 Reportes (Próximamente)',
        'en': '📊 Reports (Coming Soon)',
    },
    viewStats: {
        'pt-BR': 'Visualizar estatísticas de doações e atividades.',
        'pt-PT': 'Visualizar estatísticas.',
        'es': 'Ver estadísticas.',
        'en': 'View statistics.',
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
