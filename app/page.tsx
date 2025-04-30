import Link from "next/link";
import Image from "next/image";
import {
    BookOpen,
    Calendar,
    MessageSquare,
    ShoppingBag,
    Star,
    TrendingUp,
    Link as LinkIcon,
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
                        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_700px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                        Cornell Tech Hub
                                    </h1>
                                    <p className="text-sm text-muted-foreground italic">
                                        This is a student-built independent
                                        project and is not officially affiliated
                                        with Cornell Tech.
                                    </p>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Connect with peers, share course
                                        reviews, and discover resources for your
                                        Cornell Tech journey.
                                    </p>
                                </div>
                                {/* <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button size="lg">Explore Resources</Button>
                                    <Button variant="outline" size="lg">
                                        Learn More
                                    </Button>
                                </div> */}
                            </div>
                            <div className="mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last">
                                <video
                                    src="/videos/We%20are%20Cornell%20Tech.mp4"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            </div>
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
                                            className="w-full shadow-sm hover:shadow-md transition-shadow"
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
                                            className="w-full shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            Join Discussions
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-red-600" />
                                        Useful Links
                                    </CardTitle>
                                    <CardDescription>
                                        Quick access to important Cornell Tech
                                        resources
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href="https://cornelltech.campusgroups.com/events"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline"
                                            >
                                                Campus Events
                                            </Link>
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href="https://cornell.joinhandshake.com/stu/postings"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline"
                                            >
                                                Handshake
                                            </Link>
                                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href="https://thehouseatcornelltech.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline"
                                            >
                                                The House @ Cornell Tech
                                            </Link>
                                            <Star className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Link
                                        href="https://admissions.tech.cornell.edu/dnu-admitted/resources/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            More Resources
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            {/* Marketplace Card - Temporarily Disabled
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
                            */}
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-12 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Join the Community
                            </h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                                Connect with fellow students, share resources,
                                and make the most of your Cornell Tech
                                experience.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Link href="/auth/signup">
                                <Button size="lg">Sign Up Now</Button>
                            </Link>
                            {/* <Button variant="outline" size="lg">
                                Learn More
                            </Button> */}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
