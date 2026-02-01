export interface IExam {
    examInfo: {
        title: string;
        description: string;
        scheduledStartTime: string; // ISO datetime
        scheduledEndTime: string;   // ISO datetime
        durationMinutes: number;            // minutes
        studentGrade: number;              // Grade level
        lessonId: string;
    }
    questions: Array<IQuestionTemp>;
}

export interface IQuestionTemp {
    tempId: string;
    content: string;
    possibleAnswers: string[];   // Array of 4 answers
    correctAnswer: number;      // Index (0-3)
}