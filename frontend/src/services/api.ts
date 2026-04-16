import axios from 'axios';
import { DeviceEventEmitter } from 'react-native';

// CONFIGURAÇÃO PRODUÇÃO (Mundial Criptografada via DNS)
const API_URL = 'https://api.vital.social';
// const API_URL = 'http://10.0.0.198:3002'; // LAN PROVISORIO

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
});

// Interceptor to handle 401 (Unauthorized) globaly
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.log("Sessão expirada (401). Emitindo evento de logout.");
            // Emitimos um evento para que o AuthContext possa tratar
            DeviceEventEmitter.emit('auth:logout');
        }
        return Promise.reject(error);
    }
);

export default api;
