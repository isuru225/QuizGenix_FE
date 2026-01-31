import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { apiConfig } from "@/lib/api";

export interface ILessonResponse {
    id: string;
    title: string;
    content: string;
    filePath: string;
    teacherId: string;
    teacherName: string;
    createdAt: Date;
    questionCount: number;
}

export interface ILessonRequest {
    title: string;
    subject: string;
    content: string
}

export const useLessons = (teacherId: string): UseQueryResult<ILessonResponse[], unknown> => {
    return useQuery({
        queryKey: ["lessons"],
        queryFn: async () => {
            const data = await apiConfig.get<ILessonResponse[]>(`/lesson/${teacherId}/get`);
            return data;
        },
        retry: false, // Do not retry on failure
        refetchOnWindowFocus: false, // Do not refetch when window gets focus
    });
};

export const useCreateLesson = (teacherId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newLesson: ILessonRequest) => apiConfig.post(`/lesson/${teacherId}/add`, newLesson),
        onSuccess: () => {
            // Automatically refetch the list!
            queryClient.invalidateQueries({ queryKey: ["lessons"] });
        },
    });
};