import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiConfig } from "@/lib/api";
import Cookies from "js-cookie";

export interface IUserInfoResponse {
    id: string;
    username: string,
    email: string,
    grade: number,
    role: number,
    admissionDate: string
}


export const useUserInfo = (userId: string): UseQueryResult<IUserInfoResponse, unknown> => {
    return useQuery({
        queryKey: ["currentUserInfo", userId],
        queryFn: async () => {
            console.log("Fetching user info for:", userId); // Debug log
            const data = await apiConfig.get<IUserInfoResponse>(`user/${userId}/getuser`);
            return data;
        },
        enabled: !!userId,
        retry: false, // Do not retry on failure
        refetchOnWindowFocus: false, // Do not refetch when window gets focus
    });
};
