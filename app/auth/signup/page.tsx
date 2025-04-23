"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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

export default function SignUp() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            console.error("Error signing in with Google:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Create an account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 text-center">
                        <h3 className="text-lg font-medium">
                            Sign up with your Cornell email address using Google
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
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Signing up..."
                                : "Sign up with Google"}
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/auth/signin"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
