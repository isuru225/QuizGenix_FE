"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useUserInfo } from "@/features/LayOut/hooks/useUserInfoHook"
import { useAvailableExams } from "@/features/student/hooks/useStudentExams"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, Clock, Calendar, ChevronRight, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function StudentExamsPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params?.userId as string

    const { data: userInfo, isLoading: userLoading } = useUserInfo(userId)
    const { data: exams, isLoading: examsLoading } = useAvailableExams(userInfo?.grade || 0)

    const [filterStatus, setFilterStatus] = React.useState<string>("All")
    const [searchQuery, setSearchQuery] = React.useState("")

    if (userLoading || examsLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const filteredExams = exams?.filter(exam => {
        const matchesStatus = filterStatus === "All" || exam.status === filterStatus
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const statusColors: Record<string, string> = {
        'Upcoming': 'bg-blue-100 text-blue-700',
        'Ongoing': 'bg-green-100 text-green-700',
        'Completed': 'bg-gray-100 text-gray-700'
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
                    <p className="text-muted-foreground mt-1">Manage and take your assigned examinations.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search exams..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {["All", "Upcoming", "Ongoing", "Completed"].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                            className="whitespace-nowrap"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {!filteredExams || filteredExams.length === 0 ? (
                    <Card className="border-dashed border-2 bg-muted/20">
                        <CardContent className="h-[200px] flex flex-col items-center justify-center text-center space-y-2">
                            <BookOpen className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground">No exams found matching your criteria.</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredExams.map((exam) => (
                        <Card key={exam.id} className="hover:border-primary/50 transition-colors shadow-sm overflow-hidden border-2">
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className={statusColors[exam.status]}>
                                            {exam.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {exam.lessonTitle}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{exam.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {exam.description}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {exam.durationMinutes} Minutes
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            Starts: {new Date(exam.scheduledStartTime).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-6 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l min-w-[200px] gap-2">
                                    {exam.status === 'Ongoing' ? (
                                        <Button
                                            className="w-full font-bold"
                                            onClick={() => router.push(`/student/${userId}/exams/${exam.id}`)}
                                        >
                                            Take Exam
                                        </Button>
                                    ) : exam.status === 'Upcoming' ? (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push(`/student/${userId}/exams/${exam.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            className="w-full"
                                            disabled
                                        >
                                            Review Result
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
