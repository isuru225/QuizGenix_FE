"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Mail } from "lucide-react"
import { IStudentInfoResponse, useStudentInfo } from "@/features/student/hooks/useStudents"
import type { JSX } from "react";
import { useParams } from "next/navigation";

export default function StudentsPage() {
    const params = useParams();
    const teacherId = params?.userId as string;
    const { data: students, isLoading, error } = useStudentInfo(teacherId)

    const categorizeStudentsByGrade = (studentsInfo: IStudentInfoResponse[]) => {
        const groups: { grade: number; students: JSX.Element[] }[] = [];
        let currentGroup: JSX.Element[] = [];
        let currentGrade: number | null = null;

        // Sort students ascending by grade first
        const sortedStudents = [...studentsInfo].sort((a, b) => a.grade - b.grade);

        for (let i = 0; i < sortedStudents.length; i++) {
            const student = sortedStudents[i];

            currentGroup.push(
                <Card key={student.id}>
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{student.username}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                                <Mail className="mr-1 h-3 w-3" />
                                {student.email}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">{`Role : ${student.role == 1 ? "Student" : "Teacher"}`}</span>
                            <span>{`Admission : ${student.admissionDate.split("T")[0]}`}</span>
                        </div>
                    </CardContent>
                </Card>
            );

            // If next student has different grade OR last element, push the group
            if (i === sortedStudents.length - 1 || student.grade !== sortedStudents[i + 1].grade) {
                groups.push({
                    grade: student.grade,
                    students: [...currentGroup]
                });
                currentGroup = [];
            }
        }

        return groups;
    };

    const gradeGroups = categorizeStudentsByGrade(students ?? []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                <Button variant="outline">Import CSV</Button>
            </div>

            {gradeGroups.map((group, index) => (
                <div key={group.grade}>
                    {index > 0 && <hr className="my-6" />}
                    <h2 className="text-xl font-semibold mb-4">Grade {group.grade}</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {group.students}
                    </div>
                </div>
            ))}
        </div>
    )
}