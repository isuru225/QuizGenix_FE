"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { BookOpen, GraduationCap, LayoutDashboard, Settings, Users } from "lucide-react"
import { useUserInfo } from "@/features/LayOut/hooks/useUserInfoHook"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const pathname = usePathname()
    const params = useParams();
    const userId = params?.userId as string; // Adapt to whatever param name is in the folder structure [userId]

    // Mock role check - in real app this comes from auth context
    const isTeacher = pathname.includes("/teacher")
    const { data: userInfo, isLoading, isError, error } = useUserInfo(userId);
    const teacherRoutes = [
        { name: "Dashboard", href: `/teacher/${userId}/dashboard`, icon: LayoutDashboard },
        { name: "Lessons", href: `/teacher/${userId}/lessons`, icon: BookOpen },
        { name: "Exams", href: `/teacher/${userId}/exams`, icon: GraduationCap },
        { name: "Students", href: `/teacher/${userId}/students`, icon: Users },
        { name: "Settings", href: `/teacher/${userId}/settings`, icon: Settings },
    ]

    const studentRoutes = [
        { name: "Dashboard", href: `/student/${userId}/dashboard`, icon: LayoutDashboard },
        { name: "My Exams", href: `/student/${userId}/exams`, icon: GraduationCap },
        { name: "Settings", href: `/student/${userId}/settings`, icon: Settings },
    ]

    const routes = isTeacher ? teacherRoutes : studentRoutes

    console.log("Hinooo", userInfo)

    return (
        <div className="flex h-screen flex-col border-r bg-card w-64">
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight text-primary">QuizGenix</h2>
            </div>
            <div className="flex-1 px-4 py-2">
                <nav className="space-y-2">
                    {routes.map((route) => (
                        <Link key={route.href} href={route.href}>
                            <Button
                                variant={pathname === route.href ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-2",
                                    pathname === route.href && "bg-secondary"
                                )}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.name}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="p-4 border-t">
                <div className="flex items-center gap-2 px-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-xs">{isTeacher ? "T" : "S"}</span>
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">{isTeacher ? `Teacher: ${userInfo?.username} ` : "Student User"}</p>
                        <p className="text-xs text-muted-foreground">{userInfo?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
