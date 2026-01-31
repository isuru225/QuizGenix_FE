export const mockStats = {
    teacher: {
        totalLessons: 12,
        totalExams: 5,
        totalStudents: 48,
        recentActivity: [
            { id: 1, action: "Created 'Math 101' Lesson", time: "2 hours ago" },
            { id: 2, action: "Published 'Midterm Exam'", time: "5 hours ago" },
            { id: 3, action: "Graded 15 exams", time: "1 day ago" },
        ],
        lessons: [
            { id: 1, title: "Introduction to Algebra", subject: "Math", date: "2023-10-01", status: "Published" },
            { id: 2, title: "Physics: Newton's Laws", subject: "Physics", date: "2023-10-05", status: "Draft" },
            { id: 3, title: "World History: WWII", subject: "History", date: "2023-10-10", status: "Published" },
        ],
        exams: [
            { id: 1, title: "Algebra Midterm", subject: "Math", duration: "60 min", questions: 15, status: "Active" },
            { id: 2, title: "Physics Quiz 1", subject: "Physics", duration: "30 min", questions: 10, status: "Draft" },
        ]
    },
    student: {
        assignedExams: 3,
        completedExams: 10,
        averageScore: 85,
        upcomingExams: [
            { id: 1, name: "Physics Final", date: "Tomorrow, 10:00 AM" },
            { id: 2, name: "History Quiz", date: "Fri, 2:00 PM" },
        ]
    }
}
