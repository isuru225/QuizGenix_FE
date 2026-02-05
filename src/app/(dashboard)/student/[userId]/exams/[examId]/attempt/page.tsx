"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useExam } from "@/features/teacher/hooks/useExams"
// import { useSubmitExam, IBackEndAnswer } from "@/features/student/hooks/useStudentExams" // We will import these once we confirm the path
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Loader2, Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Menu, X } from "lucide-react"
import { useSubmitExam } from "@/features/student/hooks/useStudentExams"
import { toast } from "sonner"
// Import IBackEndAnswer locally or from hook if exported
interface IBackEndAnswer {
    questionId: string;
    selectedAnswer: number;
}

export default function ExamAttemptPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params?.userId as string
    const examId = params?.examId as string

    const { data: exam, isLoading: isLoadingExam } = useExam(examId)
    const { mutate: submitExam, isPending: isSubmitting } = useSubmitExam()

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({}) // questionId -> optionIndex (0-3)
    const [reviewSet, setReviewSet] = useState<Set<string>>(new Set())
    const [timeLeft, setTimeLeft] = useState<number | null>(null) // in seconds
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
    const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false)

    // Derived
    const questions = exam?.questions || []
    const currentQuestion = questions[currentQuestionIndex]
    const totalQuestions = questions.length

    // Load state from local storage on mount
    useEffect(() => {
        const answersKey = `exam_answers_${examId}_${userId}`
        const reviewKey = `exam_review_${examId}_${userId}`

        const savedAnswers = localStorage.getItem(answersKey)
        const savedReview = localStorage.getItem(reviewKey)

        if (savedAnswers) {
            try {
                setAnswers(JSON.parse(savedAnswers))
            } catch (e) { console.error("Failed to parse saved answers", e) }
        }

        if (savedReview) {
            try {
                // serialized as array
                const reviewArray = JSON.parse(savedReview)
                setReviewSet(new Set(reviewArray))
            } catch (e) { console.error("Failed to parse saved reviews", e) }
        }
    }, [examId, userId])

    // Save state to local storage on change
    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem(`exam_answers_${examId}_${userId}`, JSON.stringify(answers))
        }
    }, [answers, examId, userId])

    useEffect(() => {
        if (reviewSet.size > 0) {
            localStorage.setItem(`exam_review_${examId}_${userId}`, JSON.stringify(Array.from(reviewSet)))
        }
    }, [reviewSet, examId, userId])


    // Initialize Timer
    useEffect(() => {
        if (!exam) return

        // Calculate initial time
        // Strategy: We rely on scheduledEndTime as the hard stop.
        // And durationMinutes as the relative stop.
        // We need to know when the student *started*.
        // For MVP without server session start tracking:
        // 1. Check local storage for "exam_start_{id}".
        // 2. If not found, set it to now.
        // 3. deadline = min(startTime + duration, scheduledEndTime).

        const STORAGE_KEY = `exam_start_${examId}_${userId}`
        let startTimeStr = localStorage.getItem(STORAGE_KEY)
        let startTime = startTimeStr ? new Date(parseInt(startTimeStr)) : new Date()

        if (!startTimeStr) {
            localStorage.setItem(STORAGE_KEY, startTime.getTime().toString())
        }

        const now = new Date()
        const scheduledEnd = new Date(exam.scheduledEndTime)
        const durationSeconds = exam.durationMinutes * 60

        const startTimestamp = startTime.getTime()
        const endTimestamp = scheduledEnd.getTime()
        const durationEndTimestamp = startTimestamp + (durationSeconds * 1000)

        // The effective deadline is the sooner of the two
        const deadline = Math.min(endTimestamp, durationEndTimestamp)

        const remainingSeconds = Math.max(0, Math.floor((deadline - now.getTime()) / 1000))

        setTimeLeft(remainingSeconds)

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null) return null
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [exam, examId, userId])

    // Auto-submit on time zero
    useEffect(() => {
        if (timeLeft === 0) {
            handleAutoSubmit()
        }
    }, [timeLeft])

    // Warn on close/refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])


    const handleAnswerSelect = (questionId: string, optionIndex: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex
        }))
    }

    const toggleReview = (questionId: string) => {
        setReviewSet((prev) => {
            const next = new Set(prev)
            if (next.has(questionId)) {
                next.delete(questionId)
            } else {
                next.add(questionId)
            }
            return next
        })
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getAnswerStats = () => {
        const answeredCount = Object.keys(answers).length
        return {
            answered: answeredCount,
            unanswered: totalQuestions - answeredCount,
            marked: reviewSet.size
        }
    }

    const handleSubmit = () => {
        // Format answers for backend
        const formattedAnswers: IBackEndAnswer[] = Object.entries(answers).map(([qId, idx]) => ({
            questionId: qId,
            selectedAnswer: idx // 0-3
        }))

        // Include unanswered questions with -1 or just exclude them? 
        // Backend interface `IBackEndAnswer` expects `selectedAnswer: number`.
        // Usually, we send what we have.

        submitExam({
            examId,
            studentId: userId,
            answers: formattedAnswers
        }, {
            onSuccess: () => {
                // Clear local storage
                localStorage.removeItem(`exam_start_${examId}_${userId}`)
                toast.success("Exam submitted successfully!")
                router.replace(`/student/${userId}/exams`)
            },
            onError: (err) => {
                toast.error("Failed to submit exam. Please try again.")
                console.error(err)
            }
        })
    }

    const handleAutoSubmit = useCallback(() => {
        // Force submit logic
        // We reuse handleSubmit logic but without confirmation
        // We need to access current state state `answers`.
        // Using a ref or just calling the submit function directly inside the effect with dependency.
        // Since this is called from useEffect [timeLeft], we need `answers` in dependency or use a Ref.
        // Let's rely on the function closing over the state, but we need to be careful.
        // safest is to just trigger the mutation here.

        const formattedAnswers: IBackEndAnswer[] = Object.entries(answers).map(([qId, idx]) => ({
            questionId: qId,
            selectedAnswer: idx
        }))

        submitExam({ examId, studentId: userId, answers: formattedAnswers }, {
            onSuccess: () => {
                localStorage.removeItem(`exam_start_${examId}_${userId}`)
                toast.info("Time is up! Exam submitted automatically.")
                router.replace(`/student/${userId}/exams`)
            }
        })
    }, [answers, examId, userId, submitExam, router])


    if (isLoadingExam) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground animate-pulse">Loading exam environment...</p>
                </div>
            </div>
        )
    }

    if (!exam || !questions.length) {
        return <div className="p-8">Exam error or no questions.</div>
    }

    const stats = getAnswerStats()

    // Color helpers
    const getQuestionStatusColor = (index: number) => {
        const qId = questions[index].id
        const isCurrent = index === currentQuestionIndex
        const isAnswered = answers[qId] !== undefined
        const isReview = reviewSet.has(qId)

        if (isCurrent) return "ring-2 ring-primary ring-offset-2 border-primary bg-primary/10"
        if (isReview) return "bg-amber-100 text-amber-700 border-amber-300"
        if (isAnswered) return "bg-blue-100 text-blue-700 border-blue-200"
        return "bg-background hover:bg-muted"
    }

    return (
        <div className="flex flex-col h-screen max-h-screen bg-gray-50/50">
            {/* Header / Top Bar */}
            <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6 shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-4 text-clip overflow-hidden">
                    <div className="font-bold text-lg md:text-xl truncate max-w-[200px] md:max-w-md">
                        {exam.title}
                    </div>
                    <div className="hidden md:flex gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-blue-500" /> {stats.answered} Answered</span>
                        <span className="flex items-center gap-1.5"><Flag className="h-4 w-4 text-amber-500" /> {stats.marked} Marked</span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">{stats.unanswered} Left</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg border shadow-sm transition-colors",
                        timeLeft !== null && timeLeft < 300 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-background text-primary"
                    )}>
                        <Clock className="h-5 w-5" />
                        {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                    </div>

                    <Button
                        variant="default"
                        onClick={() => setIsSubmitDialogOpen(true)}
                        className="hidden md:flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all"
                    >
                        Submit Exam
                    </Button>
                    <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsMobilePaletteOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content (Question) */}
                <main className="flex-1 flex flex-col md:p-6 p-4 overflow-y-auto max-w-5xl mx-auto w-full">
                    {/* Question Card */}
                    <Card className="flex-1 flex flex-col shadow-sm border-0 md:border md:shadow-md">
                        <CardContent className="flex-1 p-6 md:p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        Question {currentQuestionIndex + 1} of {totalQuestions}
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-foreground">
                                        {currentQuestion.questionText}
                                    </h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleReview(currentQuestion.id)}
                                    className={cn(
                                        "ml-4 gap-2 transition-colors",
                                        reviewSet.has(currentQuestion.id) ? "text-amber-600 bg-amber-50" : "text-muted-foreground"
                                    )}
                                >
                                    <Flag className={cn("h-4 w-4", reviewSet.has(currentQuestion.id) && "fill-current")} />
                                    <span className="hidden md:inline">{reviewSet.has(currentQuestion.id) ? "Marked" : "Mark for Review"}</span>
                                </Button>
                            </div>

                            <Separator className="mb-8" />

                            <RadioGroup
                                value={answers[currentQuestion.id]?.toString()}
                                onValueChange={(val: string) => handleAnswerSelect(currentQuestion.id, parseInt(val))}
                                className="space-y-4 max-w-3xl"
                            >
                                {[currentQuestion.optionA, currentQuestion.optionB, currentQuestion.optionC, currentQuestion.optionD].map((option, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200 cursor-pointer hover:bg-muted/50",
                                            answers[currentQuestion.id] === idx ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted"
                                        )}
                                        onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                                    >
                                        <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="text-primary" />
                                        <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-medium text-base">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>

                        {/* Navigation Footer */}
                        <div className="p-6 border-t flex justify-between bg-muted/10">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="w-32"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>

                            {currentQuestionIndex < totalQuestions - 1 ? (
                                <Button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                                    className="w-32"
                                >
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setIsSubmitDialogOpen(true)}
                                    className="w-32 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Finish
                                </Button>
                            )}
                        </div>
                    </Card>
                </main>

                {/* Question Palette Sidebar (Desktop) */}
                <aside className="hidden md:flex flex-col w-80 border-l bg-background">
                    <div className="p-4 border-b font-semibold flex items-center gap-2">
                        <Menu className="h-4 w-4 text-muted-foreground" />
                        Question Navigator
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={cn(
                                        "h-10 w-full rounded-md text-sm font-medium transition-all duration-200 border",
                                        getQuestionStatusColor(idx)
                                    )}
                                >
                                    {idx + 1}
                                    {reviewSet.has(q.id) && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-muted/5 space-y-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200" /> Answered
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300" /> Marked for Review
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-background border border-muted" /> Not Answered
                        </div>
                    </div>
                </aside>
            </div>

            {/* Mobile Palette Drawer */}
            {isMobilePaletteOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden flex justify-end">
                    <div className="w-4/5 h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right">
                        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                            <span className="font-semibold">Questions</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobilePaletteOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="grid grid-cols-5 gap-3">
                                {questions.map((q, idx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setCurrentQuestionIndex(idx)
                                            setIsMobilePaletteOpen(false)
                                        }}
                                        className={cn(
                                            "h-10 w-full rounded-md text-sm font-medium transition-colors border",
                                            getQuestionStatusColor(idx)
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t">
                            <Button className="w-full" onClick={() => {
                                setIsMobilePaletteOpen(false)
                                setIsSubmitDialogOpen(true)
                            }}>Submit Exam</Button>
                        </div>
                    </div>
                </div>
            )}


            {/* Submit Dialog */}
            <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to submit your exam.
                            {stats.unanswered > 0 && <span className="font-bold text-destructive block mt-2">Warning: You have {stats.unanswered} unanswered questions.</span>}
                            <div className="mt-4 p-4 bg-muted rounded-md text-sm space-y-2">
                                <div className="flex justify-between"><span>Answered:</span> <span className="font-medium">{stats.answered}</span></div>
                                <div className="flex justify-between"><span>Unanswered:</span> <span className="font-medium">{stats.unanswered}</span></div>
                                <div className="flex justify-between"><span>Marked for Review:</span> <span className="font-medium">{stats.marked}</span></div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit} className="bg-primary">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                </>
                            ) : "Submit Now"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
