import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { apiConfig } from "@/lib/api";
import Cookies from "js-cookie";
import { AxiosResponse } from "axios";

export interface IAuthResponse {
    token: string;
    userId: string;
    username: string;
    email: string;
    role: string;
}

export interface IAuthRequest {
    email: string;
    password: string;
}

// Properly type the mutation
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (loginData: IAuthRequest) =>
            apiConfig.post<IAuthResponse>("/user/login", loginData),

        onSuccess: (data) => {
            Cookies.set("token", data.token, { expires: 7 });
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            console.log("Role:", data.role);
        },

        onError: (error: any) => {
            console.error(
                "Login failed",
                error.response?.data?.message || error.message
            );
        },
    });
};
