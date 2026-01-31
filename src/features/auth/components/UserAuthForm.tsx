"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useLogin } from "../hooks/useAuthHook"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    isRegister?: boolean
}

export function UserAuthForm({ className, isRegister, ...props }: UserAuthFormProps) {
    const router = useRouter()
    //const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [role, setRole] = React.useState<"student" | "teacher">("student")
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const { mutate: login, isLoading, isError, error, isSuccess, data } = useLogin();

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()

        // Mock API call
        login(
            { email, password },
            {
                onSuccess: (res) => {
                    console.log("King", res)
                    if (res.role === "Teacher") {
                        router.push(`teacher/${res.userId}/dashboard`); // redirect after success
                    } else {
                        router.push(`student/${res.userId}/dashboard`); // redirect after success
                    }
                },
                onError: (err) => {
                    console.error(err);
                }
            }
        );
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    {isRegister && (
                        <div className="grid gap-2">
                            <Label htmlFor="role">I am a</Label>
                            <select
                                id="role"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={role}
                                onChange={(e) => setRole(e.target.value as "student" | "teacher")}
                                disabled={isLoading}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                    )}
                    {!isRegister && (
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required />
                        </div>
                    )}
                    <Button disabled={isLoading}>
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isRegister ? "Sign Up" : "Sign In"}
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading} onClick={() => {
                // Mock demo login
                setRole("teacher")
                // Trigger submit naturally or just redirect
                router.push("/teacher/dashboard")
            }}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <span className="mr-2">Demo Teacher</span>
                )}
            </Button>
            {isError && <p className="text-red-500">{error?.response?.data?.message || error.message}</p>}
        </div>
    )
}
