import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-muted/20">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome to QuizGenix</h1>
        <p className="text-muted-foreground text-center max-w-lg">
          The ultimate platform for teachers to create lessons, exams, and for students to test their knowledge.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-8">
          <Card>
            <CardHeader>
              <CardTitle>For Teachers</CardTitle>
              <CardDescription>Create lessons, exams, and manage students.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/teacher/dashboard">
                <Button className="w-full">Enter as Teacher</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Students</CardTitle>
              <CardDescription>View lessons and take assigned exams.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/dashboard">
                <Button variant="outline" className="w-full">Enter as Student</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Link href="/login">
            <Button variant="link">Go to Login Page</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
