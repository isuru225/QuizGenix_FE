"use client"

import { useParams, useRouter } from "next/navigation"
import { useExam } from "@/features/teacher/hooks/useExams"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Clock, Calendar, AlertCircle, CheckCircle2, PlayCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ExamLobbyPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params?.userId as string
    const examId = params?.examId as string

    const { data: exam, isLoading, error } = useExam(examId)

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !exam) {
        return (
            <div className="flex h-[400px] items-center justify-center flex-col gap-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <h2 className="text-xl font-semibold">Exam not found or error loading details.</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const now = new Date()
    const scheduledStart = new Date(exam.scheduledStartTime)
    const scheduledEnd = new Date(exam.scheduledEndTime)

    // Determine Status
    let status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Missed' = 'Upcoming';
    if (now < scheduledStart) {
        status = 'Upcoming';
    } else if (now >= scheduledStart && now <= scheduledEnd) {
        status = 'Ongoing';
    } else {
        status = 'Completed'; // Or missed
    }

    const canStart = status === 'Ongoing';

    const handleStartExam = () => {
        router.push(`/student/${userId}/exams/${examId}/attempt`)
    }

    return (
        <div className="container max-w-3xl mx-auto py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <Button variant="ghost" className="w-fit pl-0" onClick={() => router.back()}>
                    &larr; Back to Exams
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
                <p className="text-muted-foreground text-lg">{exam.description}</p>
            </div>

            <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Exam Details</CardTitle>
                    <CardDescription>Please review the details before starting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                            <Clock className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                <p className="text-xl font-bold">{exam.durationMinutes} Minutes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                                <p className="text-xl font-bold">{exam.questions?.length || 0} Questions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                            <Calendar className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                                <p className="font-semibold">{scheduledStart.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                            <Calendar className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">End Time</p>
                                <p className="font-semibold">{scheduledEnd.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="font-semibold text-lg">Instructions</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>The exam will automatically submit when the timer reaches zero.</li>
                            <li>You can navigate freely between questions.</li>
                            <li>You can mark questions for review and come back to them later.</li>
                            <li>Ensure you have a stable internet connection.</li>
                            <li>Do not refresh the page significantly or you may lose your local progress check (though answers are saved on submission).</li>
                        </ul>
                    </div>

                    {!canStart ? (
                        <Alert variant={status === 'Upcoming' ? "default" : "destructive"}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>
                                {status === 'Upcoming' ? "Exam is not started yet" : "Exam period has ended"}
                            </AlertTitle>
                            <AlertDescription>
                                {status === 'Upcoming'
                                    ? `This exam is scheduled to start on ${scheduledStart.toLocaleString()}.`
                                    : `This exam ended on ${scheduledEnd.toLocaleString()}. You can no longer take it.`}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="bg-green-50 text-green-900 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">You are eligible to take this exam</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Click the button below to start. The timer will begin immediately.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end p-6 bg-muted/10">
                    <Button
                        size="lg"
                        onClick={handleStartExam}
                        disabled={!canStart}
                        className="w-full md:w-auto gap-2 font-bold"
                    >
                        <PlayCircle className="h-5 w-5" />
                        Start Exam Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
