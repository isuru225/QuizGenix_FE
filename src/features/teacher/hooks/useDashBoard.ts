import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { apiConfig } from "@/lib/api";

export interface ITeacherDashboardResponse {
    examLessonPairs: IExamLessonPair[],
    userInfoDtos: UserInfoDtos[]
}

export interface UserInfoDtos {
    id: string;
    userName: string;
    email: string;
    grade: number;
    role: string;
    addmissionDate: Date;
}

export interface IExamLessonPair {
    lesson: {
        id: string;
        title: string;
        createdAt: Date
    }
    ,
    exam: {
        id: string;
        title: string;
        scheduledEndTime: string;
        scheduledStartTime: string;
        createdAt: Date;
    }
}

export const useDashBoad = (teacherId: string): UseQueryResult<ITeacherDashboardResponse, unknown> => {
    return useQuery({
        queryKey: ["dashboard", teacherId],
        queryFn: async () => {
            const data = await apiConfig.get<ITeacherDashboardResponse>(`/exam/${teacherId}/dashboard`);
            return data;
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
};