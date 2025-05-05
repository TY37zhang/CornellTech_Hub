"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import React from "react";

const contactFormSchema = z.object({
    name: z.string().min(2, { message: "Name is required" }),
    email: z.string().email({ message: "Valid email is required" }),
    subject: z.string().min(2, { message: "Subject is required" }),
    message: z
        .string()
        .min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            subject: "",
            message: "",
        },
    });

    // If session changes (user logs in/out), update form values
    useEffect(() => {
        form.reset({
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            subject: "",
            message: "",
        });
    }, [session]);

    async function onSubmit(data: ContactFormValues) {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Failed to send message");
            }
            toast({
                title: "Message sent",
                description:
                    "Thank you for reaching out! We'll get back to you soon.",
            });
            form.reset();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container max-w-4xl py-8">
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            Get in Touch
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Have questions, suggestions, or feedback? We'd love
                            to hear from you! Fill out the form and we'll get
                            back to you as soon as possible.
                        </p>
                        <form
                            className="space-y-4"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    {...form.register("name")}
                                    placeholder="Your name"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...form.register("email")}
                                    placeholder="your@email.com"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    {...form.register("subject")}
                                    placeholder="What's this about?"
                                />
                                {form.formState.errors.subject && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.subject.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    {...form.register("message")}
                                    placeholder="Your message here..."
                                    className="min-h-[150px]"
                                />
                                {form.formState.errors.message && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.message.message}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </section>
                </div>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            Contact Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Email</h3>
                                <a
                                    href="mailto:hi@cornelltechhub.info"
                                    className="text-primary hover:underline"
                                >
                                    hi@cornelltechhub.info
                                </a>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Location</h3>
                                <p className="text-muted-foreground">
                                    Somewhere in the world, with a good
                                    internet.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Check out our FAQ page for answers to common
                            questions about the platform.
                        </p>
                        <Button variant="outline" asChild>
                            <a href="/faq">Visit FAQ Page</a>
                        </Button>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">
                            Feedback
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Have suggestions for improving the platform? Visit
                            our feedback page to share your ideas.
                        </p>
                        <Button variant="outline" asChild>
                            <a href="/feedback">Share Feedback</a>
                        </Button>
                    </section>
                </div>
            </div>
        </div>
    );
}
