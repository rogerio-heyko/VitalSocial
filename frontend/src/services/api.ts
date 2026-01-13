import axios from 'axios';

// CONFIGURAÇÃO PRODUÇÃO
const API_URL = 'https://api.vital.social';
// const API_URL = 'http://10.0.0.198:3001'; // LAN PROVISORIO

const api = axios.create({
    baseURL: API_URL,
    // headers: { 'Bypass-Tunnel-Reminder': 'true' } // Não necessário via USB
});

// Interceptor to handle 401 (Unauthorized) globaly
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Here we should trigger logout. 
            // Since we can't access hook outside component, we might need a navigation ref or event.
            // For now, simpler approach: Just propagate error, but ensure UI handles it?
            // Or better: dispatch a global event. 
            // BUT, since we are in `api.ts`, simplest is to rely on Components handling OR importing store.
            // Let's just log it for now, Components will catch. 
            // Ideally we'd use a DeviceEventEmitter.
            console.log("Sessão expirada (401).");
        }
        return Promise.reject(error);
    }
);

export default api;
