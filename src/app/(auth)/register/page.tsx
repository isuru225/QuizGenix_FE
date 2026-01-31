import { Metadata } from "next"
import Link from "next/link"
import { UserAuthForm } from "@/features/auth/components/UserAuthForm"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Create an account",
    description: "Create an account to get started.",
}

export default function RegisterPage() {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your email below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UserAuthForm isRegister />
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                        Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
