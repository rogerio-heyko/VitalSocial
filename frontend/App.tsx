import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import Routes from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
