"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

interface AdditionalQuestionsProps {
    onEthicsCourseChange: (
        hasEthicsCourse: boolean,
        course?: Course,
        deductFromCategory?: string
    ) => void;
    onTechie5901Change: (hasTechie5901: boolean) => void;
    selectedCourses: Course[];
    coursePlan: { [key: string]: Course[] };
}

export default function AdditionalQuestions({
    onEthicsCourseChange,
    onTechie5901Change,
    selectedCourses,
    coursePlan,
}: AdditionalQuestionsProps) {
    const [tookEthics, setTookEthics] = useState(false);
    const [tookTechie5901, setTookTechie5901] = useState(false);
    const [selectedEthicsCourse, setSelectedEthicsCourse] = useState("");
    const [deductedCategory, setDeductedCategory] = useState<string | null>(
        null
    );

    // Add loading states
    const [isLoading, setIsLoading] = useState(true);

    // Load saved requirements on component mount
    useEffect(() => {
        const loadSavedRequirements = async () => {
            try {
                console.log("Loading saved requirements...");
                const response = await fetch(
                    "/api/course-special-requirements"
                );
                if (!response.ok) {
                    console.warn(
                        "Failed to fetch requirements:",
                        response.status
                    );
                    return; // Don't throw, just return and show the component
                }

                const requirements = await response.json();
                console.log("Loaded requirements:", requirements);

                // Find ethics requirement
                const ethicsReq = requirements.find(
                    (req: any) => req.requirement_type === "ethics_course"
                );
                if (ethicsReq) {
                    console.log("Found ethics requirement:", ethicsReq);
                    setTookEthics(true);
                    setSelectedEthicsCourse(ethicsReq.selected_course_id || "");
                    setDeductedCategory(ethicsReq.deducted_from_category);

                    // Find the course object from selectedCourses
                    const course = selectedCourses.find(
                        (c) => c.code === ethicsReq.selected_course_id
                    );
                    if (course) {
                        try {
                            await onEthicsCourseChange(
                                true,
                                course,
                                ethicsReq.deducted_from_category
                            );
                        } catch (error) {
                            console.warn(
                                "Error applying ethics course change:",
                                error
                            );
                            // Don't throw, just log the error
                        }
                    }
                }

                // Find Techie 5901 requirement
                const techieReq = requirements.find(
                    (req: any) => req.requirement_type === "techie_5901"
                );
                if (techieReq) {
                    console.log("Found Techie 5901 requirement:", techieReq);
                    setTookTechie5901(true);
                    // Only call onTechie5901Change if we can actually add the credit
                    const jacobsProgrammaticCore =
                        coursePlan["JacobsProgrammaticCore"] || [];
                    const totalCredits = jacobsProgrammaticCore.reduce(
                        (sum, course) => sum + course.credits,
                        0
                    );
                    if (totalCredits < 17) {
                        // 17 is the total required credits for JacobsProgrammaticCore
                        try {
                            await onTechie5901Change(true);
                        } catch (error) {
                            console.warn(
                                "Error applying Techie 5901 change:",
                                error
                            );
                            // Don't throw, just log the error
                        }
                    } else {
                        console.warn(
                            "Cannot add Techie 5901 credit - Jacobs Programmatic Core is full"
                        );
                        setTookTechie5901(false);
                    }
                }
            } catch (error) {
                console.error("Error loading saved requirements:", error);
                // Don't throw, just log the error
            } finally {
                setIsLoading(false);
            }
        };

        loadSavedRequirements();
    }, [selectedCourses, onEthicsCourseChange, onTechie5901Change, coursePlan]);

    // Save ethics course selection to database
    const saveEthicsRequirement = async (
        hasEthicsCourse: boolean,
        course?: Course,
        deductFromCategory?: string
    ) => {
        try {
            console.log("Saving ethics requirement:", {
                hasEthicsCourse,
                course,
                deductFromCategory,
            });

            // Validate inputs
            if (hasEthicsCourse && (!course || !deductFromCategory)) {
                throw new Error(
                    "Course and deduction category are required when ethics course is selected"
                );
            }

            // Validate course exists in selected courses
            if (course && !selectedCourses.some((c) => c.id === course.id)) {
                throw new Error(
                    "Selected course must be in the list of selected courses"
                );
            }

            // Validate category exists in course plan
            if (
                deductFromCategory &&
                !Object.keys(coursePlan).includes(deductFromCategory)
            ) {
                throw new Error("Deduction category must exist in course plan");
            }

            const response = await fetch("/api/course-special-requirements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    requirementType: "ethics_course",
                    selectedCourseId: course?.code,
                    deductedFromCategory: deductFromCategory,
                    creditAmount: course?.credits || -1,
                    addedToCategory:
                        course?.credits === 1 ? "JacobsTechnicalCore" : null,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            console.log("Ethics requirement saved successfully");
        } catch (error) {
            console.error("Error saving ethics requirement:", error);
            // Revert state on error
            setTookEthics(false);
            setSelectedEthicsCourse("");
            setDeductedCategory(null);
            try {
                await onEthicsCourseChange(false);
            } catch (innerError) {
                console.error(
                    "Error reverting ethics course change:",
                    innerError
                );
            }
            throw error;
        }
    };

    // Save Techie 5901 selection to database
    const saveTechie5901Requirement = async (hasTechie5901: boolean) => {
        try {
            console.log("Saving Techie 5901 requirement:", { hasTechie5901 });

            // Validate program has JacobsProgrammaticCore requirement
            if (
                hasTechie5901 &&
                !Object.keys(coursePlan).includes("JacobsProgrammaticCore")
            ) {
                throw new Error(
                    "Program does not have JacobsProgrammaticCore requirement"
                );
            }

            const response = await fetch("/api/course-special-requirements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    requirementType: "techie_5901",
                    selectedCourseId: hasTechie5901 ? "TECHIE5901" : null,
                    deductedFromCategory: null,
                    creditAmount: 1,
                    addedToCategory: hasTechie5901
                        ? "JacobsProgrammaticCore"
                        : null,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            console.log("Techie 5901 requirement saved successfully");
        } catch (error) {
            console.error("Error saving Techie 5901 requirement:", error);
            // Revert state on error
            setTookTechie5901(false);
            onTechie5901Change(false);
            throw error; // Re-throw to handle in the calling function
        }
    };

    // Find which requirement a course is currently assigned to
    const findCourseAssignment = (courseCode: string): string | null => {
        for (const [category, courses] of Object.entries(coursePlan)) {
            if (courses.some((course) => course.code === courseCode)) {
                return category;
            }
        }
        return null;
    };

    const handleEthicsCheckboxChange = async (checked: boolean) => {
        console.log("Ethics checkbox changed:", checked);
        const newValue = checked as boolean;
        setTookEthics(newValue);

        if (!newValue) {
            setSelectedEthicsCourse("");
            setDeductedCategory(null);
            onEthicsCourseChange(false);
            await saveEthicsRequirement(false);
        }
    };

    const handleEthicsCourseSelect = async (courseCode: string) => {
        console.log("Ethics course selected:", courseCode);
        setSelectedEthicsCourse(courseCode);
        const selectedCourse = selectedCourses.find(
            (course) => course.code === courseCode
        );

        if (selectedCourse) {
            if (selectedCourse.credits === 1) {
                // For 1-credit courses, deduct from Jacobs Technical Core
                setDeductedCategory("JacobsTechnicalCore");
                onEthicsCourseChange(
                    true,
                    selectedCourse,
                    "JacobsTechnicalCore"
                );
                await saveEthicsRequirement(
                    true,
                    selectedCourse,
                    "JacobsTechnicalCore"
                );
            } else {
                // For courses with more than 1 credit, deduct from their assigned category
                const assignedCategory = findCourseAssignment(courseCode);
                if (assignedCategory) {
                    setDeductedCategory(assignedCategory);
                    onEthicsCourseChange(
                        true,
                        selectedCourse,
                        assignedCategory
                    );
                    await saveEthicsRequirement(
                        true,
                        selectedCourse,
                        assignedCategory
                    );
                }
            }
        }
    };

    const handleTechie5901CheckboxChange = async (checked: boolean) => {
        console.log("Techie 5901 checkbox changed:", checked);
        const newValue = checked as boolean;
        setTookTechie5901(newValue);
        onTechie5901Change(newValue);
        await saveTechie5901Requirement(newValue);
    };

    if (isLoading) {
        return (
            <Card className="p-4">
                <div className="space-y-4">
                    <h3 className="font-medium">Additional Questions</h3>
                    <div className="text-sm text-muted-foreground">
                        Loading...
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4">
            <div className="space-y-4">
                <h3 className="font-medium">Additional Questions</h3>
                <div className="space-y-4">
                    {/* Ethics Course Question */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="ethics"
                                checked={tookEthics}
                                onCheckedChange={handleEthicsCheckboxChange}
                            />
                            <label
                                htmlFor="ethics"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Did you take ethics course?
                            </label>
                        </div>
                        {tookEthics && (
                            <div className="pl-6 space-y-2">
                                <label className="text-sm font-medium">
                                    Which course did you take?
                                </label>
                                <Select
                                    value={selectedEthicsCourse}
                                    onValueChange={handleEthicsCourseSelect}
                                >
                                    <SelectTrigger className="w-full bg-white border border-input rounded-md h-10">
                                        <SelectValue
                                            placeholder="Select course"
                                            className="text-sm"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {selectedCourses.length > 0 ? (
                                            selectedCourses.map((course) => (
                                                <SelectItem
                                                    key={course.id}
                                                    value={course.code}
                                                    className="text-sm py-2.5 pl-3 pr-6 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {course.code} -{" "}
                                                    {course.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem
                                                value=""
                                                disabled
                                                className="text-sm py-2.5 pl-3 pr-6 text-gray-500"
                                            >
                                                No courses selected
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Techie 5901 Question */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="techie5901"
                            checked={tookTechie5901}
                            onCheckedChange={handleTechie5901CheckboxChange}
                        />
                        <label
                            htmlFor="techie5901"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Are you taking INFO 5920 with anchor course?
                        </label>
                    </div>
                </div>
            </div>

            {/* Deduction Info Card */}
            {tookEthics && selectedEthicsCourse && deductedCategory && (
                <Card className="p-4 bg-muted mt-4">
                    <div className="text-sm text-muted-foreground">
                        Deducted 1 cr for Ethics from{" "}
                        {deductedCategory.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                </Card>
            )}
        </Card>
    );
}
