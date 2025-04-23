import Link from "next/link";
import Image from "next/image";
import {
    BookOpen,
    Calendar,
    MessageSquare,
    ShoppingBag,
    Star,
    TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                        Cornell Tech Student Resource Hub
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Your one-stop platform for course
                                        reviews, discussions, marketplace, and
                                        campus resources.
                                    </p>
                                </div>
                                {/* <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button size="lg">Explore Resources</Button>
                                    <Button variant="outline" size="lg">
                                        Learn More
                                    </Button>
                                </div> */}
                            </div>
                            <Image
                                src="/placeholder.svg?height=550&width=550"
                                width={550}
                                height={550}
                                alt="Cornell Tech Campus"
                                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                            />
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-12 md:px-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Explore Resources
                        </h2>
                    </div>
                    <div className="mt-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-red-600" />
                                        Course Reviews
                                    </CardTitle>
                                    <CardDescription>
                                        Find and share reviews for Cornell Tech
                                        courses
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Machine Learning
                                            </span>
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Product Studio
                                            </span>
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Business Fundamentals
                                            </span>
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Star className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Link href="/courses">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                        >
                                            View All Courses
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-red-600" />
                                        Student Forum
                                    </CardTitle>
                                    <CardDescription>
                                        Connect with peers and discuss academic
                                        topics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Internship Tips
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                12 replies
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Housing in NYC
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                24 replies
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Startup Ideas
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                8 replies
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Link href="/forum">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                        >
                                            Join Discussions
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-red-600" />
                                        Marketplace
                                    </CardTitle>
                                    <CardDescription>
                                        Buy and sell items within the Cornell
                                        Tech community
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                MacBook Pro (2022)
                                            </span>
                                            <span className="text-xs font-medium">
                                                $1,200
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Textbooks Bundle
                                            </span>
                                            <span className="text-xs font-medium">
                                                $85
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Desk Chair
                                            </span>
                                            <span className="text-xs font-medium">
                                                $50
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Link href="/marketplace">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                        >
                                            Browse Marketplace
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-12 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Join the Cornell Tech Community
                            </h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                                Connect with fellow students, share resources,
                                and make the most of your Cornell Tech
                                experience.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Button size="lg">Sign Up Now</Button>
                            {/* <Button variant="outline" size="lg">
                                Learn More
                            </Button> */}
                        </div>
                    </div>
                </section>
            </main>
            <footer className="border-t bg-muted/40">
                <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/placeholder.svg?height=24&width=24"
                                alt="Cornell Tech Logo"
                                width={24}
                                height={24}
                                className="rounded-md"
                            />
                            <span className="text-lg font-bold">
                                Cornell Tech Hub
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            A resource platform for Cornell Tech students
                        </p>
                    </div>
                    <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                        <div className="grid gap-3 text-sm">
                            <h3 className="font-semibold">Platform</h3>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Courses
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Forum
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Marketplace
                            </Link>
                        </div>
                        <div className="grid gap-3 text-sm">
                            <h3 className="font-semibold">Resources</h3>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Housing
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Events
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Career
                            </Link>
                        </div>
                        <div className="grid gap-3 text-sm">
                            <h3 className="font-semibold">Legal</h3>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Contact
                            </Link>
                        </div>
                    </nav>
                </div>
                <div className="container py-4 text-center text-sm text-muted-foreground border-t">
                    &copy; {new Date().getFullYear()} Cornell Tech Student
                    Resource Hub. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
