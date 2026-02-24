import axios from 'axios';

const api = axios.create({
    // Uses the environment variable in production, localhost in development
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Add interceptor to attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;