import axios from "axios";

const instance = axios.create({
    baseURL:"http://localhost:5000/api",
    withCredentials:true
});

// Add request interceptor to include JWT token in Authorization header
instance.interceptors.request.use(
    (config) => {
        // Get token from cookies
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;