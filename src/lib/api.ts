"use client";

import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5115/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// api.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response?.status === 401) {
//             if (typeof window !== "undefined") {
//                 // SPA-ish redirect to login
//                 window.location.href = "/login";
//             }
//         }
//         return Promise.reject(error);
//     }
// );

export const apiConfig = {
    get: async <T>(url: string): Promise<T> => {
        const response = await api.get<T>(url);
        return response.data;
    },
    getByQuery: async <T>(url: string, params: any): Promise<T> => {
        const response = await api.get<T>(url, { params });
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