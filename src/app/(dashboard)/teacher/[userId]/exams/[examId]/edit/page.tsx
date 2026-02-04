"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Plus, Trash2, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { useExam, useUpdateExam, IExamRequest, IQuestion, IExamResponse } from "@/features/teacher/hooks/useExams"
import { IQuestionTemp } from "@/app/(dashboard)/teacher/[userId]/exams/create/interfaces"
import { useLessons } from "@/features/teacher/hooks/useLessons"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Validation schema for Step 1: Exam Info
const examInfoSchema = yup.object({
    title: yup.string().required("Exam title is required").min(3, "Title must be at least 3 characters"),
    description: yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
    scheduledStartTime: yup.string().required("Start time is required"),
    scheduledEndTime: yup.string().required("End time is required"),
    studentGrade: yup.number().required("Grade is required"),
    lessonId: yup.string().required("Lesson is required"),
}).required()

type ExamInfoFormData = yup.InferType<typeof examInfoSchema>

interface ExamFormData extends ExamInfoFormData {
    questions: IQuestion[]
    durationMinutes?: number
}

export default function EditExamPage() {
    const router = useRouter()
    const params = useParams()
    const userId = params?.userId as string
    const examId = params?.examId as string

    const { data: existingExam, isLoading: isLoadingExam } = useExam(examId)
    const { mutateAsync: updateExamMutation, isPending: isUpdatingExam } = useUpdateExam(userId, examId)
    const { data: lessons, isLoading: isLoadingLessons } = useLessons(userId)

    // Multi-step state
    const [currentStep, setCurrentStep] = useState(1)
    const [examData, setExamData] = useState<Partial<ExamFormData>>({
        questions: []
    })
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const {
        register: registerInfo,
        handleSubmit: handleSubmitInfo,
        reset,
        getValues,
        formState: { errors: errorsInfo },
    } = useForm<ExamInfoFormData>({
        resolver: yupResolver(examInfoSchema),
        defaultValues: {
            title: "",
            description: "",
            scheduledStartTime: "",
            scheduledEndTime: "",
            studentGrade: 0,
            lessonId: "",
        },
    })

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const tzoffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
    }

    // Load initial values from API or sessionStorage
    // React.useEffect(() => {
    //     // Don't try to set form values until lessons are loaded
    //     if (isLoadingLessons) return;

    //     const savedExam = sessionStorage.getItem(`examEdit`)

    //     if (savedExam) {
    //         try {
    //             const parsed = JSON.parse(savedExam)
    //             if (parsed.examInfo) {
    //                 const formattedInfo = {
    //                     title: parsed.examInfo.title || "",
    //                     description: parsed.examInfo.description || "",
    //                     scheduledStartTime: formatDateForInput(parsed.examInfo.scheduledStartTime) || "",
    //                     scheduledEndTime: formatDateForInput(parsed.examInfo.scheduledEndTime) || "",
    //                     studentGrade: parsed.examInfo.studentGrade || 0,
    //                     lessonId: parsed.examInfo.lessonId || "",
    //                 }

    //                 reset(formattedInfo) // No setTimeout needed!
    //                 setExamData(prev => ({ ...prev, ...formattedInfo }))
    //             }
    //             if (parsed.questions) {
    //                 setQuestions(parsed.questions)
    //             }
    //         } catch (e) {
    //             console.error("Error loading exam draft", e)
    //         }
    //     } else if (existingExam) {
    //         const initialInfo = {
    //             title: existingExam.title,
    //             description: existingExam.description,
    //             scheduledStartTime: formatDateForInput(existingExam.scheduledStartTime),
    //             scheduledEndTime: formatDateForInput(existingExam.scheduledEndTime),
    //             studentGrade: existingExam.studentGrade,
    //             lessonId: existingExam.lessonId,
    //         }

    //         reset(initialInfo) // No setTimeout needed!
    //         setExamData(initialInfo)

    //         const initialQuestions = existingExam.questions.map(q => ({
    //             ...q,
    //             tempId: uuidv4()
    //         }))
    //         setQuestions(initialQuestions)
    //     }
    // }, [existingExam, reset, examId, isLoadingLessons]) // Add isLoadingLessons!

    useEffect(() => {
        if (existingExam) {
            console.log
            const initialInfo = {
                title: existingExam.title,
                description: existingExam.description,
                scheduledStartTime: formatDateForInput(existingExam.scheduledStartTime),
                scheduledEndTime: formatDateForInput(existingExam.scheduledEndTime),
                studentGrade: existingExam.studentGrade,
                lessonId: existingExam.lessonId,
            }

            reset(initialInfo) // No setTimeout needed!
            setExamData(initialInfo)

            const formatQuestions: IQuestion[] = existingExam.questions.map(q => {
                return {
                    id: q.id,
                    content: q.questionText,
                    possibleAnswers: [q.optionA, q.optionB, q.optionC, q.optionD],
                    correctAnswer: q.correctAnswer,
                    isAIGenerated: q.isAIGenerated
                }
            })
            setQuestions(formatQuestions)
        }
    }, [existingExam, reset, examId, isLoadingLessons])


    //     export interface IQuestion {
    //     id: string;
    //     content: string;
    //     possibleAnswers: string[];   // Array of 4 answers
    //     correctAnswer: number;       // Index (0-3)
    //     isAIGenerated: boolean;
    // }
    // Step 2: Questions state
    const [questions, setQuestions] = React.useState<IQuestion[]>([])
    const [currentQuestion, setCurrentQuestion] = React.useState<Partial<IQuestion>>({
        content: "",
        possibleAnswers: ["", "", "", ""],
        correctAnswer: 0,
        isAIGenerated: false,
    })

    const sessionWriter = (info: any, qs: any) => {
        sessionStorage.setItem(`examEdit`, JSON.stringify({
            examInfo: info,
            questions: qs
        }))
    }

    // Handle Step 1 submission
    const onSubmitExamInfo = (data: ExamInfoFormData) => {
        const durationMinutes = calculateDurationInMinutes(data.scheduledStartTime, data.scheduledEndTime);
        sessionWriter(data, questions)
        setExamData({ ...examData, ...data, durationMinutes })
        setCurrentStep(2)
    }

    // Add question to list
    const addQuestion = () => {
        if (!currentQuestion.content || currentQuestion.possibleAnswers?.some(a => !a.trim())) {
            setShowConfirmDialog(true)
            return
        }

        const newQuestion: IQuestion = {
            id: uuidv4(),
            content: currentQuestion.content,
            possibleAnswers: currentQuestion.possibleAnswers as string[],
            correctAnswer: currentQuestion.correctAnswer || 0,
            isAIGenerated: false,
        }

        const newQuestions = [...questions, newQuestion]
        setQuestions(newQuestions)
        sessionWriter(getValues(), newQuestions)

        setCurrentQuestion({
            content: "",
            possibleAnswers: ["", "", "", ""],
            correctAnswer: 0,
            isAIGenerated: false,
        })
    }

    // Remove question from list
    const removeQuestion = (id: string) => {
        const updatedQuestions = questions.filter((q) => q.id !== id)
        setQuestions(updatedQuestions)
        sessionWriter(getValues(), updatedQuestions)
    }

    // Update current question field
    const updateQuestionField = (field: keyof IQuestion, value: any) => {
        setCurrentQuestion({ ...currentQuestion, [field]: value })
    }

    // Update possible answer
    const updateAnswer = (index: number, value: string) => {
        const newAnswers = [...(currentQuestion.possibleAnswers || ["", "", "", ""])]
        newAnswers[index] = value
        setCurrentQuestion({ ...currentQuestion, possibleAnswers: newAnswers })
    }

    // Handle Step 2 submission
    const onSubmitQuestions = () => {
        if (questions.length === 0) {
            alert("Please add at least one question")
            return
        }
        setExamData({ ...examData, questions })
        setCurrentStep(3)
    }

    const calculateDurationInMinutes = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return 0;
        const durationMinutes = Math.floor((new Date(endTime!).getTime() - new Date(startTime!).getTime()) / (1000 * 60))
        return durationMinutes
    }

    // Final submission
    const onSubmitExam = async () => {
        try {
            const finalData: IExamRequest = {
                title: examData.title!,
                description: examData.description!,
                scheduledStartTime: new Date(examData.scheduledStartTime!).toISOString(),
                scheduledEndTime: new Date(examData.scheduledEndTime!).toISOString(),
                durationMinutes: calculateDurationInMinutes(examData.scheduledStartTime!, examData.scheduledEndTime!),
                studentGrade: examData.studentGrade!,
                lessonId: examData.lessonId!,
                questions: questions
            }

            await updateExamMutation(finalData, {
                onSuccess: () => {
                    sessionStorage.removeItem(`examEdit`)
                    router.push(`/teacher/${userId}/exams`)
                }
            })
        } catch (error) {
            console.error("Failed to update exam:", error)
        }
    }

    // Step indicator
    const steps = [
        { number: 1, title: "Exam Info" },
        { number: 2, title: "Add Questions" },
        { number: 3, title: "Review & Submit" },
    ]

    const lessonOptions = () => {
        if (isLoadingLessons) return <option disabled>Loading lessons...</option>
        return (
            <>
                <option value="">Select a lesson</option>
                {lessons?.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                        {lesson.title}
                    </option>
                ))}
            </>
        )
    }

    const handleSaveAsDraft = () => {
        setShowConfirmDialog(false)
    }

    if (isLoadingExam) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading exam details...</span>
            </div>
        )
    }

    console.log("Jaguar", questions);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Exams
                </Button>
            </div>

            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Edit Exam</h1>
                <p className="text-muted-foreground">Modify the details and questions of your exam.</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step.number
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                            </div>
                            <span className="text-sm mt-2 font-medium">{step.title}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`w-24 h-1 mx-4 ${currentStep > step.number ? "bg-primary" : "bg-muted"
                                    }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step 1: Exam Info */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Exam Information</CardTitle>
                        <CardDescription>Update the basic details about your exam.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmitInfo(onSubmitExamInfo)}>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="lessonId">Lesson*</Label>
                                <select
                                    id="lessonId"
                                    {...registerInfo("lessonId")}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errorsInfo.lessonId ? "border-red-500" : ""}`}
                                >
                                    {lessonOptions()}
                                </select>
                                {errorsInfo.lessonId && (
                                    <p className="text-sm text-red-500">{errorsInfo.lessonId.message}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Exam Title*</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Midterm Exam - Calculus"
                                    {...registerInfo("title")}
                                    className={errorsInfo.title ? "border-red-500" : ""}
                                />
                                {errorsInfo.title && (
                                    <p className="text-sm text-red-500">{errorsInfo.title.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description*</Label>
                                <textarea
                                    id="description"
                                    {...registerInfo("description")}
                                    className={`flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errorsInfo.description ? "border-red-500" : ""
                                        }`}
                                    placeholder="Describe the exam content and instructions..."
                                />
                                {errorsInfo.description && (
                                    <p className="text-sm text-red-500">{errorsInfo.description.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="scheduledStartTime">Start Time*</Label>
                                    <Input
                                        id="scheduledStartTime"
                                        type="datetime-local"
                                        {...registerInfo("scheduledStartTime")}
                                        className={errorsInfo.scheduledStartTime ? "border-red-500" : ""}
                                    />
                                    {errorsInfo.scheduledStartTime && (
                                        <p className="text-sm text-red-500">{errorsInfo.scheduledStartTime.message}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="scheduledEndTime">End Time*</Label>
                                    <Input
                                        id="scheduledEndTime"
                                        type="datetime-local"
                                        {...registerInfo("scheduledEndTime")}
                                        className={errorsInfo.scheduledEndTime ? "border-red-500" : ""}
                                    />
                                    {errorsInfo.scheduledEndTime && (
                                        <p className="text-sm text-red-500">{errorsInfo.scheduledEndTime.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="grade">Grade*</Label>
                                <select
                                    id="studentGrade"
                                    {...registerInfo("studentGrade")}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errorsInfo.studentGrade ? "border-red-500" : ""}`}
                                >
                                    <option value="">Select Grade</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                                    ))}
                                </select>
                                {errorsInfo.studentGrade && (
                                    <p className="text-sm text-red-500">{errorsInfo.studentGrade.message}</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="submit">
                                Next: Edit Questions
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            {/* Step 2: Add Questions */}
            {currentStep === 2 && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Questions</CardTitle>
                            <CardDescription>Edit existing questions or add new ones.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="questionContent">Question Content*</Label>
                                <textarea
                                    id="questionContent"
                                    value={currentQuestion.content}
                                    onChange={(e) => updateQuestionField("content", e.target.value)}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Enter your question here..."
                                />
                            </div>

                            <div className="grid gap-4">
                                <Label>Possible Answers*</Label>
                                {[0, 1, 2, 3].map((index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={currentQuestion.correctAnswer === index}
                                            onChange={() => updateQuestionField("correctAnswer", index)}
                                            className="h-4 w-4"
                                        />
                                        <Input
                                            placeholder={`Answer ${index + 1}`}
                                            value={currentQuestion.possibleAnswers?.[index] || ""}
                                            onChange={(e) => updateAnswer(index, e.target.value)}
                                        />
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                            {currentQuestion.correctAnswer === index && "(Correct)"}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button type="button" onClick={addQuestion} variant="outline" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question to List
                            </Button>
                        </CardContent>
                    </Card>

                    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Operation terminated!</DialogTitle>
                                <DialogDescription>
                                    Please fill in the question and all 4 answers.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button onClick={handleSaveAsDraft}>Ok</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Questions List */}
                    {questions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Questions Added ({questions.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {questions.map((q, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium">Question {index + 1}</p>
                                                <p className="text-sm mt-1">{q.content}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCurrentQuestion(q)
                                                        setQuestions(questions.filter(item => item.id !== q.id))
                                                    }}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeQuestion(q.id!)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid gap-1 text-sm">
                                            {q.possibleAnswers.map((answer, aIndex) => (
                                                <div
                                                    key={aIndex}
                                                    className={`pl-4 ${q.correctAnswer === aIndex
                                                        ? "text-green-600 font-medium"
                                                        : "text-muted-foreground"
                                                        }`}
                                                >
                                                    {aIndex + 1}. {answer}
                                                    {q.correctAnswer === aIndex && " ✓"}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button type="button" onClick={onSubmitQuestions}>
                                    Next: Review
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Review & Save Changes</CardTitle>
                        <CardDescription>Review all exam details before saving.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Exam Information</h3>
                                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                                    Edit
                                </Button>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <div><span className="font-medium">Title:</span> {examData.title}</div>
                                <div><span className="font-medium">Lesson:</span> {lessons?.find(l => l.id === examData.lessonId)?.title || examData.lessonId}</div>
                                <div><span className="font-medium">Grade:</span> Grade {examData.studentGrade}</div>
                                <div><span className="font-medium">Description:</span> {examData.description}</div>
                                <div><span className="font-medium">Start Time:</span> {examData.scheduledStartTime && new Date(examData.scheduledStartTime).toLocaleString()}</div>
                                <div><span className="font-medium">End Time:</span> {examData.scheduledEndTime && new Date(examData.scheduledEndTime).toLocaleString()}</div>
                                <div><span className="font-medium">Duration:</span> {calculateDurationInMinutes(examData.scheduledStartTime!, examData.scheduledEndTime!)} minutes</div>
                            </div>
                        </div>

                        <hr />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                                    Edit
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {questions.map((q, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-2">
                                        <p className="font-medium">Question {index + 1}</p>
                                        <p className="text-sm">{q.content}</p>
                                        <div className="grid gap-1 text-sm">
                                            {q.possibleAnswers.map((answer, aIndex) => (
                                                <div
                                                    key={aIndex}
                                                    className={`pl-4 ${q.correctAnswer === aIndex
                                                        ? "text-green-600 font-medium"
                                                        : "text-muted-foreground"
                                                        }`}
                                                >
                                                    {aIndex + 1}. {answer}
                                                    {q.correctAnswer === aIndex && " ✓ (Correct Answer)"}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            type="button"
                            onClick={onSubmitExam}
                            disabled={isUpdatingExam}
                        >
                            {isUpdatingExam && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Exam
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
