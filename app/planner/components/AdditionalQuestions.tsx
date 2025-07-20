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
    isDemoMode?: boolean;
    currentSelectedEthicsCourse?: Course | null;
    currentEthicsDeductionCategory?: string | null;
}

export default function AdditionalQuestions({
    onEthicsCourseChange,
    onTechie5901Change,
    selectedCourses,
    coursePlan,
    isDemoMode = false,
    currentSelectedEthicsCourse,
    currentEthicsDeductionCategory,
}: AdditionalQuestionsProps) {
    const [tookEthics, setTookEthics] = useState(false);
    const [tookTechie5901, setTookTechie5901] = useState(false);
    const [selectedEthicsCourse, setSelectedEthicsCourse] = useState("");
    const [deductedCategory, setDeductedCategory] = useState<string | null>(
        null
    );

    // Add loading states
    const [isLoading, setIsLoading] = useState(true);

    // Sync local state with parent component's ethics course state
    useEffect(() => {
        if (currentSelectedEthicsCourse) {
            setTookEthics(true);
            setSelectedEthicsCourse(currentSelectedEthicsCourse.code);
            setDeductedCategory(currentEthicsDeductionCategory);
        } else {
            setTookEthics(false);
            setSelectedEthicsCourse("");
            setDeductedCategory(null);
        }
    }, [currentSelectedEthicsCourse, currentEthicsDeductionCategory]);

    // Load saved requirements on component mount
    useEffect(() => {
        const loadSavedRequirements = async () => {
            try {
                // If parent has already provided ethics course state, don't override it with demo data
                if (currentSelectedEthicsCourse) {
                    setIsLoading(false);
                    return;
                }
                
                if (isDemoMode) {
                    // Demo mode - load from localStorage or set defaults
                    const savedDemoData = localStorage.getItem('additionalQuestionsDemo');
                    if (savedDemoData) {
                        const data = JSON.parse(savedDemoData);
                        setTookEthics(data.tookEthics || false);
                        setSelectedEthicsCourse(data.selectedEthicsCourse || "");
                        setDeductedCategory(data.deductedCategory || null);
                        setTookTechie5901(data.tookTechie5901 || false);
                    } else {
                        // Set demo defaults - INFO 5910 fulfills ethics requirement
                        // Dynamically find which category INFO 5910 is assigned to
                        const ethicsCourse = selectedCourses.find(c => c.code === "INFO 5910");
                        let detectedCategory = null;
                        
                        if (ethicsCourse) {
                            // Find which category contains this ethics course
                            for (const [category, courses] of Object.entries(coursePlan)) {
                                if (courses.some(course => course.code === "INFO 5910")) {
                                    detectedCategory = category;
                                    break;
                                }
                            }
                        }
                        
                        setTookEthics(true);
                        setSelectedEthicsCourse("INFO 5910");
                        setDeductedCategory(detectedCategory || "ConcentrationCore"); // Fallback to ConcentrationCore if not found
                        setTookTechie5901(true);
                        
                        // Apply the demo settings - the actual credit deduction will be handled
                        // by the new simplified logic in the planner component
                        if (ethicsCourse && detectedCategory) {
                            onEthicsCourseChange(true, ethicsCourse, detectedCategory);
                        }
                        onTechie5901Change(true);
                    }
                    setIsLoading(false);
                    return;
                }
                
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

                // Find ethics requirement
                const ethicsReq = requirements.find(
                    (req: any) => req.requirement_type === "ethics_course"
                );
                if (ethicsReq) {
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
    }, [isDemoMode, currentSelectedEthicsCourse, selectedCourses, coursePlan, onEthicsCourseChange, onTechie5901Change]); // Include necessary dependencies but prioritize parent props

    // Save demo data to localStorage
    const saveDemoData = () => {
        if (isDemoMode) {
            const demoData = {
                tookEthics,
                selectedEthicsCourse,
                deductedCategory,
                tookTechie5901,
            };
            localStorage.setItem('additionalQuestionsDemo', JSON.stringify(demoData));
        }
    };

    // Save ethics course selection to database
    const saveEthicsRequirement = async (
        hasEthicsCourse: boolean,
        course?: Course,
        deductFromCategory?: string
    ) => {
        if (isDemoMode) {
            // Just save to localStorage for demo mode
            setTimeout(() => saveDemoData(), 0);
            return;
        }
        
        try {
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
        if (isDemoMode) {
            // Just save to localStorage for demo mode
            setTimeout(() => saveDemoData(), 0);
            return;
        }
        
        try {
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
        setSelectedEthicsCourse(courseCode);
        const selectedCourse = selectedCourses.find(
            (course) => course.code === courseCode
        );

        if (selectedCourse) {
            // Always deduct from the category where the course is currently assigned
            const assignedCategory = findCourseAssignment(courseCode);
            let targetCategory = assignedCategory;
            
            if (!targetCategory) {
                // If not assigned to a category yet, determine the best default
                if (selectedCourse.credits === 1) {
                    // For 1-credit ethics courses, default to Jacobs Technical Core if it exists
                    targetCategory = Object.keys(coursePlan).includes("JacobsTechnicalCore") 
                        ? "JacobsTechnicalCore" 
                        : Object.keys(coursePlan)[0]; // Fallback to first available category
                    console.log(`1-credit ethics course ${courseCode} not assigned - defaulting to ${targetCategory}`);
                } else {
                    // For multi-credit courses, default to first available category
                    targetCategory = Object.keys(coursePlan)[0];
                    console.log(`Ethics course ${courseCode} not assigned to category - defaulting to ${targetCategory}`);
                }
            } else {
                console.log(`Ethics course ${courseCode} (${selectedCourse.credits} cr) - deducting from assigned category: ${assignedCategory}`);
            }
            
            if (targetCategory) {
                setDeductedCategory(targetCategory);
                onEthicsCourseChange(true, selectedCourse, targetCategory);
                await saveEthicsRequirement(true, selectedCourse, targetCategory);
            }
        }
    };

    const handleTechie5901CheckboxChange = async (checked: boolean) => {
        const newValue = checked as boolean;
        setTookTechie5901(newValue);
        onTechie5901Change(newValue);
        await saveTechie5901Requirement(newValue);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                    Loading...
                </div>
            </div>
        );
    }

    return (
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

            {/* Ethics Status Info Card */}
            {tookEthics && selectedEthicsCourse && deductedCategory && (
                <Card className="p-4 bg-green-50 border-green-200 mt-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-green-800">
                            ✓ Ethics Requirement Fulfilled
                        </div>
                        <div className="text-sm text-green-700">
                            <div className="mb-1">
                                <strong>{selectedEthicsCourse}</strong> fulfills the ethics requirement.
                            </div>
                            <div className="text-green-600">
                                1 credit is automatically deducted from <strong>{deductedCategory.replace(/([A-Z])/g, " $1").trim()}</strong> to avoid double-counting.
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
