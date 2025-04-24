"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Define the form schema
const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Initialize the form
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
        },
    });

    // Fetch user profile data
    useEffect(() => {
        async function fetchProfile() {
            if (status === "authenticated") {
                try {
                    const response = await fetch("/api/user/profile");

                    if (response.ok) {
                        const data = await response.json();
                        form.reset({
                            name: data.name || "",
                            email: data.email || "",
                        });
                    } else {
                        console.error(
                            "Failed to fetch profile:",
                            await response.text()
                        );
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                } finally {
                    setIsFetching(false);
                }
            }
        }

        fetchProfile();
    }, [status, form]);

    // Handle form submission
    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update profile");
            }

            const updatedProfile = await response.json();

            // Update the session with the new name
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: updatedProfile.name,
                },
            });

            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile"
            );
        } finally {
            setIsLoading(false);
        }
    }

    // Show loading state while checking authentication or fetching profile
    if (status === "loading" || isFetching) {
        return (
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
                <p>Loading...</p>
            </div>
        );
    }

    // If not authenticated, don't render anything (will redirect)
    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="container max-w-4xl py-10">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>
                                    Update your profile information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage
                                            src={session?.user?.image || ""}
                                            alt={session?.user?.name || ""}
                                        />
                                        <AvatarFallback>
                                            {session?.user?.name?.charAt(0) ||
                                                "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-medium">
                                            Profile Picture
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your profile picture is managed
                                            through your Google account.
                                        </p>
                                    </div>
                                </div>

                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Your name"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        This is your public
                                                        display name.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Your email"
                                                            {...field}
                                                            disabled
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Your email is managed
                                                        through your Google
                                                        account.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading
                                                ? "Saving..."
                                                : "Save changes"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="account" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account</CardTitle>
                                <CardDescription>
                                    Manage your account settings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">
                                        Authentication
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        You are signed in with Google using your
                                        Cornell email address.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/")}
                                >
                                    Cancel
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
