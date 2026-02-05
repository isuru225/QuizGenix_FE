"use client"

import * as React from "react"
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
import { useCreateExam, IExamRequest, IQuestion } from "@/features/teacher/hooks/useExams"
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

export default function CreateExamPage() {
    const router = useRouter()
    const params = useParams()
    const userId = params?.userId as string
    const createExamMutation = useCreateExam(userId)
    const { data: lessons, isLoading, error } = useLessons(userId)
    // Multi-step state
    const [currentStep, setCurrentStep] = React.useState(1)
    const [examData, setExamData] = React.useState<Partial<ExamFormData>>({
        questions: []
    })
    const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)

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

    const sessionReader = () => {
        if (typeof window === "undefined") return {}
        const sessionData = sessionStorage.getItem("exam");
        const exam = JSON.parse(sessionData || "{}")
        return exam
    }

    // Load initial values from sessionStorage
    React.useEffect(() => {
        const savedExam = sessionStorage.getItem("exam")
        if (savedExam) {
            try {
                const parsed = JSON.parse(savedExam)
                console.log("Giant", parsed);
                if (parsed.examInfo) {
                    reset(parsed.examInfo)
                    setExamData(prev => ({ ...prev, ...parsed.examInfo }))
                }
                if (parsed.questions) {
                    setQuestions(parsed.questions)
                }
            } catch (e) {
                console.error("Error loading exam draft", e)
            }
        }
    }, [reset])

    // Step 2: Questions state
    const [questions, setQuestions] = React.useState<IQuestion[]>([])
    const [currentQuestion, setCurrentQuestion] = React.useState<Partial<IQuestion>>({
        content: "",
        possibleAnswers: ["", "", "", ""],
        correctAnswer: 0,
        isAIGenerated: false,
    })

    // Handle Step 1 submission
    const onSubmitExamInfo = (data: ExamInfoFormData) => {
        const durationMinutes = calculateDurationInMinutes(data.scheduledStartTime, data.scheduledEndTime);
        console.log("Corn", examData, data, durationMinutes);
        sessionStorage.setItem("exam", JSON.stringify({
            examInfo: { ...data, durationMinutes },
            questions: sessionReader().questions
        }))
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
            id: currentQuestion.id ? currentQuestion.id : uuidv4(),
            content: currentQuestion.content,
            possibleAnswers: currentQuestion.possibleAnswers as string[],
            correctAnswer: currentQuestion.correctAnswer || 0,
            isAIGenerated: false,
        }

        const newQuestions = [...questions, newQuestion]
        setQuestions(newQuestions)

        // Update session storage draft
        sessionStorage.setItem("exam", JSON.stringify({
            examInfo: getValues(),
            questions: newQuestions
        }))

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

        // Update session storage draft
        sessionStorage.setItem("exam", JSON.stringify({
            examInfo: getValues(),
            questions: updatedQuestions
        }))
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
        const durationMinutes = Math.floor((new Date(endTime!).getTime() - new Date(startTime!).getTime()) / (1000 * 60))
        return durationMinutes
    }

    // Final submission
    const onSubmitExam = async () => {
        try {
            const finalData: IExamRequest = {
                title: examData.title!,
                description: examData.description!,
                scheduledStartTime: examData.scheduledStartTime!,
                scheduledEndTime: examData.scheduledEndTime!,
                durationMinutes: calculateDurationInMinutes(examData.scheduledStartTime!, examData.scheduledEndTime!),
                studentGrade: examData.studentGrade!,
                lessonId: examData.lessonId!,
                questions: questions, // Use the latest questions state
            }

            await createExamMutation.mutateAsync(finalData)
            sessionStorage.removeItem("exam") // Clear draft on success
            router.push(`/teacher/${userId}/exams`)
        } catch (error) {
            console.error("Failed to create exam:", error)
        }
    }

    // Step indicator
    const steps = [
        { number: 1, title: "Exam Info" },
        { number: 2, title: "Add Questions" },
        { number: 3, title: "Review & Submit" },
    ]

    const lessonOptions = () => {
        if (isLoading) return <option disabled>Loading lessons...</option>
        if (error) return <option disabled>Error loading lessons</option>

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

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Exams
                </Button>
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
                        <CardDescription>Enter the basic details about your exam.</CardDescription>
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

                            {/* <div className="grid gap-2">
                                <Label htmlFor="duration">Duration (minutes)*</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    placeholder="e.g. 60"
                                    {...registerInfo("duration", { valueAsNumber: true })}
                                    className={errorsInfo.duration ? "border-red-500" : ""}
                                />
                                {errorsInfo.duration && (
                                    <p className="text-sm text-red-500">{errorsInfo.duration.message}</p>
                                )}
                            </div> */}
                            <div className="grid gap-2">
                                <Label htmlFor="grade">Grade*</Label>
                                <select
                                    id="studentGrade"
                                    {...registerInfo("studentGrade")}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errorsInfo.studentGrade ? "border-red-500" : ""}`}
                                >
                                    <option value="">Select Grade</option>
                                    <option value="1">Grade 1</option>
                                    <option value="2">Grade 2</option>
                                    <option value="3">Grade 3</option>
                                    <option value="4">Grade 4</option>
                                    <option value="5">Grade 5</option>
                                    <option value="6">Grade 6</option>
                                    <option value="7">Grade 7</option>
                                    <option value="8">Grade 8</option>
                                    <option value="9">Grade 9</option>
                                    <option value="10">Grade 10</option>
                                    <option value="11">Grade 11</option>
                                    <option value="12">Grade 12</option>
                                </select>
                                {errorsInfo.studentGrade && (
                                    <p className="text-sm text-red-500">{errorsInfo.studentGrade.message}</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="submit">
                                Next: Add Questions
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
                            <CardTitle>Add Questions</CardTitle>
                            <CardDescription>Create questions with 4 possible answers each.</CardDescription>
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
                                <p className="text-sm text-muted-foreground">Select the radio button for the correct answer</p>
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
                            <DialogFooter className="gap-2">
                                {/* <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDiscard}>
                                    Discard
                                </Button> */}
                                <Button onClick={handleSaveAsDraft}>
                                    Ok
                                </Button>
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
                                            <Button
                                                id={q?.id}
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeQuestion(q?.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
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
                        <CardTitle>Review & Submit</CardTitle>
                        <CardDescription>Review all exam details before submitting.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Exam Info Review */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Exam Information</h3>
                                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                                    Edit
                                </Button>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <div>
                                    <span className="font-medium">Title:</span> {examData.title}
                                </div>
                                <div>
                                    <span className="font-medium">Lesson:</span> {lessons?.find(l => l.id === examData.lessonId)?.title || examData.lessonId}
                                </div>
                                <div>
                                    <span className="font-medium">Grade:</span> Grade {examData.studentGrade}
                                </div>
                                <div>
                                    <span className="font-medium">Description:</span> {examData.description}
                                </div>
                                <div>
                                    <span className="font-medium">Start Time:</span>{" "}
                                    {examData.scheduledStartTime && new Date(examData.scheduledStartTime).toLocaleString()}
                                </div>
                                <div>
                                    <span className="font-medium">End Time:</span>{" "}
                                    {examData.scheduledEndTime && new Date(examData.scheduledEndTime).toLocaleString()}
                                </div>
                                <div>
                                    <span className="font-medium">Duration:</span> {calculateDurationInMinutes(examData.scheduledStartTime!, examData.scheduledEndTime!)} minutes
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* Questions Review */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Questions ({examData.questions?.length})</h3>
                                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                                    Edit
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {examData.questions?.map((q, index) => (
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
                            disabled={createExamMutation.isPending}
                        >
                            {createExamMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Exam
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
