"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import CourseSelector from "./components/CourseSelector";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Calendar, Search, GraduationCap } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SelectedCourses from "./components/SelectedCourses";
import RequirementAssignment from "./components/RequirementAssignment";
import CourseSchedule from "./components/CourseSchedule";

interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    description?: string;
    department: string;
    semester: string;
    year: number;
}

interface Requirement {
    credits: number;
    description: string;
    courses?: Course[];
    categories?: {
        [key: string]: string[];
    };
}

interface ProgramRequirement {
    name: string;
    totalCredits: number;
    requirements: {
        [key: string]: Requirement;
    };
}

interface ProgramRequirements {
    [key: string]: ProgramRequirement;
}

// Program requirements data structure
const programRequirements: ProgramRequirements = {
    "meng-cs": {
        name: "MEng in Computer Science",
        totalCredits: 30,
        requirements: {
            TechnicalCourses: {
                credits: 18,
                description:
                    "15 CS course credits and 3 credits of Technical Electives (5000 and above, choose from CS, ORIE, ECE, and INFO courses)",
                courses: [],
            },
            StudioCourses: {
                credits: 8,
                description:
                    "Product Studio (4 credits), Startup/BigCo/PiTech Impact Studio (3 credits), and TECH Studio Elective (1 credit). All Studio courses must be taken for a letter grade.",
                courses: [],
            },
            GeneralElectives: {
                credits: 4,
                description:
                    "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses.",
                courses: [],
            },
        },
    },
    "meng-ds": {
        name: "MEng in Data Science & Decision Analytics",
        totalCredits: 30,
        requirements: {
            DataScienceCourses: {
                credits: 9,
                description:
                    "Three courses with at least one from each category",
                categories: {
                    mlDataScience: [
                        "CS 5304",
                        "ORIE 5355",
                        "CS 5785",
                        "CS 5781",
                        "CS 5787",
                        "ORIE 5381",
                    ],
                    modelingDecisionMaking: [
                        "ECE 5242",
                        "ORIE 5751",
                        "ECE 5260",
                        "ORIE 5380",
                        "ORIE 5530",
                    ],
                },
            },
            TechnicalCourses: {
                credits: 9,
                description:
                    "Technical Electives from ECE, CS, ORIE, or INFO courses",
                courses: [],
            },
            StudioCourses: {
                credits: 8,
                description:
                    "Product Studio (4 credits), Startup/BigCo/PiTech Impact Studio (3 credits), and TECH Studio Elective (1 credit). All Studio courses must be taken for a letter grade.",
                courses: [],
            },
            GeneralElectives: {
                credits: 4,
                description:
                    "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses.",
                courses: [],
            },
        },
    },
    "meng-ece": {
        name: "MEng in Electrical and Computer Engineering",
        totalCredits: 30,
        requirements: {
            TechnicalCourses: {
                credits: 18,
                description:
                    "ECE 5414 Applied Machine Learning OR CS 5781 Machine Learning Engineering (3 credits), ECE 5415 Applied Digital Signal Processing and Communications OR ECE 5746 Applied Digital ASIC Design OR ECE 5755 Computer Systems & Architecture (3 credits), 6 credits of ECE Electives, and 6 credits of Technical Electives (choose from any ECE, CS, ORIE, or INFO course offerings)",
                courses: [],
            },
            StudioCourses: {
                credits: 8,
                description:
                    "Product Studio (4 credits), Startup/BigCo/PiTech Impact Studio (3 credits), and TECH Studio Elective (1 credit). All Studio courses must be taken for a letter grade.",
                courses: [],
            },
            GeneralElectives: {
                credits: 4,
                description:
                    "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses.",
                courses: [],
            },
        },
    },
    "meng-orie": {
        name: "MEng in Operations Research and Information Engineering",
        totalCredits: 30,
        requirements: {
            TechnicalCourses: {
                credits: 18,
                description: "Core ORIE courses and technical electives",
                courses: [],
            },
            StudioCourses: {
                credits: 8,
                description:
                    "Product Studio (4 credits), Startup/BigCo/PiTech Impact Studio (3 credits), and TECH Studio Elective (1 credit). All Studio courses must be taken for a letter grade.",
                courses: [],
            },
            GeneralElectives: {
                credits: 4,
                description:
                    "Select from any offerings on Cornell Tech's campus (CS, ECE, ORIE, INFO, LAW, NBAY, TECH, TECHIE). Note: TECHIE 5310: Business Fundamentals (Fall only) must be taken as a prerequisite for all business courses.",
                courses: [],
            },
        },
    },
    "ms-dt": {
        name: "MS in Design Technology",
        totalCredits: 60,
        requirements: {
            StudioCourses: {
                credits: 12,
                description:
                    "Product Studio (4 credits), Startup Studio (4 credits), and Design Technology Studio (4 credits)",
                courses: [],
            },
            TechnicalCourses: {
                credits: 24,
                description: "Core technical courses in design and technology",
                courses: [],
            },
            GeneralElectives: {
                credits: 24,
                description:
                    "Select from any offerings on Cornell Tech's campus",
                courses: [],
            },
        },
    },
    "ms-is-cm": {
        name: "MS in Information Systems (Connective Media)",
        totalCredits: 60,
        requirements: {
            JacobsProgrammaticCore: {
                credits: 17,
                description:
                    "Studio courses (8 credits), Preparing for Spec (1 credit), and Specialization (8 credits)",
                courses: [],
            },
            JacobsTechnicalCore: {
                credits: 10,
                description:
                    "Algorithms/Systems (3), Machine Learning (3), HCI & Design (3), and Ethics (1)",
                courses: [],
            },
            SpecializationCourses: {
                credits: 8,
                description: "Connective Media specialization courses",
                courses: [],
            },
            GeneralElectives: {
                credits: 25,
                description:
                    "Select from any offerings on Cornell Tech's campus",
                courses: [],
            },
        },
    },
    "ms-is-ht": {
        name: "MS in Information Systems (Health Tech)",
        totalCredits: 60,
        requirements: {
            JacobsProgrammaticCore: {
                credits: 17,
                description:
                    "Studio courses (8 credits), Preparing for Spec (1 credit), and Specialization (8 credits)",
                courses: [],
            },
            JacobsTechnicalCore: {
                credits: 10,
                description:
                    "Algorithms/Systems (3), Machine Learning (3), HCI & Design (3), and Ethics (1)",
                courses: [],
            },
            SpecializationCourses: {
                credits: 8,
                description: "Health Tech specialization courses",
                courses: [],
            },
            GeneralElectives: {
                credits: 25,
                description:
                    "Select from any offerings on Cornell Tech's campus",
                courses: [],
            },
        },
    },
    "ms-is-ut": {
        name: "MS in Information Systems (Urban Tech)",
        totalCredits: 60,
        requirements: {
            JacobsProgrammaticCore: {
                credits: 17,
                description:
                    "Studio courses (8 credits), Preparing for Spec (1 credit), and Specialization (8 credits)",
                courses: [],
            },
            JacobsTechnicalCore: {
                credits: 10,
                description:
                    "Algorithms/Systems (3), Machine Learning (3), HCI & Design (3), and Ethics (1)",
                courses: [],
            },
            SpecializationCourses: {
                credits: 8,
                description: "Urban Tech specialization courses",
                courses: [],
            },
            GeneralElectives: {
                credits: 25,
                description:
                    "Select from any offerings on Cornell Tech's campus",
                courses: [],
            },
        },
    },
    mba: {
        name: "Johnson Cornell Tech MBA",
        totalCredits: 60,
        requirements: {
            CoreCourses: {
                credits: 30,
                description: "Core business and management courses",
                courses: [],
            },
            StudioCourses: {
                credits: 12,
                description:
                    "Product Studio (4 credits), Startup Studio (4 credits), and Business Studio (4 credits)",
                courses: [],
            },
            GeneralElectives: {
                credits: 18,
                description:
                    "Select from any offerings on Cornell Tech's campus",
                courses: [],
            },
        },
    },
    llm: {
        name: "LLM in Law, Technology, and Entrepreneurship",
        totalCredits: 24,
        requirements: {
            CoreCourses: {
                credits: 12,
                description: "Core law and technology courses",
                courses: [],
            },
            StudioCourses: {
                credits: 8,
                description:
                    "Product Studio (4 credits) and Law Studio (4 credits)",
                courses: [],
            },
            GeneralElectives: {
                credits: 4,
                description:
                    "Select from any offerings on Cornell Tech's campus",
                courses: [],
            },
        },
    },
};

export default function PlannerPage() {
    const { data: session } = useSession();
    const [userProgram, setUserProgram] = useState<string | null>(null);
    const [coursePlan, setCoursePlan] = useState<{ [key: string]: Course[] }>(
        {}
    );
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const initializePage = async () => {
            try {
                setIsLoading(true);

                if (session?.user?.program) {
                    console.log(
                        "Setting program from session:",
                        session.user.program
                    );
                    setUserProgram(session.user.program);
                    await loadSavedCoursePlans();
                } else {
                    console.log("Fetching program from API");
                    await fetchUserProgram();
                }
            } catch (error) {
                console.error("Error initializing page:", error);
                toast({
                    title: "Error",
                    description: "Failed to initialize the page",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();
    }, [session]);

    const loadSavedCoursePlans = async () => {
        try {
            console.log("Loading saved course plans...");
            const response = await fetch("/api/planner");
            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error(`Failed to load course plans: ${errorText}`);
            }

            const data = await response.json();
            console.log("Loaded course plans:", data);

            // Convert the flat list into the coursePlan structure
            const newCoursePlan: { [key: string]: Course[] } = {};
            data.forEach((plan: any) => {
                if (plan.requirementType) {
                    if (!newCoursePlan[plan.requirementType]) {
                        newCoursePlan[plan.requirementType] = [];
                    }
                    newCoursePlan[plan.requirementType].push(plan.course);
                }
            });

            setCoursePlan(newCoursePlan);

            // Add courses to selectedCourses if not already there
            const newSelectedCourses = [...selectedCourses];
            data.forEach((plan: any) => {
                if (!selectedCourses.some((c) => c.id === plan.course.id)) {
                    newSelectedCourses.push(plan.course);
                }
            });
            setSelectedCourses(newSelectedCourses);
        } catch (error) {
            console.error("Error loading course plans:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to load your saved course plans",
                variant: "destructive",
            });
            throw error; // Re-throw to be caught by the parent
        }
    };

    const fetchUserProgram = async () => {
        try {
            const response = await fetch("/api/user");
            const data = await response.json();
            console.log("API response data:", data);

            if (!data.program) {
                console.log("No program found in API response");
                toast({
                    title: "Program not set",
                    description:
                        "Please set your program in the settings page first.",
                    variant: "destructive",
                });
            } else {
                console.log("Setting program from API:", data.program);
                setUserProgram(data.program);
            }
        } catch (error) {
            console.error("Error fetching user program:", error);
            toast({
                title: "Error",
                description: "Failed to load your program information.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCoursesChange = (requirementKey: string, courses: Course[]) => {
        if (!userProgram) return;

        setCoursePlan((prevPlan: { [key: string]: Course[] }) => ({
            ...prevPlan,
            [requirementKey]: courses,
        }));

        // Calculate credits for this requirement
        const totalCreditsForRequirement = courses.reduce(
            (sum: number, course: Course) => sum + course.credits,
            0
        );
        const requiredCredits =
            programRequirements[userProgram].requirements[requirementKey]
                .credits;

        // Show appropriate toast based on credit count
        if (totalCreditsForRequirement > requiredCredits) {
            toast({
                title: "Warning",
                description: `You have selected ${totalCreditsForRequirement} credits for ${requirementKey.replace(/([A-Z])/g, " $1").trim()}, but only ${requiredCredits} are required.`,
                variant: "destructive",
                duration: 5000,
            });
        } else if (totalCreditsForRequirement === requiredCredits) {
            toast({
                title: "Success",
                description: `You have selected the required ${requiredCredits} credits for ${requirementKey.replace(/([A-Z])/g, " $1").trim()}.`,
                variant: "default",
                duration: 3000,
            });
        }
    };

    const calculateTotalCredits = () => {
        if (!userProgram) return 0;

        return Object.values(coursePlan).reduce(
            (total: number, courses: Course[]) => {
                return (
                    total +
                    courses.reduce(
                        (sum: number, course: Course) => sum + course.credits,
                        0
                    )
                );
            },
            0
        );
    };

    const calculateRequirementProgress = (requirementKey: string) => {
        if (!userProgram) return 0;

        const reqCourses: Course[] = coursePlan[requirementKey] || [];
        const totalCredits = reqCourses.reduce(
            (sum: number, course: Course) => sum + course.credits,
            0
        );
        const requiredCredits =
            programRequirements[userProgram].requirements[requirementKey]
                .credits;

        return (totalCredits / requiredCredits) * 100;
    };

    const calculateOverallProgress = () => {
        if (!userProgram) return 0;

        const totalCredits = calculateTotalCredits();
        const requiredCredits = programRequirements[userProgram].totalCredits;

        return (totalCredits / requiredCredits) * 100;
    };

    const handleCourseSelection = (courses: Course[]) => {
        setSelectedCourses(courses);
    };

    const handleAddToRequirement = async (
        course: Course,
        requirementKey: string | null
    ) => {
        if (!userProgram || !session?.user?.id) {
            toast({
                title: "Error",
                description:
                    "You must be logged in and have a program selected",
                variant: "destructive",
            });
            return;
        }

        try {
            if (!requirementKey) {
                // Remove from all requirements
                setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                    const newPlan = { ...prevPlan };
                    for (const key in newPlan) {
                        newPlan[key] = newPlan[key].filter(
                            (c) => c.id !== course.id
                        );
                    }
                    return newPlan;
                });

                // Delete from database
                const deleteResponse = await fetch(
                    `/api/planner?courseId=${course.id}&semester=${course.semester}&year=${course.year}`,
                    {
                        method: "DELETE",
                    }
                );

                if (!deleteResponse.ok) {
                    const errorText = await deleteResponse.text();
                    console.error("Error deleting course plan:", errorText);
                    throw new Error(
                        `Failed to delete course plan: ${errorText}`
                    );
                }

                return;
            }

            // Remove from other requirements first
            setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                const newPlan = { ...prevPlan };
                for (const key in newPlan) {
                    if (key !== requirementKey) {
                        newPlan[key] = newPlan[key].filter(
                            (c) => c.id !== course.id
                        );
                    }
                }
                return newPlan;
            });

            // Add to selected requirement
            setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
                const currentCourses = prevPlan[requirementKey] || [];
                const newTotalCredits =
                    currentCourses.reduce(
                        (sum: number, c: Course) => sum + c.credits,
                        0
                    ) + course.credits;

                if (
                    newTotalCredits >
                    programRequirements[userProgram].totalCredits
                ) {
                    toast({
                        title: "Warning",
                        description: `You have selected ${newTotalCredits} total credits, but only ${programRequirements[userProgram].totalCredits} are required for your program.`,
                        variant: "destructive",
                        duration: 5000,
                    });
                } else if (
                    newTotalCredits ===
                    programRequirements[userProgram].totalCredits
                ) {
                    toast({
                        title: "Success",
                        description: `You have selected the required ${programRequirements[userProgram].totalCredits} credits for your program.`,
                        variant: "default",
                        duration: 3000,
                    });
                }

                // Save to database
                const saveData = {
                    courseId: course.id,
                    requirementType: requirementKey,
                    semester: course.semester,
                    year: course.year,
                    status: "planned",
                };

                console.log("Saving course plan:", saveData);

                fetch("/api/planner", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(saveData),
                })
                    .then(async (response) => {
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error(
                                "Error saving course plan:",
                                errorText
                            );
                            throw new Error(
                                `Failed to save course plan: ${errorText}`
                            );
                        }
                        return response.json();
                    })
                    .then((data) => {
                        console.log("Course plan saved successfully:", data);
                    })
                    .catch((error) => {
                        console.error("Error in save operation:", error);
                        toast({
                            title: "Error",
                            description:
                                error.message || "Failed to save course plan",
                            variant: "destructive",
                        });
                    });

                return {
                    ...prevPlan,
                    [requirementKey]: [...currentCourses, course],
                };
            });
        } catch (error) {
            console.error("Error handling requirement assignment:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to update course requirements",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return <div className="container mx-auto py-8">Loading...</div>;
    }

    if (!userProgram || !programRequirements[userProgram]) {
        return (
            <div className="flex min-h-screen flex-col">
                <div className="flex-1">
                    <section className="w-full py-12 md:py-24 lg:py-16">
                        <div className="container px-4 md:px-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <Card className="w-full max-w-2xl">
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-2xl">
                                            Program Not Set
                                        </CardTitle>
                                        <CardDescription>
                                            Please set your program in the
                                            settings page before using the
                                            course planner.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Top Section with Gradient Background */}
            <div className="w-full bg-gradient-to-b from-pink-50 to-white">
                <div className="container mx-auto p-4">
                    {/* Program Title */}
                    <div className="text-center py-12">
                        <h1 className="text-4xl font-bold mb-4">
                            Course Planner
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Plan and track your courses at Cornell Tech to meet
                            your program requirements.
                        </p>
                    </div>

                    {/* Program Info */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3">
                            <GraduationCap className="h-6 w-6" />
                            <h2 className="text-xl font-semibold">
                                {programRequirements[userProgram].name}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4 space-y-6">
                {/* Overall Progress */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                Overall Progress
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {calculateTotalCredits()} /{" "}
                                {programRequirements[userProgram].totalCredits}{" "}
                                credits
                            </span>
                        </div>
                        <Progress
                            value={calculateOverallProgress()}
                            className="h-3"
                        />
                    </div>
                </Card>

                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column - Categories */}
                    <div className="md:col-span-4 space-y-4">
                        {Object.entries(
                            programRequirements[userProgram].requirements
                        ).map(([key, requirement]) => (
                            <Card
                                key={key}
                                className="p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium">
                                            {key
                                                .replace(/([A-Z])/g, " $1")
                                                .trim()}
                                        </h3>
                                        <span className="text-sm text-muted-foreground">
                                            {(coursePlan[key] || []).reduce(
                                                (sum, course) =>
                                                    sum + course.credits,
                                                0
                                            )}{" "}
                                            / {requirement.credits} credits
                                        </span>
                                    </div>
                                    <Progress
                                        value={calculateRequirementProgress(
                                            key
                                        )}
                                        className="h-2"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {requirement.description}
                                    </p>

                                    {/* Selected Courses for this category */}
                                    {(coursePlan[key] || []).length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {coursePlan[key].map((course) => (
                                                <div
                                                    key={course.id}
                                                    className="flex justify-between items-center text-sm p-2 rounded bg-muted"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium">
                                                            {course.code}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground truncate">
                                                            {course.name}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="ml-2"
                                                    >
                                                        {course.credits} cr
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Right Column - Course Search and Management */}
                    <div className="md:col-span-8 space-y-6">
                        {/* Search Section */}
                        <Card className="p-6">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Search className="h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search for courses..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="flex-1"
                                    />
                                </div>

                                {/* Course Selector */}
                                <CourseSelector
                                    requirement={{
                                        credits:
                                            programRequirements[userProgram]
                                                .totalCredits,
                                        description: "All available courses",
                                    }}
                                    selectedCourses={selectedCourses}
                                    onSelectCourse={(course) =>
                                        setSelectedCourses([
                                            ...selectedCourses,
                                            course,
                                        ])
                                    }
                                    searchQuery={searchQuery}
                                />
                            </div>
                        </Card>

                        {/* Selected Courses List */}
                        <SelectedCourses
                            selectedCourses={selectedCourses}
                            onRemoveCourse={(course: Course) => {
                                setSelectedCourses((prevCourses: Course[]) =>
                                    prevCourses.filter(
                                        (c) => c.id !== course.id
                                    )
                                );
                            }}
                            requirements={
                                programRequirements[userProgram!].requirements
                            }
                            onAddToRequirement={handleAddToRequirement}
                            coursePlan={coursePlan}
                        />

                        <CourseSchedule selectedCourses={selectedCourses} />
                    </div>
                </div>
            </div>
        </div>
    );
}
