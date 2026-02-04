"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, Resolver } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import { ILessonRequest, useLessonsByLessonId, useUpdateLesson } from "@/features/teacher/hooks/useLessons"
import { v4 as uuidv4 } from "uuid"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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
    url: yup
        .string()
        .url("Invalid URL")
        .notRequired()
        .nullable()
        .transform((value) => (value === "" ? null : value)),
})

interface LessonFormData {
    id?: string;
    title: string;
    subject: string;
    content: string;
    url?: string;
}

const DRAFT_STORAGE_KEY = "lesson_draft"

export default function EditLessonPage() {
    const router = useRouter()
    const params = useParams()
    const userId = params?.userId as string
    const lessonId = params?.lessonId as string
    const { data: lessons, isLoading, error } = useLessonsByLessonId(lessonId)
    const { data: lesson, error: lessonError, mutateAsync: updateLesson, isPending: updateLessonPending } = useUpdateLesson(lessonId)
    const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LessonFormData>({
        resolver: yupResolver(lessonSchema) as Resolver<LessonFormData>,
        defaultValues: {
            title: lessons?.title || "",
            subject: lessons?.subject || "",
            content: lessons?.content || "",
            url: lessons?.filePath || "",
        }
    })
    // Watch form values to track changes
    const formValues = watch()

    React.useEffect(() => {
        if (lessons) {
            console.log("Zebra", lessons);
            setValue("title", lessons.title)
            setValue("subject", lessons.subject)
            setValue("content", lessons.content)
            setValue("url", lessons.filePath)
        }
    }, [lessons, reset])

    async function onSubmit(data: LessonFormData) {
        try {
            console.log("Semester", data);
            // Ensure id is present if we are editing
            const lessonData: ILessonRequest = {
                ...data,
                id: lessonId
            };

            await updateLesson(lessonData, {
                onSuccess: () => {
                    router.push(`/teacher/${userId}/lessons`)
                }
            })
        } catch (error) {
            console.error("Failed to update lesson:", error)
        }
    }

    const handleBackClick = () => {
        router.back()
    }

    const handleSaveAsDraft = () => {
        // Get available lesson drafts
        const lessonDrafts = localStorage.getItem(DRAFT_STORAGE_KEY)

        if (lessonDrafts) {
            // If drafts exist, add the new draft to the array
            const drafts = JSON.parse(lessonDrafts)
            drafts.push({
                id: uuidv4(),
                title: formValues.title || "",
                subject: formValues.subject || "",
                content: formValues.content || "",
                createdAt: new Date().toISOString(),
                status: "Draft",
                teacherId: userId,
            })
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts))
        } else {
            // If no drafts exist, create a new array with the first draft
            const drafts = [{
                id: uuidv4(),
                title: formValues.title || "",
                subject: formValues.subject || "",
                content: formValues.content || "",
                createdAt: new Date().toISOString(),
                status: "Draft",
                teacherId: userId,
            }]
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts))
        }

        setShowConfirmDialog(false)
        router.back()
    }

    const handleDiscard = () => {
        // Clear any saved draft and navigate back
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        setShowConfirmDialog(false)
        router.back()
    }

    const handleCancel = () => {
        // Just close the dialog, stay on the page
        setShowConfirmDialog(false)
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <Button variant="ghost" className="pl-0" onClick={handleBackClick}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Lessons
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Lesson</CardTitle>
                    <CardDescription>
                        Update lesson details for your students.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Lesson Title*</Label>
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
                            <Label htmlFor="subject">Subject*</Label>
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
                            <Label htmlFor="url">Content URL / Material</Label>
                            <Input id="url" placeholder="Link to PDF or Video" {...register("url")} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Content*</Label>
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
                        <Button type="submit" disabled={isSubmitting || updateLessonPending}>
                            {(isSubmitting || updateLessonPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Update Lesson
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save as Draft?</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. Would you like to save this lesson as a draft before leaving?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDiscard}>
                            Discard
                        </Button>
                        <Button onClick={handleSaveAsDraft}>
                            Save as Draft
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
