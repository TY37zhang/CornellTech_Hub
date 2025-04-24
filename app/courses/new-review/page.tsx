"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function NewReviewPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        professor: "",
        category: "",
        difficulty: 5,
        workload: 5,
        value: 5,
        review: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log("Form submitted:", formData);
        // Redirect back to courses page after submission
        router.push("/courses");
    };

    return (
        <div className="container max-w-2xl py-10">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Add a New Course Review</CardTitle>
                    <CardDescription>
                        Share your experience with a Cornell Tech course to help
                        other students make informed decisions.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Course Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Machine Learning"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="professor">Professor</Label>
                            <Input
                                id="professor"
                                placeholder="e.g., Prof. John Doe"
                                value={formData.professor}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        professor: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Subject</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        category: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ceee">CEEE</SelectItem>
                                    <SelectItem value="cs">CS</SelectItem>
                                    <SelectItem value="ece">ECE</SelectItem>
                                    <SelectItem value="hadm">HADM</SelectItem>
                                    <SelectItem value="info">INFO</SelectItem>
                                    <SelectItem value="law">LAW</SelectItem>
                                    <SelectItem value="orie">ORIE</SelectItem>
                                    <SelectItem value="tech">TECH</SelectItem>
                                    <SelectItem value="techie">
                                        TECHIE
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Difficulty (1-10)</Label>
                                <Slider
                                    value={[formData.difficulty]}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            difficulty: value[0],
                                        })
                                    }
                                    min={1}
                                    max={10}
                                    step={0.5}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Current value: {formData.difficulty}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Workload (1-10)</Label>
                                <Slider
                                    value={[formData.workload]}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            workload: value[0],
                                        })
                                    }
                                    min={1}
                                    max={10}
                                    step={0.5}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Current value: {formData.workload}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Value (1-10)</Label>
                                <Slider
                                    value={[formData.value]}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            value: value[0],
                                        })
                                    }
                                    min={1}
                                    max={10}
                                    step={0.5}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Current value: {formData.value}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="review">Review</Label>
                            <Textarea
                                id="review"
                                placeholder="Share your experience with this course..."
                                value={formData.review}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        review: e.target.value,
                                    })
                                }
                                required
                                className="min-h-[150px]"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Submit Review
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
