import { Metadata } from "next"
import Link from "next/link"
import { UserAuthForm } from "@/features/auth/components/UserAuthForm"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Authentication",
    description: "Authentication forms built using the components.",
}

export default function LoginPage() {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UserAuthForm />
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
