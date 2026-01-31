"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

export type Question = {
    id: string
    text: string
    options: string[]
    correctAnswer: string
}

interface QuestionEditorProps {
    onSave: (question: Question) => void
    onCancel: () => void
}

export function QuestionEditor({ onSave, onCancel }: QuestionEditorProps) {
    const [text, setText] = React.useState("")
    const [options, setOptions] = React.useState<string[]>(["", "", "", ""])
    const [correctAnswer, setCorrectAnswer] = React.useState<string>("0") // Index

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSave = () => {
        if (!text || options.some(o => !o)) return // Basic validation
        onSave({
            id: Math.random().toString(36).substr(2, 9),
            text,
            options,
            correctAnswer: options[parseInt(correctAnswer)]
        })
    }

    return (
        <Card className="border-dashed">
            <CardContent className="space-y-4 pt-6">
                <div className="grid gap-2">
                    <Label>Question Text</Label>
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g. What is the capital of France?"
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Options</Label>
                    {options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="correct"
                                checked={correctAnswer === index.toString()}
                                onChange={() => setCorrectAnswer(index.toString())}
                                className="h-4 w-4"
                            />
                            <Input
                                value={opt}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave}>Add Question</Button>
                </div>
            </CardContent>
        </Card>
    )
}
