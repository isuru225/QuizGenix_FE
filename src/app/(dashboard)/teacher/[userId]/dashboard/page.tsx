"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import React, { useState, useEffect, JSX } from "react";
import { BookOpen, GraduationCap, Users, Activity } from "lucide-react"
import { useDashBoad } from "@/features/teacher/hooks/useDashBoard"
import { useParams } from "next/navigation"
import { ITeacherDashboardResponse, IExamLessonPair } from "@/features/teacher/hooks/useDashBoard"

export default function TeacherDashboard() {
    const params = useParams();
    const userId = params?.userId as string;
    const { data: dashboardData } = useDashBoad(userId)
    const [noStats, setNoStats] = useState<any[]>([]);

    console.log(dashboardData, "helicoptor");

    const dashboardStatsHandler = () => {
        const lessonIds: string[] = [];
        const examIds: string[] = [];
        const upcoingEvents: JSX.Element[] = [];

        dashboardData?.examLessonPairs.forEach((dashBorad: IExamLessonPair) => {
            if (!lessonIds.includes(dashBorad.lesson.id)) {
                lessonIds.push(dashBorad.lesson.id)
            }
            if (!examIds.includes(dashBorad.exam.id)) {
                examIds.push(dashBorad.exam.id)
            }
            console.log("Dogggg123", dashBorad.exam.scheduledStartTime)
            if (new Date(dashBorad.exam.scheduledStartTime) > new Date()) {
                const target = new Date(dashBorad.exam.scheduledStartTime).getTime();
                const now = Date.now();
                const diffMs = target - now;

                const diffHours = diffMs / (1000 * 60 * 60);
                const diffDays = diffMs / (1000 * 60 * 60 * 24);
                upcoingEvents.push(
                    <div key={dashBorad.exam.id} className="flex items-center">
                        <span className="relative flex h-2 w-2 mr-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{`Upcoming Exam : ${dashBorad.exam.title}`}</p>
                            <p className="text-xs text-muted-foreground">{`Scheduled Time : ${new Date(dashBorad.exam.scheduledStartTime).toLocaleString()} - Remaining Time : ${diffDays >= 1 ? `${Math.floor(diffDays)} day(s)` : `${Math.floor(diffHours)} hour(s)`}`}</p>
                        </div>
                    </div>
                )
            }
        })
        console.log("siiiiii", lessonIds.length, examIds.length, dashboardData?.userInfoDtos.length ?? 0);
        setNoStats([lessonIds.length, examIds.length, dashboardData?.userInfoDtos.length ?? 0, upcoingEvents]);
    }

    useEffect(() => {
        dashboardStatsHandler();
    }, [dashboardData]);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{noStats[0]}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{noStats[1]}</div>
                        <p className="text-xs text-muted-foreground">+1 new this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{noStats[2]}</div>
                        <p className="text-xs text-muted-foreground">+4 enrolled recently</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Visual summary of your class performance (Mock Chart).</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full bg-muted/20 flex items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">Chart Placeholder</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {noStats[3]}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
