import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Mail } from "lucide-react"

// Mock students
const students = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", grade: "A" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", grade: "B+" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", grade: "A-" },
    { id: 4, name: "Diana Prince", email: "diana@example.com", grade: "B" },
]

export default function StudentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                <Button variant="outline">Import CSV</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                    <Card key={student.id}>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base">{student.name}</CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <Mail className="mr-1 h-3 w-3" />
                                    {student.email}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-muted-foreground">Current Grade</span>
                                <span className="font-bold">{student.grade}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
