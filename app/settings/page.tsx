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
import { toast } from "@/components/ui/animated-toast";
import { Upload } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Define the form schema
const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    program: z.string().min(2, {
        message: "Please select a program.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const programs = {
    "meng-cs": "MEng in Computer Science",
    "meng-ds": "MEng in Data Science & Decision Analytics",
    "meng-ece": "MEng in Electrical and Computer Engineering",
    "meng-orie": "MEng in Operations Research & Information Engineering",
    "ms-dt": "MS in Design Technology",
    "ms-is-cm": "MS in Information Systems (Connective Media)",
    "ms-is-ht": "MS in Information Systems (Health Tech)",
    "ms-is-ut": "MS in Information Systems (Urban Tech)",
    mba: "Johnson Cornell Tech MBA",
    llm: "LLM in Law, Technology and Entrepreneurship",
};

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [name, setName] = useState("");
    const [program, setProgram] = useState("");
    const { toast } = useToast();

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
            program: session?.user?.program || "",
        },
    });

    // Fetch user profile data
    useEffect(() => {
        async function fetchProfile() {
            if (status === "authenticated") {
                try {
                    const response = await fetch("/api/user");

                    if (response.ok) {
                        const data = await response.json();
                        form.reset({
                            name: data.name || "",
                            email: data.email || "",
                            program: data.program || "",
                        });
                        setName(data.name || "");
                        setProgram(data.program || "");
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
            const response = await fetch("/api/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    program: data.program,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to update profile"
                );
            }

            await update(); // This will trigger a full session refresh
            router.refresh();

            toast({
                title: "Success",
                description: "Your settings have been saved successfully.",
                variant: "success",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to update settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Handle profile picture upload
    async function handleAvatarUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid File",
                message: "Please upload an image file",
                type: "error",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                message: "Image size should be less than 5MB",
                type: "error",
            });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/user/profile/avatar", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to update profile picture");
            }

            await update();
            router.refresh();

            toast({
                title: "Success!",
                message: "Profile picture updated successfully",
                type: "success",
            });
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            toast({
                title: "Error",
                message: "Failed to update profile picture",
                type: "error",
            });
        } finally {
            setIsUploading(false);
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
                                    <div className="relative">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage
                                                src={session?.user?.image || ""}
                                                alt={session?.user?.name || ""}
                                            />
                                            <AvatarFallback>
                                                {session?.user?.name?.charAt(
                                                    0
                                                ) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute bottom-0 right-0 p-1 bg-background rounded-full border cursor-pointer hover:bg-muted transition-colors"
                                        >
                                            <Upload className="h-4 w-4" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium">
                                            Profile Picture
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Upload a new profile picture.
                                            Supported formats: JPG, PNG, GIF.
                                            Max size: 5MB.
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
                                        <FormField
                                            control={form.control}
                                            name="program"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Program
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <SelectTrigger className="justify-start text-left w-full truncate">
                                                                <SelectValue
                                                                    className="text-left w-full truncate"
                                                                    placeholder="Select your program"
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(
                                                                    programs
                                                                ).map(
                                                                    ([
                                                                        value,
                                                                        label,
                                                                    ]) => (
                                                                        <SelectItem
                                                                            key={
                                                                                value
                                                                            }
                                                                            value={
                                                                                value
                                                                            }
                                                                            className="text-left w-full truncate"
                                                                        >
                                                                            {
                                                                                label
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormDescription>
                                                        Your program is managed
                                                        through your Cornell
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
