"use client";

import Link from "next/link"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockStats } from "@/lib/mockData"
import { useLessons, useCreateLesson } from "@/features/teacher/hooks/useLessons"
import { PlusCircle, FileText } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

const DRAFT_STORAGE_KEY = "lesson_draft"

export default function LessonsPage() {
    const params = useParams();
    const userId = params?.userId as string;
    const { data: lessons, isLoading, error } = useLessons(userId)
    const router = useRouter();
    const [lessonDrafts, setLessonDrafts] = useState<any[]>([]);

    // Load drafts from localStorage on client side only
    useEffect(() => {
        const draftsFromStorage = localStorage.getItem(DRAFT_STORAGE_KEY)
        if (draftsFromStorage) {
            try {
                const parsedDrafts = JSON.parse(draftsFromStorage)
                setLessonDrafts(Array.isArray(parsedDrafts) ? parsedDrafts : [])
            } catch (error) {
                console.error("Failed to parse drafts:", error)
                setLessonDrafts([])
            }
        }
    }, [])

    const createNewLesson = () => {
        router.push(`/teacher/${userId}/lessons/create`);
    }

    const lessonsHandler = () => {
        const allLessons = [];

        // Add published lessons
        if (lessons && lessons.length > 0) {
            allLessons.push(...lessons);
        }

        // Add draft lessons
        if (lessonDrafts && lessonDrafts.length > 0) {
            allLessons.push(...lessonDrafts);
        }

        // Sort by createdAt date (newest first)
        if (allLessons.length > 0) {
            return allLessons.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
        }

        return [];
    }

    const hasNoLessons = (!lessons || lessons.length === 0) && (!lessonDrafts || lessonDrafts.length === 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
                <Button onClick={createNewLesson}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Lesson
                </Button>
            </div>

            {hasNoLessons ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border rounded-lg bg-muted/20">
                    <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No lessons created yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mt-2">
                        Get started by creating your first lesson for your students.
                    </p>
                    <Button onClick={createNewLesson} className="mt-4" variant="outline">
                        Create Lesson
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lessonsHandler().map((lesson: any) => (
                        <Card key={lesson.id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 text-clip overflow-hidden">
                                <div className="space-y-1">
                                    <CardTitle>{lesson.title}</CardTitle>
                                    <CardDescription>{lesson.subject}</CardDescription>
                                </div>
                                <div className="rounded-full bg-secondary p-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                                    <span>{new Date(lesson.createdAt).toISOString()
                                        .slice(0, 16)
                                        .replace("T", " ")}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${lesson.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {lesson.status || 'Published'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )

}
