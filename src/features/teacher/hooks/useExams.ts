import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { apiConfig } from "@/lib/api";

export interface IQuestion {
    id: string;
    content: string;
    possibleAnswers: string[];   // Array of 4 answers
    correctAnswer: number;       // Index (0-3)
    isAIGenerated: boolean;
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

export interface IExamResponse {
    id: string;
    title: string;
    description: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    durationMinutes: number;
    lessonTitle: string | null;
    teacherName: string | null;
    createdAt: string;
    studentGrade: number;
    lessonId: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    questions: Array<IQuestionResponse>;
}

export interface IQuestionResponse {
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: number;       // Index (0-3)
    isAIGenerated: boolean;
    createdAt: string;
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

export const useExam = (examId: string): UseQueryResult<IExamResponse, unknown> => {
    return useQuery({
        queryKey: ["exam", examId],
        queryFn: async () => {
            const data = await apiConfig.get<IExamResponse>(`/exam/${examId}/getbyexamid`);
            return data;
        },
        enabled: !!examId,
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useUpdateExam = (examId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updatedExam: IExamRequest) => apiConfig.put(`/exam/${examId}/update`, updatedExam),
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ["exams", teacherId] });
            // queryClient.invalidateQueries({ queryKey: ["exam", examId] });
        },
    });
};
