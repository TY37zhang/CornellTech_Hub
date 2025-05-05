"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Clock, X, ChevronDown, AlertTriangle } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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

interface CourseTime {
    id?: string;
    courseId: string;
    courseName: string;
    day: string;
    startTime: string;
    endTime: string;
}

interface CourseScheduleProps {
    selectedCourses: Course[];
}

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const TIMES = Array.from({ length: 33 }, (_, i) => {
    const hour = Math.floor(i / 4) + 8;
    const minutes = (i % 4) * 15;
    return `${hour}:${minutes.toString().padStart(2, "0")}`;
});

// Utility to parse "HH:mm" to minutes since midnight
function timeToMinutes(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

// Utility to format duration in minutes to "x hour & x min"
function formatDuration(start: string, end: string) {
    const mins = timeToMinutes(end) - timeToMinutes(start);
    if (mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h} hour${h > 1 ? "s" : ""}` : ""}${h && m ? " & " : ""}${m ? `${m} min${m > 1 ? "s" : ""}` : ""}`;
}

function CourseTimeCard({
    course,
    onDelete,
    onUpdate,
    onAddTimeSlot,
}: {
    course: CourseTime;
    onDelete: (id: string) => Promise<void>;
    onUpdate: (id: string, updates: Partial<CourseTime>) => Promise<void>;
    onAddTimeSlot: (course: Course) => Promise<void>;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editDay, setEditDay] = useState(course.day);
    const [editStartTime, setEditStartTime] = useState(course.startTime);
    const [editEndTime, setEditEndTime] = useState(course.endTime);

    // Reset local state when opening the popup
    useEffect(() => {
        if (isEditing) {
            setEditDay(course.day);
            setEditStartTime(course.startTime);
            setEditEndTime(course.endTime);
        }
    }, [isEditing, course.day, course.startTime, course.endTime]);

    const handleSave = () => {
        if (course.id) {
            onUpdate(course.id, {
                day: editDay,
                startTime: editStartTime,
                endTime: editEndTime,
            });
        }
        setIsEditing(false);
    };

    return (
        <Card className="group relative hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-medium">{course.courseName}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                                {course.startTime} - {course.endTime}
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => course.id && onDelete(course.id)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Popover open={isEditing} onOpenChange={setIsEditing}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                                Edit Time
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Day
                                    </label>
                                    <Select
                                        value={editDay}
                                        onValueChange={setEditDay}
                                    >
                                        <SelectTrigger className="h-8 flex items-center justify-between">
                                            <SelectValue
                                                placeholder="Select day"
                                                className="flex-1 text-left"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map((day) => (
                                                <SelectItem
                                                    key={day}
                                                    value={day}
                                                >
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full border rounded px-2 py-1"
                                            value={editStartTime}
                                            onChange={(e) =>
                                                setEditStartTime(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full border rounded px-2 py-1"
                                            value={editEndTime}
                                            onChange={(e) =>
                                                setEditEndTime(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                            onAddTimeSlot({
                                id: course.courseId,
                                name: course.courseName,
                                code: "", // This will be filled from the course data
                                credits: 0,
                                department: "",
                                semester: "",
                                year: 0,
                            });
                        }}
                    >
                        Add Time Slot
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CourseSchedule({
    selectedCourses,
}: CourseScheduleProps) {
    const [courseTimes, setCourseTimes] = useState<CourseTime[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Editing state for weekly schedule popovers
    const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
    const [editDay, setEditDay] = useState<string>("");
    const [editStartTime, setEditStartTime] = useState<string>("");
    const [editEndTime, setEditEndTime] = useState<string>("");

    // Add new state for the new course slot popover
    const [addSlotOpen, setAddSlotOpen] = useState<string | null>(null);
    const [addSlotDay, setAddSlotDay] = useState(DAYS[0]);
    const [addSlotStart, setAddSlotStart] = useState("09:00");
    const [addSlotEnd, setAddSlotEnd] = useState("10:15");

    // Add state for the add time slot popover for scheduled courses
    const [addSlotCardOpen, setAddSlotCardOpen] = useState<string | null>(null);
    const [addSlotCardDay, setAddSlotCardDay] = useState(DAYS[0]);
    const [addSlotCardStart, setAddSlotCardStart] = useState("09:00");
    const [addSlotCardEnd, setAddSlotCardEnd] = useState("10:15");

    useEffect(() => {
        loadSchedule();
    }, []);

    // Add new useEffect to handle course removal
    useEffect(() => {
        // Find courses that were removed
        const removedCourseIds = courseTimes
            .map((time) => time.courseId)
            .filter(
                (courseId) =>
                    !selectedCourses.some((course) => course.id === courseId)
            );

        // Delete schedule entries for removed courses
        const deleteRemovedSchedules = async () => {
            for (const courseId of removedCourseIds) {
                try {
                    const response = await fetch(
                        `/api/schedule?courseId=${courseId}`,
                        {
                            method: "DELETE",
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to delete schedule");
                    }
                } catch (error) {
                    console.error("Error deleting schedule:", error);
                    toast({
                        title: "Error",
                        description:
                            "Failed to delete schedule for removed course",
                        variant: "destructive",
                    });
                }
            }
        };

        deleteRemovedSchedules();

        // Remove any course times for courses that are no longer selected
        setCourseTimes((prevTimes) =>
            prevTimes.filter((time) =>
                selectedCourses.some((course) => course.id === time.courseId)
            )
        );
    }, [selectedCourses]);

    const loadSchedule = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/schedule");
            if (!response.ok) {
                throw new Error("Failed to load schedule");
            }
            const data = await response.json();
            setCourseTimes(
                data.map((schedule: any) => ({
                    id: schedule.id,
                    courseId: schedule.courseId,
                    courseName: schedule.course.name,
                    day: schedule.day,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                }))
            );
        } catch (error) {
            console.error("Error loading schedule:", error);
            toast({
                title: "Error",
                description: "Failed to load your schedule",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        try {
            const response = await fetch(`/api/schedule?id=${scheduleId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete schedule");
            }

            setCourseTimes(courseTimes.filter((ct) => ct.id !== scheduleId));
            toast({
                title: "Success",
                description: "Schedule deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting schedule:", error);
            toast({
                title: "Error",
                description: "Failed to delete schedule",
                variant: "destructive",
            });
        }
    };

    const handleUpdateSchedule = async (
        scheduleId: string,
        updates: Partial<CourseTime>
    ) => {
        try {
            // Find the current course time data
            const currentCourse = courseTimes.find(
                (ct) => ct.id === scheduleId
            );
            if (!currentCourse) {
                throw new Error("Course not found");
            }

            // Merge current data with updates
            const updatedData = {
                day: updates.day || currentCourse.day,
                startTime: updates.startTime || currentCourse.startTime,
                endTime: updates.endTime || currentCourse.endTime,
            };

            const response = await fetch(`/api/schedule/${scheduleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error("Failed to update schedule");
            }

            setCourseTimes((prevTimes) =>
                prevTimes.map((ct) =>
                    ct.id === scheduleId ? { ...ct, ...updates } : ct
                )
            );

            toast({
                title: "Success",
                description: "Schedule updated successfully",
            });
        } catch (error) {
            console.error("Error updating schedule:", error);
            toast({
                title: "Error",
                description: "Failed to update schedule",
                variant: "destructive",
            });
        }
    };

    const handleAddCourse = async (course: Course) => {
        try {
            // Find existing times for this course
            const existingTimes = courseTimes.filter(
                (ct) => ct.courseId === course.id
            );

            // Default to the next available day
            let defaultDay = "Monday";
            if (existingTimes.length > 0) {
                const usedDays = existingTimes.map((ct) => ct.day);
                defaultDay =
                    DAYS.find((day) => !usedDays.includes(day)) || "Monday";
            }

            const response = await fetch("/api/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: course.id,
                    day: defaultDay,
                    startTime: "9:00",
                    endTime: "10:15",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add course");
            }

            const savedSchedule = await response.json();
            setCourseTimes([
                ...courseTimes,
                {
                    id: savedSchedule.id,
                    courseId: course.id,
                    courseName: course.name,
                    day: defaultDay,
                    startTime: "9:00",
                    endTime: "10:15",
                },
            ]);

            toast({
                title: "Success",
                description: "Course time slot added",
            });
        } catch (error) {
            console.error("Error adding course:", error);
            toast({
                title: "Error",
                description: "Failed to add course",
                variant: "destructive",
            });
        }
    };

    // Group courses by day
    const coursesByDay = DAYS.reduce(
        (acc, day) => {
            acc[day] = courseTimes.filter((course) => course.day === day);
            return acc;
        },
        {} as Record<string, CourseTime[]>
    );

    // When opening the popover, initialize edit state
    const openEditPopover = (course: CourseTime) => {
        setEditingCourseId(course.id!);
        setEditDay(course.day);
        setEditStartTime(course.startTime);
        setEditEndTime(course.endTime);
    };
    const closeEditPopover = () => {
        setEditingCourseId(null);
    };
    const handleSaveEdit = (courseId: string) => {
        handleUpdateSchedule(courseId, {
            day: editDay,
            startTime: editStartTime,
            endTime: editEndTime,
        });
        closeEditPopover();
    };

    // New handler for adding a new course slot
    const openAddSlot = (course: Course) => {
        setAddSlotOpen(course.id);
        setAddSlotDay(DAYS[0]);
        setAddSlotStart("09:00");
        setAddSlotEnd("10:15");
    };
    const closeAddSlot = () => {
        setAddSlotOpen(null);
    };
    const handleSaveAddSlot = async (course: Course) => {
        try {
            const response = await fetch("/api/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: course.id,
                    day: addSlotDay,
                    startTime: addSlotStart,
                    endTime: addSlotEnd,
                }),
            });
            if (!response.ok) throw new Error("Failed to add course");
            const savedSchedule = await response.json();
            setCourseTimes([
                ...courseTimes,
                {
                    id: savedSchedule.id,
                    courseId: course.id,
                    courseName: course.name,
                    day: addSlotDay,
                    startTime: addSlotStart,
                    endTime: addSlotEnd,
                },
            ]);
            toast({ title: "Success", description: "Course time slot added" });
            closeAddSlot();
        } catch (error) {
            console.error("Error adding course:", error);
            toast({
                title: "Error",
                description: "Failed to add course",
                variant: "destructive",
            });
        }
    };

    // In the scheduled course card, replace the Add Time Slot button with a Popover
    const openAddSlotCard = (course: CourseTime) => {
        setAddSlotCardOpen(course.id!);
        setAddSlotCardDay(DAYS[0]);
        setAddSlotCardStart("09:00");
        setAddSlotCardEnd("10:15");
    };
    const closeAddSlotCard = () => {
        setAddSlotCardOpen(null);
    };
    const handleSaveAddSlotCard = async (course: CourseTime) => {
        try {
            const response = await fetch("/api/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: course.courseId,
                    day: addSlotCardDay,
                    startTime: addSlotCardStart,
                    endTime: addSlotCardEnd,
                }),
            });
            if (!response.ok) throw new Error("Failed to add course");
            const savedSchedule = await response.json();
            setCourseTimes([
                ...courseTimes,
                {
                    id: savedSchedule.id,
                    courseId: course.courseId,
                    courseName: course.courseName,
                    day: addSlotCardDay,
                    startTime: addSlotCardStart,
                    endTime: addSlotCardEnd,
                },
            ]);
            toast({ title: "Success", description: "Course time slot added" });
            closeAddSlotCard();
        } catch (error) {
            console.error("Error adding course:", error);
            toast({
                title: "Error",
                description: "Failed to add course",
                variant: "destructive",
            });
            closeAddSlotCard();
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading schedule...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader>
                <CardTitle>Course Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Available Courses */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold mb-4">
                            Available Courses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCourses
                                .filter(
                                    (course) =>
                                        !courseTimes.some(
                                            (ct) => ct.courseId === course.id
                                        )
                                )
                                .map((course) => (
                                    <Card
                                        key={course.id}
                                        className="flex flex-col justify-between p-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-semibold">
                                                    {course.code}
                                                </h3>
                                                <p className="text-gray-600 text-base">
                                                    {course.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>
                                                        {course.department}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {course.semester}{" "}
                                                        {course.year}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {course.credits} credits
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    openAddSlot(course)
                                                }
                                                className="whitespace-nowrap"
                                            >
                                                Add to Schedule
                                            </Button>
                                        </div>
                                        <Popover
                                            open={addSlotOpen === course.id}
                                            onOpenChange={(open) =>
                                                open
                                                    ? openAddSlot(course)
                                                    : closeAddSlot()
                                            }
                                        >
                                            <PopoverTrigger asChild>
                                                <span></span>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-4">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">
                                                            Day
                                                        </label>
                                                        <Select
                                                            value={addSlotDay}
                                                            onValueChange={
                                                                setAddSlotDay
                                                            }
                                                        >
                                                            <SelectTrigger className="h-8 flex items-center justify-between">
                                                                <SelectValue
                                                                    placeholder="Select day"
                                                                    className="flex-1 text-left"
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {DAYS.map(
                                                                    (day) => (
                                                                        <SelectItem
                                                                            key={
                                                                                day
                                                                            }
                                                                            value={
                                                                                day
                                                                            }
                                                                        >
                                                                            {
                                                                                day
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                Start Time
                                                            </label>
                                                            <input
                                                                type="time"
                                                                className="w-full border rounded px-2 py-1"
                                                                value={
                                                                    addSlotStart
                                                                }
                                                                onChange={(e) =>
                                                                    setAddSlotStart(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                End Time
                                                            </label>
                                                            <input
                                                                type="time"
                                                                className="w-full border rounded px-2 py-1"
                                                                value={
                                                                    addSlotEnd
                                                                }
                                                                onChange={(e) =>
                                                                    setAddSlotEnd(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={
                                                                closeAddSlot
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleSaveAddSlot(
                                                                    course
                                                                )
                                                            }
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </Card>
                                ))}
                        </div>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="space-y-6">
                        {DAYS.map((day) => {
                            const sorted = (coursesByDay[day] || [])
                                .slice()
                                .sort(
                                    (a, b) =>
                                        timeToMinutes(a.startTime) -
                                        timeToMinutes(b.startTime)
                                );
                            const overlaps: Set<string> = new Set();
                            for (let i = 1; i < sorted.length; ++i) {
                                const prev = sorted[i - 1];
                                const curr = sorted[i];
                                if (
                                    timeToMinutes(curr.startTime) <
                                    timeToMinutes(prev.endTime)
                                ) {
                                    overlaps.add(prev.id!);
                                    overlaps.add(curr.id!);
                                }
                            }
                            return (
                                <div key={day} className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">
                                        {day}
                                    </h3>
                                    <div className="grid gap-4">
                                        {sorted.map((course) => (
                                            <div
                                                key={course.id}
                                                className={`flex flex-col space-y-2 p-4 border rounded-lg overflow-hidden ${overlaps.has(course.id!) ? "border-red-500 bg-red-50" : ""}`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h3 className="font-medium truncate">
                                                            {course.courseName}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                            <Clock className="h-4 w-4 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {
                                                                    course.startTime
                                                                }{" "}
                                                                -{" "}
                                                                {course.endTime}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                (
                                                                {formatDuration(
                                                                    course.startTime,
                                                                    course.endTime
                                                                )}
                                                                )
                                                            </span>
                                                            {overlaps.has(
                                                                course.id!
                                                            ) && (
                                                                <span
                                                                    className="flex items-center text-red-600 ml-2"
                                                                    title="This time slot overlaps with another."
                                                                >
                                                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                                                    Overlap
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Popover
                                                            open={
                                                                editingCourseId ===
                                                                course.id
                                                            }
                                                            onOpenChange={(
                                                                open
                                                            ) =>
                                                                open
                                                                    ? openEditPopover(
                                                                          course
                                                                      )
                                                                    : closeEditPopover()
                                                            }
                                                        >
                                                            <PopoverTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-3 flex items-center justify-center"
                                                                >
                                                                    Edit Time
                                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-80 p-4">
                                                                <div className="space-y-4">
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium">
                                                                            Day
                                                                        </label>
                                                                        <Select
                                                                            value={
                                                                                editDay
                                                                            }
                                                                            onValueChange={
                                                                                setEditDay
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="h-8 flex items-center justify-between">
                                                                                <SelectValue
                                                                                    placeholder="Select day"
                                                                                    className="flex-1 text-left"
                                                                                />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {DAYS.map(
                                                                                    (
                                                                                        d
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                d
                                                                                            }
                                                                                            value={
                                                                                                d
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                d
                                                                                            }
                                                                                        </SelectItem>
                                                                                    )
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium">
                                                                                Start
                                                                                Time
                                                                            </label>
                                                                            <input
                                                                                type="time"
                                                                                className="w-full border rounded px-2 py-1"
                                                                                value={
                                                                                    editStartTime
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    setEditStartTime(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium">
                                                                                End
                                                                                Time
                                                                            </label>
                                                                            <input
                                                                                type="time"
                                                                                className="w-full border rounded px-2 py-1"
                                                                                value={
                                                                                    editEndTime
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    setEditEndTime(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end pt-2">
                                                                        <Button
                                                                            variant="default"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleSaveEdit(
                                                                                    course.id!
                                                                                )
                                                                            }
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <Popover
                                                            open={
                                                                addSlotCardOpen ===
                                                                course.id
                                                            }
                                                            onOpenChange={(
                                                                open
                                                            ) =>
                                                                open
                                                                    ? openAddSlotCard(
                                                                          course
                                                                      )
                                                                    : closeAddSlotCard()
                                                            }
                                                        >
                                                            <PopoverTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-3 flex items-center justify-center"
                                                                >
                                                                    Add Time
                                                                    Slot
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-80 p-4">
                                                                <div className="space-y-4">
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium">
                                                                            Day
                                                                        </label>
                                                                        <Select
                                                                            value={
                                                                                addSlotCardDay
                                                                            }
                                                                            onValueChange={
                                                                                setAddSlotCardDay
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="h-8 flex items-center justify-between">
                                                                                <SelectValue
                                                                                    placeholder="Select day"
                                                                                    className="flex-1 text-left"
                                                                                />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {DAYS.map(
                                                                                    (
                                                                                        day
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                day
                                                                                            }
                                                                                            value={
                                                                                                day
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                day
                                                                                            }
                                                                                        </SelectItem>
                                                                                    )
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium">
                                                                                Start
                                                                                Time
                                                                            </label>
                                                                            <input
                                                                                type="time"
                                                                                className="w-full border rounded px-2 py-1"
                                                                                value={
                                                                                    addSlotCardStart
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    setAddSlotCardStart(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium">
                                                                                End
                                                                                Time
                                                                            </label>
                                                                            <input
                                                                                type="time"
                                                                                className="w-full border rounded px-2 py-1"
                                                                                value={
                                                                                    addSlotCardEnd
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    setAddSlotCardEnd(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2 pt-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={
                                                                                closeAddSlotCard
                                                                            }
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            variant="default"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleSaveAddSlotCard(
                                                                                    course
                                                                                )
                                                                            }
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
                                                            onClick={() =>
                                                                course.id &&
                                                                handleDeleteSchedule(
                                                                    course.id
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {sorted.length === 0 && (
                                        <p className="text-sm text-gray-500 py-2">
                                            No courses scheduled
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
