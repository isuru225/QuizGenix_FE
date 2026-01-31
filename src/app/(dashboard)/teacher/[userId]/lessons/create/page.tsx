"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import { useCreateLesson, ILessonRequest } from "@/features/teacher/hooks/useLessons"

// Yup validation schema
const lessonSchema = yup.object({
    title: yup
        .string()
        .required("Lesson title is required")
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must not exceed 100 characters"),
    subject: yup
        .string()
        .required("Subject is required")
        .min(2, "Subject must be at least 2 characters")
        .max(50, "Subject must not exceed 50 characters"),
    content: yup
        .string()
        .required("Content is required")
        .min(10, "Content must be at least 10 characters"),
}).required()

type LessonFormData = yup.InferType<typeof lessonSchema>

export default function CreateLessonPage() {
    const router = useRouter()
    const params = useParams()
    const userId = params?.userId as string
    const createLessonMutation = useCreateLesson(userId)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LessonFormData>({
        resolver: yupResolver(lessonSchema),
    })

    async function onSubmit(data: LessonFormData) {
        try {
            await createLessonMutation.mutateAsync(data as ILessonRequest)
            router.push(`/teacher/${userId}/lessons`)
        } catch (error) {
            console.error("Failed to create lesson:", error)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Lessons
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Lesson</CardTitle>
                    <CardDescription>
                        Add a new lesson for your students.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Lesson Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Introduction to Calculus"
                                {...register("title")}
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="e.g. Mathematics"
                                {...register("subject")}
                                className={errors.subject ? "border-red-500" : ""}
                            />
                            {errors.subject && (
                                <p className="text-sm text-red-500">{errors.subject.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Content URL / Material</Label>
                            <Input id="content" placeholder="Link to PDF or Video" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Content</Label>
                            <textarea
                                id="content"
                                {...register("content")}
                                className={`flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.content ? "border-red-500" : ""
                                    }`}
                                placeholder="Lesson content..."
                            />
                            {errors.content && (
                                <p className="text-sm text-red-500">{errors.content.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || createLessonMutation.isPending}>
                            {(isSubmitting || createLessonMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Lesson
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
