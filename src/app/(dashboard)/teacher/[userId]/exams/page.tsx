"use client";

import Link from "next/link"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IExamResponse, useExams } from "@/features/teacher/hooks/useExams"
import { PlusCircle, FileText, Calendar, Clock, PenLine } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function ExamsPage() {
    const params = useParams();
    const userId = params?.userId as string;
    const { data: exams, isLoading, error } = useExams(userId)
    const router = useRouter();

    const createNewExam = () => {
        router.push(`/teacher/${userId}/exams/create`);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Upcoming':
                return 'bg-blue-100 text-blue-700'
            case 'Ongoing':
                return 'bg-green-100 text-green-700'
            case 'Completed':
                return 'bg-gray-100 text-gray-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const hasNoExams = !exams || exams.length === 0;
    console.log("Benz", exams)

    const examStatusHandler = (startTime: Date, endTime: Date) => {
        const now = new Date();
        if (now < startTime) {
            return 'Upcoming';
        } else if (now >= startTime && now <= endTime) {
            return 'Ongoing';
        } else {
            return 'Completed';
        }
    }

    console.log("Swimming", exams);
    const editExamHandler = (exam: IExamResponse) => {
        const { questions, ...rest } = exam ?? {};

        // const questionFormat = questions.map((question: any) => {
        //     return {
        //         content: question.questionText,
        //         possibleAnswers: [question.optionA, question.optionB, question.optionC, question.optionD],
        //         correctAnswer: question.correctAnswer,
        //         isAIGenerated: question.isAIGenerated,
        //     }
        // })
        // const examEditFormat = {
        //     examInfo: rest,
        //     questions: questionFormat
        // }

        // sessionStorage.setItem("examEdit", JSON.stringify(examEditFormat));

        router.push(`/teacher/${userId}/exams/${exam.id}/edit`);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
                <Button onClick={createNewExam}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Exam
                </Button>
            </div>

            {/* sessionStorage.setItem("exam", JSON.stringify({
            examInfo: { ...data, durationMinutes },
            questions: sessionReader().questions
        })) */}
            {hasNoExams ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border rounded-lg bg-muted/20">
                    <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No exams created yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mt-2">
                        Get started by creating your first exam for your students.
                    </p>
                    <Button onClick={createNewExam} className="mt-4" variant="outline">
                        Create Exam
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam: IExamResponse) => (
                        <Card key={exam.id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 text-clip overflow-hidden">
                                <div className="space-y-1 flex-1">
                                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                                    <CardDescription className="line-clamp-1">{exam.description}</CardDescription>
                                </div>
                                <div className="rounded-full bg-secondary p-2">
                                    <PenLine className="h-4 w-4 text-primary cursor-pointer" onClick={() => editExamHandler(exam)} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(exam.scheduledStartTime).toLocaleDateString()} - {new Date(exam.scheduledEndTime).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{exam.durationMinutes} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>{exam.questions?.length || 0} questions</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>{exam.studentGrade || 0} Grade</span>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(exam.status)}`}>
                                        {examStatusHandler(new Date(exam.scheduledStartTime), new Date(exam.scheduledEndTime))}
                                    </span>
                                    <Button variant="ghost" size="sm">
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
