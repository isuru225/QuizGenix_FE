import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { apiConfig } from "@/lib/api";

export interface IQuestion {
    content: string;
    possibleAnswers: string[];   // Array of 4 answers
    correctAnswer: number;       // Index (0-3)
}

export interface IExamRequest {
    title: string;
    description: string;
    scheduledStartTime: string; // ISO datetime
    scheduledEndTime: string;   // ISO datetime
    durationMinutes: number;            // minutes
    studentGrade: number;              // Grade level
    lessonId: string;           // Associated lesson ID
    questions: IQuestion[];
}

export interface IExamResponse extends IExamRequest {
    id: string;
    teacherId: string;
    createdAt: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export const useExams = (teacherId: string): UseQueryResult<IExamResponse[], unknown> => {
    return useQuery({
        queryKey: ["exams", teacherId],
        queryFn: async () => {
            const data = await apiConfig.get<IExamResponse[]>(`/exam/${teacherId}/getbyteacherid`);
            return data;
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useCreateExam = (teacherId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newExam: IExamRequest) => apiConfig.post(`/exam/${teacherId}/add`, newExam),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exams", teacherId] });
        },
    });
};
