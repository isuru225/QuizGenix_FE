"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, BookOpen, ChevronRight, Loader2 } from "lucide-react"
import { useUserInfo } from "@/features/LayOut/hooks/useUserInfoHook"
import { useAvailableExams } from "@/features/student/hooks/useStudentExams"
import { Button } from "@/components/ui/button"

export default function StudentDashboard() {
    const params = useParams()
    const router = useRouter()
    const userId = params?.userId as string

    const [grade, setGrade] = useState<number>(0)

    const { data: userInfo, isLoading: userLoading } = useUserInfo(userId)
    const { data: exams, isLoading: examsLoading } = useAvailableExams(userInfo?.grade || 0)

    console.log("Hinooo", userInfo?.grade);

    if (userLoading || examsLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }


    console.log("Seaman", exams);

    const assignedExamsCount = exams?.filter(e => e.status === 'Upcoming' || e.status === 'Ongoing').length || 0
    const completedExamsCount = exams?.filter(e => e.status === 'Completed').length || 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome, {userInfo?.username}!</h1>
                    <p className="text-muted-foreground mt-1">Grade {userInfo?.grade} Student</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assigned Exams</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignedExamsCount}</div>
                        <p className="text-xs text-muted-foreground">Active or upcoming</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedExamsCount}</div>
                        <p className="text-xs text-muted-foreground">Exam history</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admission Date</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-sm">
                            {userInfo?.admissionDate ? new Date(userInfo.admissionDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">Member since</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Available Exams</CardTitle>
                        <CardDescription>Click on an exam to view details and start.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {!exams || exams.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No exams assigned to your grade yet.</p>
                                </div>
                            ) : (
                                exams.map((exam) => (
                                    <div
                                        key={exam.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/student/${userId}/exams/${exam.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${exam.status === 'Ongoing' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold group-hover:text-primary transition-colors">{exam.title}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {exam.durationMinutes} mins
                                                    </span>
                                                    <span>•</span>
                                                    <span>{exam.lessonTitle}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Starts At</p>
                                                <p className="text-sm">{new Date(exam.scheduledStartTime).toLocaleString()}</p>
                                            </div>
                                            <Button size="sm" variant="ghost">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
