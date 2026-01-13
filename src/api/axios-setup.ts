// axios-setup.ts
import axios from "axios";

// Create an axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    // Removed withCredentials to avoid CORS preflight issues
    // withCredentials: true,
});

// Add a request interceptor to include Authorization header and log requests
api.interceptors.request.use(
    (config) => {
        const apiKey = localStorage.getItem("apiKey");
        const apiSecret = localStorage.getItem("apiSecret");

        if (apiKey && apiSecret) {
            config.headers["Authorization"] = `token ${apiKey}:${apiSecret}`;
        }

        // Log the request for debugging
        console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            headers: config.headers,
            data: config.data,
        });

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle responses and errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
        });
        return response;
    },
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data,
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
            // Unauthorized - clear auth data
            localStorage.removeItem('apiKey');
            localStorage.removeItem('apiSecret');
            localStorage.removeItem('chaturvima_user');
        }

        return Promise.reject(error);
    }
);

export default api;