import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { apiConfig } from "@/lib/api";
import { IExamResponse } from "@/features/teacher/hooks/useExams";

export interface IBackEndAnswer {
    questionId: string;
    selectedAnswer: number; // Index (0-3)
}

export interface ISubmissionRequest {
    examId: string;
    studentId: string;
    answers: IBackEndAnswer[];
}

export const useAvailableExams = (grade?: number): UseQueryResult<IExamResponse[], Error> => {
    return useQuery({
        queryKey: ["studentExams", grade],
        queryFn: async () => {
            const data = await apiConfig.getByQuery<IExamResponse[]>(`/exam/getexambygrade`, { grade });
            return data;
        },
        retry: false,
        refetchOnWindowFocus: false,
        enabled: typeof grade === "number" && grade > 0,
    });
};

export const useSubmitExam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (submission: ISubmissionRequest) =>
            apiConfig.post(`/exam/submit`, submission),
        onSuccess: () => {
            // Invalidate all exams queries (by partial key match)
            queryClient.invalidateQueries({ queryKey: ["studentExams"], exact: false });
        },
    });
};

