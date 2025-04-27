"use client";

import { useState, useEffect } from "react";
import { CourseCardExample } from "@/components/ui/card-example";
import { ForumPostList } from "@/components/ui/forum-post-card";

const samplePosts = [
    {
        id: 1,
        title: "Looking for study group for CS 5787",
        author: "Alice Johnson",
        date: "2 days ago",
        replies: 5,
        content:
            "Hi everyone! I'm looking to form a study group for CS 5787 this semester. Anyone interested in meeting weekly?",
    },
    {
        id: 2,
        title: "Tips for surviving the first semester",
        author: "Bob Smith",
        date: "1 week ago",
        replies: 12,
        content:
            "Sharing some valuable tips I learned during my first semester at Cornell Tech...",
    },
    {
        id: 3,
        title: "Internship opportunities for summer 2025",
        author: "Carol Williams",
        date: "3 days ago",
        replies: 8,
        content:
            "I've compiled a list of companies that are already accepting applications for summer 2025 internships...",
    },
];

export default function AnimatedCardsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        // Simulate data fetching
        const fetchPosts = async () => {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setPosts(samplePosts);
            setIsLoading(false);
        };

        fetchPosts();
    }, []);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Animated Cards Examples</h1>
            <p className="text-muted-foreground mb-8">
                These examples demonstrate how to use the animated card
                components in your application. The cards have smooth
                transitions and hover effects that enhance the user experience.
            </p>

            <CourseCardExample />

            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">
                    Forum Posts with Smooth Transitions
                </h2>
                <ForumPostList posts={posts} isLoading={isLoading} />
            </div>
        </div>
    );
}
