import './global.css';
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import Routes from './src/navigation';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </LanguageProvider>
  );
}
