import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem("chaturvima_user");
        let apiKey = "";
        let apiSecret = "";
        
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                apiKey = user.api_key || "";
                apiSecret = user.api_secret || "";
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }

        if (apiKey && apiSecret) {
            config.headers.Authorization = `token ${apiKey}:${apiSecret}`;
        }

        console.log("Authorization header:", config.headers.Authorization);

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

        if (error.response?.status === 401) {
            // localStorage.removeItem('apiKey');
            // localStorage.removeItem('apiSecret');
            // localStorage.removeItem('chaturvima_user');
            // window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;




// axios-setup.ts
// import axios from "axios";

// // Create an axios instance
// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL,
//     timeout: 10000, // 10 seconds timeout
//     headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//     },
// });

// // request interceptor to include Authorization header and log requests
// api.interceptors.request.use(
//     (config) => {
//         // access token from chaturvima_user object
//         const storedUser = localStorage.getItem("chaturvima_user");
//         let accessToken = "";
        
//         if (storedUser) {
//             try {
//                 const user = JSON.parse(storedUser);
//                 accessToken = user.access_token;
//             } catch (error) {
//                 console.error("Error parsing user data:", error);
//             }
//         }

//         if (accessToken) {
//             config.headers["Authorization"] = `Token ${accessToken}`;
//         }

//         // Log the request for debugging
//         console.log('API Request:', {
//             method: config.method?.toUpperCase(),
//             url: `${config.baseURL}${config.url}`,
//             headers: config.headers,
//             data: config.data,
//         });

//         return config;
//     },
//     (error) => {
//         console.error('Request interceptor error:', error);
//         return Promise.reject(error);
//     }
// );

// // response interceptor to handle responses and errors
// api.interceptors.response.use(
//     (response) => {
//         console.log('API Response:', {
//             status: response.status,
//             url: response.config.url,
//             data: response.data,
//         });
//         return response;
//     },
//     (error) => {
//         console.error('API Error:', {
//             status: error.response?.status,
//             statusText: error.response?.statusText,
//             url: error.config?.url,
//             message: error.message,
//             data: error.response?.data,
//         });

//         // Handle specific error cases
//         if (error.response?.status === 401) {
//             // Unauthorized - clear auth data
//             // localStorage.removeItem('apiKey');
//             // localStorage.removeItem('apiSecret');
//             // localStorage.removeItem('chaturvima_user');
//         }

//         return Promise.reject(error);
//     }
// );

// export default api;