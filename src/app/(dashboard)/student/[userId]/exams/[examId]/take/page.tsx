"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useExam } from "@/features/teacher/hooks/useExams"
import { useSubmitExam, IBackEndAnswer } from "@/features/student/hooks/useStudentExams"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Flag,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Send,
    Eye
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function TakeExamPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params?.userId as string
    const examId = params?.examId as string

    const { data: exam, isLoading } = useExam(examId)
    const { mutate: submitExam, isPending: isSubmitting } = useSubmitExam()

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
    const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, number>>({})
    const [timeLeft, setTimeLeft] = React.useState<number>(0) // in seconds
    const [isReviewStage, setIsReviewStage] = React.useState(false)
    const [isAutoSubmitted, setIsAutoSubmitted] = React.useState(false)

    // Initialize timer
    React.useEffect(() => {
        if (exam && timeLeft === 0 && !isAutoSubmitted) {
            setTimeLeft(exam.durationMinutes * 60)
        }
    }, [exam])

    // Timer logic
    React.useEffect(() => {
        if (timeLeft <= 0 && exam && !isAutoSubmitted && !isReviewStage) {
            handleAutoSubmit()
            return
        }

        if (timeLeft > 0 && !isReviewStage) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft, isReviewStage, exam])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const handleAnswerSelect = (questionId: string, answerIndex: number) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answerIndex
        }))
    }

    const handleAutoSubmit = () => {
        setIsAutoSubmitted(true)
        performFinalSubmission()
    }

    const performFinalSubmission = () => {
        if (!exam) return

        const answers: IBackEndAnswer[] = exam.questions.map((q) => ({
            questionId: q.id,
            selectedAnswer: selectedAnswers[q.id] ?? -1 // -1 for unanswered
        }))

        submitExam(
            {
                examId,
                studentId: userId,
                answers
            },
            {
                onSuccess: () => {
                    router.push(`/student/${userId}/dashboard`)
                }
            }
        )
    }

    if (isLoading || !exam) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    const currentQuestion = exam.questions[currentQuestionIndex]
    const progress = ((Object.keys(selectedAnswers).length) / exam.questions.length) * 100

    if (isReviewStage) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Review Your Answers</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsReviewStage(false)}>
                            Back to Exam
                        </Button>
                        <Button onClick={performFinalSubmission} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit Final Exam
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {exam.questions.map((q, idx) => (
                        <Card key={q.id} className={cn(
                            "transition-all",
                            selectedAnswers[q.id] === undefined ? "border-amber-200 bg-amber-50" : "border-muted"
                        )}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium line-clamp-1">{q.questionText}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedAnswers[q.id] !== undefined
                                                ? `Selected: ${String.fromCharCode(65 + selectedAnswers[q.id])}`
                                                : "No answer selected"}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setCurrentQuestionIndex(idx)
                                    setIsReviewStage(false)
                                }}>
                                    Edit
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const options = [
        currentQuestion.optionA,
        currentQuestion.optionB,
        currentQuestion.optionC,
        currentQuestion.optionD
    ]

    return (
        <div className="min-h-screen bg-slate-50 -m-8 p-8 flex flex-col">
            {/* Header / Nav */}
            <div className="flex items-center justify-between bg-white border-b p-4 sticky top-0 z-10 shadow-sm rounded-t-xl mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Clock className={cn("h-5 w-5", timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary")} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Remaining</p>
                        <p className={cn("text-xl font-mono font-bold", timeLeft < 60 ? "text-red-500" : "text-slate-900")}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-center gap-1 flex-1 max-w-md px-10">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                        Progress: {Object.keys(selectedAnswers).length} / {exam.questions.length} Questions Answered
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsReviewStage(true)} className="gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Review All</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl mx-auto w-full space-y-6">
                <Card className="shadow-lg border-2">
                    <CardHeader className="border-b bg-primary/5 flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-lg">Question {currentQuestionIndex + 1} of {exam.questions.length}</CardTitle>
                        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                            <Flag className="h-4 w-4" />
                            Mark
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <p className="text-2xl font-medium text-slate-800 leading-snug">
                            {currentQuestion.questionText}
                        </p>

                        <div className="grid gap-3">
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group",
                                        selectedAnswers[currentQuestion.id] === index
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-slate-100 bg-white hover:border-primary/30 hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border-2",
                                        selectedAnswers[currentQuestion.id] === index
                                            ? "bg-primary border-primary text-white"
                                            : "bg-slate-50 border-slate-100 text-slate-400 group-hover:border-primary/30 group-hover:text-primary transition-colors"
                                    )}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className={cn(
                                        "text-lg",
                                        selectedAnswers[currentQuestion.id] === index ? "text-primary font-semibold" : "text-slate-600"
                                    )}>
                                        {option}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 bg-slate-50 border-t flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            disabled={currentQuestionIndex === 0}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {currentQuestionIndex === exam.questions.length - 1 ? (
                                <Button onClick={() => setIsReviewStage(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Review & Submit
                                </Button>
                            ) : (
                                <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="gap-2">
                                    Next Question
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>

                {/* Bottom navigation dots for quick jump */}
                <div className="flex flex-wrap justify-center gap-2 p-4">
                    {exam.questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={cn(
                                "w-10 h-10 rounded-lg border-2 font-medium transition-all",
                                currentQuestionIndex === idx
                                    ? "border-primary bg-primary text-white shadow-lg scale-110"
                                    : selectedAnswers[exam.questions[idx].id] !== undefined
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-slate-200 bg-white text-slate-400 hover:border-primary/30"
                            )}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Auto-submit dialog/overlay */}
            {isAutoSubmitted && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full animate-in zoom-in-95 duration-300">
                        <CardHeader className="text-center bg-amber-50 rounded-t-xl">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-8 w-8 text-amber-600" />
                            </div>
                            <CardTitle className="text-amber-800">Time's Up!</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 text-center space-y-4">
                            <p className="text-slate-600">
                                Your exam duration has expired. Your answers have been automatically recorded and are being submitted.
                            </p>
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
