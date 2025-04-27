"use client";

import { AnimatedCard, AnimatedCardList } from "./animated-card";
import {
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "./card";
import { Button } from "./button";

export function CourseCardExample() {
    const courses = [
        {
            id: 1,
            title: "CS 5787: Machine Learning",
            description:
                "Introduction to machine learning algorithms and techniques",
            instructor: "Dr. John Smith",
            rating: 4.5,
        },
        {
            id: 2,
            title: "CS 5788: Deep Learning",
            description:
                "Advanced neural networks and deep learning architectures",
            instructor: "Dr. Jane Doe",
            rating: 4.8,
        },
        {
            id: 3,
            title: "CS 5789: Natural Language Processing",
            description:
                "Techniques for processing and understanding human language",
            instructor: "Dr. Robert Johnson",
            rating: 4.3,
        },
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Course Examples</h2>
            <AnimatedCardList className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <AnimatedCard key={course.id} className="h-full">
                        <CardHeader>
                            <CardTitle>{course.title}</CardTitle>
                            <CardDescription>
                                Instructor: {course.instructor}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>{course.description}</p>
                            <div className="mt-4 flex items-center">
                                <span className="text-yellow-500 mr-1">★</span>
                                <span>{course.rating}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">View Details</Button>
                        </CardFooter>
                    </AnimatedCard>
                ))}
            </AnimatedCardList>
        </div>
    );
}

export function ForumPostExample() {
    const posts = [
        {
            id: 1,
            title: "Looking for study group for CS 5787",
            author: "Alice Johnson",
            date: "2 days ago",
            replies: 5,
        },
        {
            id: 2,
            title: "Tips for surviving the first semester",
            author: "Bob Smith",
            date: "1 week ago",
            replies: 12,
        },
        {
            id: 3,
            title: "Internship opportunities for summer 2025",
            author: "Carol Williams",
            date: "3 days ago",
            replies: 8,
        },
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Forum Post Examples</h2>
            <AnimatedCardList className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <AnimatedCard key={post.id} className="h-full">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {post.title}
                            </CardTitle>
                            <CardDescription>
                                Posted by {post.author} • {post.date}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                This is a sample forum post content. Click to
                                read more...
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                {post.replies} replies
                            </span>
                            <Button variant="outline" size="sm">
                                View Discussion
                            </Button>
                        </CardFooter>
                    </AnimatedCard>
                ))}
            </AnimatedCardList>
        </div>
    );
}
