import axios from 'axios';

// CONFIGURAÇÃO LAN (Wi-Fi)
const API_URL = 'http://10.0.0.198:3001';

const api = axios.create({
    baseURL: API_URL,
    // headers: { 'Bypass-Tunnel-Reminder': 'true' } // Não necessário via USB
});

export default api;
