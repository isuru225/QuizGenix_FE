import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiConfig } from "@/lib/api";
import Cookies from "js-cookie";

export interface IStudentInfoResponse {
    id: string;
    username: string,
    email: string,
    grade: number,
    role: number,
    admissionDate: string
}


export const useStudentInfo = (teacherId: string): UseQueryResult<IStudentInfoResponse[], unknown> => {
    return useQuery({
        queryKey: ["students"],
        queryFn: async () => {
            const data = await apiConfig.get<IStudentInfoResponse[]>(`user/${teacherId}/getallstudents`);
            return data;
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
};
