import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockStats } from "@/lib/mockData"
import { PlusCircle, GraduationCap, Clock, HelpCircle } from "lucide-react"

export default function ExamsPage() {
    const { exams } = mockStats.teacher

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
                <Link href="/teacher/exams/create">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Exam
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                    <Card key={exam.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 text-clip overflow-hidden">
                            <div className="space-y-1">
                                <CardTitle>{exam.title}</CardTitle>
                                <CardDescription>{exam.subject}</CardDescription>
                            </div>
                            <div className="rounded-full bg-secondary p-2">
                                <GraduationCap className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {exam.duration}
                                </div>
                                <div className="flex items-center">
                                    <HelpCircle className="mr-1 h-3 w-3" />
                                    {exam.questions} Qs
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exam.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {exam.status}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
