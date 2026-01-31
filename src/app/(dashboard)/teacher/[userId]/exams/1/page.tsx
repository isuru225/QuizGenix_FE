"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Printer } from "lucide-react"

// Mock data for a specific exam
const mockExam = {
    id: "1",
    title: "Algebra Midterm",
    subject: "Math",
    duration: 60,
    questions: [
        { id: "1", text: "Solve for x: 2x + 5 = 15", options: ["5", "10", "2.5", "0"], correctAnswer: "5" },
        { id: "2", text: "What is the square root of 64?", options: ["6", "7", "8", "9"], correctAnswer: "8" },
        { id: "3", text: "Simplify: 3(x + 2)", options: ["3x + 2", "3x + 6", "x + 6", "3x + 5"], correctAnswer: "3x + 6" },
    ]
}

export default function ExamReviewPage() { // In real app, receive params: { params: { id: string } }
    const router = useRouter()

    return (
        <div className="space-y-6 max-w-4xl mx-auto custom-print-layout">
            <div className="flex items-center justify-between dont-print">
                <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Exams
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Exam Sheet
                </Button>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-8 space-y-8 print:border-0 print:shadow-none">
                <div className="text-center border-b pb-6">
                    <h1 className="text-3xl font-bold">{mockExam.title}</h1>
                    <p className="text-muted-foreground mt-2">{mockExam.subject} • {mockExam.duration} Minutes</p>
                    <div className="mt-4 flex justify-between text-sm text-left max-w-md mx-auto">
                        <p>Name: __________________________</p>
                        <p>Date: ________________</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {mockExam.questions.map((q, index) => (
                        <div key={q.id} className="space-y-2">
                            <p className="font-medium text-lg">{index + 1}. {q.text}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                {q.options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full border border-input flex items-center justify-center shrink-0">
                                            <div className="h-2 w-2 rounded-full hidden" />
                                        </div>
                                        <span>{opt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
