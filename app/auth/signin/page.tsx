"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function SignIn() {
    const router = useRouter();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            console.error("Error signing in with Google:", error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Sign in to Cornell Tech Hub
                    </CardTitle>
                    <CardDescription className="text-center">
                        Use your Cornell email address to access the platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 text-center">
                        <h3 className="text-lg font-medium">
                            Sign in with your Cornell email address using Google
                        </h3>

                        <div className="space-y-2 text-muted-foreground">
                            <p className="text-sm font-medium">
                                You must use your Cornell email address
                                (@cornell.edu)
                            </p>
                            <p className="text-sm">
                                This ensures that only Cornell Tech students can
                                access the platform
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleGoogleSignIn}
                            className="w-full font-medium"
                            size="lg"
                            disabled={isGoogleLoading}
                        >
                            {isGoogleLoading
                                ? "Signing in..."
                                : "Sign in with Google"}
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            href="/auth/signup"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
