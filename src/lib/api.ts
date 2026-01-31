import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5115/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Auto-attach JWT token if it exists
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token"); // or get from cookie
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});


export const apiConfig = {
    get: async <T>(url: string): Promise<T> => {
        const response = await api.get<T>(url);
        return response.data;
    },

    post: async <T>(url: string, data?: any): Promise<T> => {
        const response = await api.post<T>(url, data);
        return response.data;
    },

    put: async <T>(url: string, data?: any): Promise<T> => {
        const response = await api.put<T>(url, data);
        return response.data;
    },

    delete: async <T>(url: string): Promise<T> => {
        const response = await api.delete<T>(url);
        return response.data;
    },
};