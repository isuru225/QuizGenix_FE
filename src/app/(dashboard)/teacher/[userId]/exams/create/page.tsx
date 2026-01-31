"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { QuestionEditor, type Question } from "@/features/exam/components/QuestionEditor"

export default function CreateExamPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [questions, setQuestions] = React.useState<Question[]>([])
    const [isAddingQuestion, setIsAddingQuestion] = React.useState(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        // Mock API
        setTimeout(() => {
            setIsLoading(false)
            router.push("/teacher/exams")
        }, 1000)
    }

    const handleDeleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-10">
            <div className="flex items-center mb-6">
                <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Exams
                </Button>
            </div>

            <form onSubmit={onSubmit}>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Exam Details</CardTitle>
                            <CardDescription>
                                Set up the basic information for the exam.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Exam Title</Label>
                                <Input id="title" placeholder="e.g. Midterm Physics" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="Math" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Duration (mins)</Label>
                                    <Input id="duration" type="number" placeholder="60" required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
                            <Button type="button" onClick={() => setIsAddingQuestion(true)} disabled={isAddingQuestion}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                            </Button>
                        </div>

                        {isAddingQuestion && (
                            <QuestionEditor
                                onSave={(q) => {
                                    setQuestions([...questions, q])
                                    setIsAddingQuestion(false)
                                }}
                                onCancel={() => setIsAddingQuestion(false)}
                            />
                        )}

                        {questions.map((q, index) => (
                            <Card key={q.id}>
                                <CardHeader className="flex flex-row items-center justify-between py-4">
                                    <CardTitle className="text-base font-medium">Q{index + 1}: {q.text}</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="pb-4 pt-0">
                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {q.options.map((opt, i) => (
                                            <li key={i} className={opt === q.correctAnswer ? "text-green-600 font-medium" : ""}>
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}

                        {questions.length === 0 && !isAddingQuestion && (
                            <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
                                No questions added yet.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save & Publish Exam
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
