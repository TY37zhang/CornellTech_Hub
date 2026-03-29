"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  X,
  ChevronDown,
  AlertTriangle,
  ChevronRight,
  Plus,
  Edit,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

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
  isDemoMode?: boolean;
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

// Utility to format duration in minutes
function formatDuration(start: string, end: string) {
  const mins = timeToMinutes(end) - timeToMinutes(start);
  if (mins <= 0) return "";
  return `${mins} min`;
}

const BLOCK_COLORS = [
  { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400" },
  { bg: "bg-blue-500/15", border: "border-blue-500/30", text: "text-blue-400" },
  {
    bg: "bg-green-500/15",
    border: "border-green-500/30",
    text: "text-green-400",
  },
  {
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    text: "text-purple-400",
  },
  {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-400" },
];

const CALENDAR_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CALENDAR_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOUR_START = 8;
const HOUR_END = 20;
const HOUR_COUNT = HOUR_END - HOUR_START;
const PX_PER_MINUTE = 1;
const HOUR_HEIGHT = 60; // 60px per hour
const GRID_PADDING_TOP = 16; // px padding at top of grid so 8:00 label isn't clipped

function DraggableCourseBlock({
  course,
  top,
  height,
  color,
  isOverlapping,
  children,
}: {
  course: CourseTime;
  top: number;
  height: number;
  color: { bg: string; border: string; text: string };
  isOverlapping: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: course.id || course.courseId,
      data: { course },
    });

  const style: React.CSSProperties = {
    top: `${top}px`,
    height: `${height}px`,
    ...(transform
      ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
      : {}),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`absolute left-0.5 right-0.5 ${color.bg} ${color.border} border overflow-hidden cursor-grab active:cursor-grabbing group ${isOverlapping ? "border-l-2 !border-l-red-500" : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

function DroppableDay({
  day,
  children,
}: {
  day: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: day });
  return (
    <div
      ref={setNodeRef}
      className={`relative border-l border-subtle ${isOver ? "bg-surface-hover" : ""}`}
    >
      {children}
    </div>
  );
}

export default function CourseSchedule({
  selectedCourses,
  isDemoMode = false,
}: CourseScheduleProps) {
  const [courseTimes, setCourseTimes] = useState<CourseTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [draggingCourse, setDraggingCourse] = useState<CourseTime | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

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

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  // Add new useEffect to handle course removal
  useEffect(() => {
    // Find courses that were removed
    const removedCourseIds = courseTimes
      .map((time) => time.courseId)
      .filter(
        (courseId) => !selectedCourses.some((course) => course.id === courseId),
      );

    // Delete schedule entries for removed courses
    const deleteRemovedSchedules = async () => {
      for (const courseId of removedCourseIds) {
        try {
          const response = await fetch(`/api/schedule?courseId=${courseId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete schedule");
          }
        } catch (error) {
          console.error("Error deleting schedule:", error);
          toast({
            title: "Error",
            description: "Failed to delete schedule for removed course",
            variant: "destructive",
          });
        }
      }
    };

    deleteRemovedSchedules();

    // Remove any course times for courses that are no longer selected
    setCourseTimes((prevTimes) =>
      prevTimes.filter((time) =>
        selectedCourses.some((course) => course.id === time.courseId),
      ),
    );
  }, [selectedCourses]);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);

      if (isDemoMode) {
        // Load from localStorage for demo mode, or use default sample data
        const savedSchedule = localStorage.getItem("demoScheduleData");
        if (savedSchedule) {
          const data = JSON.parse(savedSchedule);
          setCourseTimes(data);
        } else {
          // Import and use default sample schedule data
          const { sampleScheduleData } = await import("@/lib/sampleData");
          setCourseTimes(sampleScheduleData);
          // Save the default data to localStorage for persistence
          localStorage.setItem(
            "demoScheduleData",
            JSON.stringify(sampleScheduleData),
          );
        }
        setIsLoading(false);
        return;
      }

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
        })),
      );
    } catch (error) {
      console.error("Error loading schedule:", error);
      if (!isDemoMode) {
        toast({
          title: "Error",
          description: "Failed to load your schedule",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save demo schedule data to localStorage
  const saveDemoSchedule = (scheduleData: CourseTime[]) => {
    if (isDemoMode) {
      localStorage.setItem("demoScheduleData", JSON.stringify(scheduleData));
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      if (isDemoMode) {
        // Handle demo mode - update local state and localStorage
        const updatedSchedule = courseTimes.filter(
          (ct) => ct.id !== scheduleId,
        );
        setCourseTimes(updatedSchedule);
        saveDemoSchedule(updatedSchedule);
        toast({
          title: "Success",
          description: "Schedule deleted successfully",
          variant: "success",
        });
        return;
      }

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
        variant: "success",
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
    updates: Partial<CourseTime>,
  ) => {
    try {
      // Find the current course time data
      const currentCourse = courseTimes.find((ct) => ct.id === scheduleId);
      if (!currentCourse) {
        throw new Error("Course not found");
      }

      // Merge current data with updates
      const updatedData = {
        day: updates.day || currentCourse.day,
        startTime: updates.startTime || currentCourse.startTime,
        endTime: updates.endTime || currentCourse.endTime,
      };

      if (isDemoMode) {
        // Handle demo mode - update local state and localStorage
        const updatedCourseTimes = courseTimes.map((ct) =>
          ct.id === scheduleId ? { ...ct, ...updates } : ct,
        );
        setCourseTimes(updatedCourseTimes);
        saveDemoSchedule(updatedCourseTimes);
      } else {
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
            ct.id === scheduleId ? { ...ct, ...updates } : ct,
          ),
        );
      }

      toast({
        title: "Success",
        description: "Schedule updated successfully",
        variant: "success",
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
        (ct) => ct.courseId === course.id,
      );

      // Default to the next available day
      let defaultDay = "Monday";
      if (existingTimes.length > 0) {
        const usedDays = existingTimes.map((ct) => ct.day);
        defaultDay = DAYS.find((day) => !usedDays.includes(day)) || "Monday";
      }

      if (isDemoMode) {
        // Handle demo mode - generate a mock ID and update local state
        const newSchedule = {
          id: `demo-${Date.now()}-${Math.random()}`,
          courseId: course.id,
          courseName: course.name,
          day: defaultDay,
          startTime: "9:00",
          endTime: "10:15",
        };
        const updatedCourseTimes = [...courseTimes, newSchedule];
        setCourseTimes(updatedCourseTimes);
        saveDemoSchedule(updatedCourseTimes);
      } else {
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
      }

      toast({
        title: "Success",
        description: "Course time slot added",
        variant: "success",
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
    {} as Record<string, CourseTime[]>,
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
      if (isDemoMode) {
        // Handle demo mode - generate a mock ID and update local state
        const newSchedule = {
          id: `demo-slot-${Date.now()}-${Math.random()}`,
          courseId: course.id,
          courseName: course.name,
          day: addSlotDay,
          startTime: addSlotStart,
          endTime: addSlotEnd,
        };
        const updatedCourseTimes = [...courseTimes, newSchedule];
        setCourseTimes(updatedCourseTimes);
        saveDemoSchedule(updatedCourseTimes);
        toast({
          title: "Success",
          description: "Course time slot added",
          variant: "success",
        });
        closeAddSlot();
        return;
      }

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
      toast({
        title: "Success",
        description: "Course time slot added",
        variant: "success",
      });
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
      if (isDemoMode) {
        // Handle demo mode - generate a mock ID and update local state
        const newSchedule = {
          id: `demo-card-slot-${Date.now()}-${Math.random()}`,
          courseId: course.courseId,
          courseName: course.courseName,
          day: addSlotCardDay,
          startTime: addSlotCardStart,
          endTime: addSlotCardEnd,
        };
        const updatedCourseTimes = [...courseTimes, newSchedule];
        setCourseTimes(updatedCourseTimes);
        saveDemoSchedule(updatedCourseTimes);
        toast({
          title: "Success",
          description: "Course time slot added",
          variant: "success",
        });
        closeAddSlotCard();
        return;
      }

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
      toast({
        title: "Success",
        description: "Course time slot added",
        variant: "success",
      });
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

  // Build a stable color map for courseIds
  const uniqueCourseIds = Array.from(
    new Set(courseTimes.map((ct) => ct.courseId)),
  );
  const courseColorMap: Record<string, (typeof BLOCK_COLORS)[number]> = {};
  uniqueCourseIds.forEach((id, idx) => {
    courseColorMap[id] = BLOCK_COLORS[idx % BLOCK_COLORS.length];
  });

  // Build overlap sets for each day (used in both desktop and mobile views)
  const overlapsByDay: Record<string, Set<string>> = {};
  DAYS.forEach((day) => {
    const sorted = (coursesByDay[day] || [])
      .slice()
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const overlaps = new Set<string>();
    for (let i = 1; i < sorted.length; ++i) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (timeToMinutes(curr.startTime) < timeToMinutes(prev.endTime)) {
        overlaps.add(prev.id!);
        overlaps.add(curr.id!);
      }
    }
    overlapsByDay[day] = overlaps;
  });

  // --- Popover form helper (reused for edit, addSlot, addSlotCard) ---
  const renderEditPopoverContent = (course: CourseTime) => (
    <PopoverContent
      className="w-80 p-4 text-t1"
      style={{
        backgroundColor: "hsl(var(--tc-surface))",
        color: "hsl(var(--tc-t1))",
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-mono font-medium">Day</label>
          <Select value={editDay} onValueChange={setEditDay}>
            <SelectTrigger className="h-8 flex items-center justify-between">
              <SelectValue
                placeholder="Select day"
                className="flex-1 text-left"
              />
            </SelectTrigger>
            <SelectContent
              className="bg-surface text-t1 border-strong"
              style={{
                backgroundColor: "hsl(var(--tc-surface))",
                color: "hsl(var(--tc-t1))",
              }}
            >
              {DAYS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium">Start Time</label>
            <input
              type="time"
              className="w-full border border-subtle px-2 py-1 font-mono text-sm bg-transparent"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium">End Time</label>
            <input
              type="time"
              className="w-full border border-subtle px-2 py-1 font-mono text-sm bg-transparent"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={closeEditPopover}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSaveEdit(course.id!)}
          >
            Save
          </Button>
        </div>
      </div>
    </PopoverContent>
  );

  const renderAddSlotPopoverContent = (course: Course) => (
    <PopoverContent
      className="w-80 p-4 text-t1"
      style={{
        backgroundColor: "hsl(var(--tc-surface))",
        color: "hsl(var(--tc-t1))",
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-mono font-medium">Day</label>
          <Select value={addSlotDay} onValueChange={setAddSlotDay}>
            <SelectTrigger className="h-8 flex items-center justify-between">
              <SelectValue
                placeholder="Select day"
                className="flex-1 text-left"
              />
            </SelectTrigger>
            <SelectContent
              className="bg-surface text-t1 border-strong"
              style={{
                backgroundColor: "hsl(var(--tc-surface))",
                color: "hsl(var(--tc-t1))",
              }}
            >
              {DAYS.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium">Start Time</label>
            <input
              type="time"
              className="w-full border border-subtle px-2 py-1 font-mono text-sm bg-transparent"
              value={addSlotStart}
              onChange={(e) => setAddSlotStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium">End Time</label>
            <input
              type="time"
              className="w-full border border-subtle px-2 py-1 font-mono text-sm bg-transparent"
              value={addSlotEnd}
              onChange={(e) => setAddSlotEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={closeAddSlot}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSaveAddSlot(course)}
          >
            Save
          </Button>
        </div>
      </div>
    </PopoverContent>
  );

  const renderAddSlotCardPopoverContent = (course: CourseTime) => (
    <PopoverContent
      className="w-80 p-4 text-t1"
      style={{
        backgroundColor: "hsl(var(--tc-surface))",
        color: "hsl(var(--tc-t1))",
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-mono font-medium">Day</label>
          <Select value={addSlotCardDay} onValueChange={setAddSlotCardDay}>
            <SelectTrigger className="h-8 flex items-center justify-between">
              <SelectValue
                placeholder="Select day"
                className="flex-1 text-left"
              />
            </SelectTrigger>
            <SelectContent
              className="bg-surface text-t1 border-strong"
              style={{
                backgroundColor: "hsl(var(--tc-surface))",
                color: "hsl(var(--tc-t1))",
              }}
            >
              {DAYS.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium">Start Time</label>
            <input
              type="time"
              className="w-full border border-subtle px-2 py-1 font-mono text-sm bg-transparent"
              value={addSlotCardStart}
              onChange={(e) => setAddSlotCardStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-mono font-medium">End Time</label>
            <input
              type="time"
              className="w-full border border-subtle px-2 py-1 font-mono text-sm bg-transparent"
              value={addSlotCardEnd}
              onChange={(e) => setAddSlotCardEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={closeAddSlotCard}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSaveAddSlotCard(course)}
          >
            Save
          </Button>
        </div>
      </div>
    </PopoverContent>
  );

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="border border-subtle p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-t3" />
        <span className="text-t3 font-mono text-sm">Loading schedule...</span>
      </div>
    );
  }

  // Unscheduled courses
  const unscheduledCourses = selectedCourses.filter(
    (c) => !courseTimes.some((ct) => ct.courseId === c.id),
  );

  return (
    <div className="border border-subtle p-4 w-full overflow-hidden">
      <div className="space-y-4">
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-medium text-t1 flex items-center gap-2">
            <button
              type="button"
              aria-label={collapsed ? "Expand" : "Collapse"}
              onClick={() => setCollapsed((c) => !c)}
              className="focus:outline-none text-t2 hover:text-t1 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            Course Schedule
            <span className="text-t4 font-normal">
              ({courseTimes.length} slot{courseTimes.length !== 1 ? "s" : ""})
            </span>
          </h3>
        </div>

        {!collapsed && (
          <div className="space-y-4">
            {/* Available Courses - compact horizontal row */}
            {unscheduledCourses.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs text-t3">Available Courses</p>
                <div className="flex flex-wrap gap-2">
                  {unscheduledCourses.map((course) => (
                    <div key={course.id} className="relative">
                      <Popover
                        open={addSlotOpen === course.id}
                        onOpenChange={(open) =>
                          open ? openAddSlot(course) : closeAddSlot()
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            onClick={() => openAddSlot(course)}
                            className="flex items-center gap-2 px-3 py-1.5 border border-subtle text-xs font-mono text-t2 hover:bg-surface-hover hover:text-t1 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            {course.code}
                          </button>
                        </PopoverTrigger>
                        {renderAddSlotPopoverContent(course)}
                      </Popover>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === DESKTOP: Weekly Calendar Grid (md and above) === */}
            <div className="hidden md:block">
              <div className="relative">
                {/* Header row */}
                <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-subtle">
                  <div className="py-2" />
                  {CALENDAR_DAY_LABELS.map((day) => (
                    <div
                      key={day}
                      className="py-2 text-center font-mono text-xs text-t3 border-l border-subtle"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time grid body */}
                <DndContext
                  sensors={sensors}
                  onDragStart={(event: DragStartEvent) => {
                    const course = event.active.data.current?.course;
                    setDraggingCourse(course || null);
                  }}
                  onDragEnd={(event: DragEndEvent) => {
                    setDraggingCourse(null);
                    const { active, over, delta } = event;
                    if (!active.data.current?.course) return;

                    const course = active.data.current.course as CourseTime;

                    // Calculate new time based on vertical drag distance (stepless — 1 minute precision)
                    const rawMinutesDelta = Math.round(delta.y / PX_PER_MINUTE);
                    const currentStartMin = timeToMinutes(course.startTime);
                    const currentEndMin = timeToMinutes(course.endTime);
                    const duration = currentEndMin - currentStartMin;

                    // Determine target day
                    let targetDay = course.day;
                    if (over && CALENDAR_DAYS.includes(over.id as string)) {
                      targetDay = over.id as string;
                    }

                    // Clamp to valid range (no snapping)
                    const newStartMin = Math.max(
                      HOUR_START * 60,
                      Math.min(
                        currentStartMin + rawMinutesDelta,
                        HOUR_END * 60 - duration,
                      ),
                    );
                    const newEndMin = newStartMin + duration;

                    const newStartTime = `${Math.floor(newStartMin / 60)}:${(newStartMin % 60).toString().padStart(2, "0")}`;
                    const newEndTime = `${Math.floor(newEndMin / 60)}:${(newEndMin % 60).toString().padStart(2, "0")}`;

                    // Only update if something changed
                    if (
                      targetDay !== course.day ||
                      newStartTime !== course.startTime ||
                      newEndTime !== course.endTime
                    ) {
                      if (course.id) {
                        // Optimistic update — move block immediately in local state
                        setCourseTimes((prev) =>
                          prev.map((ct) =>
                            ct.id === course.id
                              ? {
                                  ...ct,
                                  day: targetDay,
                                  startTime: newStartTime,
                                  endTime: newEndTime,
                                }
                              : ct,
                          ),
                        );
                        // Persist in background (no await — fire and forget)
                        handleUpdateSchedule(course.id, {
                          day: targetDay,
                          startTime: newStartTime,
                          endTime: newEndTime,
                        });
                      }
                    }
                  }}
                >
                  <div
                    className="grid grid-cols-[60px_repeat(5,1fr)] relative"
                    style={{
                      height: `${HOUR_COUNT * HOUR_HEIGHT + GRID_PADDING_TOP}px`,
                    }}
                  >
                    {/* Time labels */}
                    <div className="relative">
                      {Array.from(
                        { length: HOUR_COUNT + 1 },
                        (_, i) => i + HOUR_START,
                      ).map((hour) => (
                        <div
                          key={hour}
                          className="absolute w-full text-right pr-2 font-mono text-[10px] text-t4"
                          style={{
                            top: `${(hour - HOUR_START) * HOUR_HEIGHT + GRID_PADDING_TOP - 6}px`,
                          }}
                        >
                          {hour}:00
                        </div>
                      ))}
                    </div>

                    {/* Day columns */}
                    {CALENDAR_DAYS.map((day) => {
                      const dayCourses = coursesByDay[day] || [];
                      const overlaps = overlapsByDay[day] || new Set();

                      return (
                        <DroppableDay key={day} day={day}>
                          {/* Horizontal hour lines */}
                          {Array.from({ length: HOUR_COUNT + 1 }, (_, i) => (
                            <div
                              key={i}
                              className="absolute w-full border-t border-subtle"
                              style={{
                                top: `${i * HOUR_HEIGHT + GRID_PADDING_TOP}px`,
                              }}
                            />
                          ))}

                          {/* Course blocks */}
                          {dayCourses.map((course) => {
                            const startMin = timeToMinutes(course.startTime);
                            const endMin = timeToMinutes(course.endTime);
                            const blockTop =
                              (startMin - HOUR_START * 60) * PX_PER_MINUTE +
                              GRID_PADDING_TOP;
                            const height = Math.max(
                              (endMin - startMin) * PX_PER_MINUTE,
                              20,
                            );
                            const color =
                              courseColorMap[course.courseId] ||
                              BLOCK_COLORS[0];
                            const isOverlapping = overlaps.has(course.id!);

                            return (
                              <Popover
                                key={course.id}
                                open={editingCourseId === course.id}
                                onOpenChange={(open) =>
                                  open
                                    ? openEditPopover(course)
                                    : closeEditPopover()
                                }
                              >
                                <PopoverTrigger asChild>
                                  <DraggableCourseBlock
                                    course={course}
                                    top={blockTop}
                                    height={height}
                                    color={color}
                                    isOverlapping={isOverlapping}
                                  >
                                    <div
                                      className="p-1 h-full flex flex-col cursor-pointer"
                                      onClick={() => openEditPopover(course)}
                                    >
                                      <p
                                        className={`font-mono text-[10px] font-medium text-t1 truncate`}
                                      >
                                        {course.courseName}
                                      </p>
                                      <p className="font-mono text-[9px] text-t3 truncate">
                                        {course.startTime}-{course.endTime}
                                      </p>
                                      {isOverlapping && (
                                        <div className="flex items-center mt-auto">
                                          <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
                                        </div>
                                      )}
                                    </div>
                                    {/* Delete button on hover */}
                                    <button
                                      className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 h-4 w-4 flex items-center justify-center text-t3 hover:text-t1 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        course.id &&
                                          handleDeleteSchedule(course.id);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                    {/* Add slot button on hover */}
                                    <Popover
                                      open={addSlotCardOpen === course.id}
                                      onOpenChange={(open) =>
                                        open
                                          ? openAddSlotCard(course)
                                          : closeAddSlotCard()
                                      }
                                    >
                                      <PopoverTrigger asChild>
                                        <button
                                          className="absolute bottom-0.5 right-0.5 opacity-0 group-hover:opacity-100 h-4 w-4 flex items-center justify-center text-t3 hover:text-t1 transition-opacity"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openAddSlotCard(course);
                                          }}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </button>
                                      </PopoverTrigger>
                                      {renderAddSlotCardPopoverContent(course)}
                                    </Popover>
                                  </DraggableCourseBlock>
                                </PopoverTrigger>
                                {renderEditPopoverContent(course)}
                              </Popover>
                            );
                          })}
                        </DroppableDay>
                      );
                    })}
                  </div>
                </DndContext>
              </div>
            </div>

            {/* === MOBILE: Stacked day-by-day list (below md) === */}
            <div className="md:hidden space-y-3">
              {DAYS.map((day) => {
                const sorted = (coursesByDay[day] || [])
                  .slice()
                  .sort(
                    (a, b) =>
                      timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
                  );
                const overlaps = overlapsByDay[day] || new Set();

                if (sorted.length === 0) return null;

                return (
                  <div key={day} className="border border-subtle">
                    <div className="px-3 py-2 border-b border-subtle">
                      <p className="font-mono text-xs text-t2 font-medium">
                        {day}
                      </p>
                    </div>
                    <div className="divide-y divide-subtle">
                      {sorted.map((course) => {
                        const color =
                          courseColorMap[course.courseId] || BLOCK_COLORS[0];
                        const isOverlapping = overlaps.has(course.id!);

                        return (
                          <div
                            key={course.id}
                            className={`flex items-center gap-3 px-3 py-2 group ${isOverlapping ? "border-l-2 border-l-red-500" : ""}`}
                          >
                            {/* Color indicator */}
                            <div
                              className={`w-1.5 h-8 flex-shrink-0 ${color.bg} ${color.border} border`}
                            />

                            {/* Course info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-xs font-medium text-t1 truncate">
                                {course.courseName}
                              </p>
                              <p className="font-mono text-[10px] text-t3">
                                {course.startTime} - {course.endTime}
                                <span className="ml-1 text-t4">
                                  (
                                  {formatDuration(
                                    course.startTime,
                                    course.endTime,
                                  )}
                                  )
                                </span>
                              </p>
                            </div>

                            {/* Overlap warning */}
                            {isOverlapping && (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Edit popover */}
                              <Popover
                                open={editingCourseId === course.id}
                                onOpenChange={(open) =>
                                  open
                                    ? openEditPopover(course)
                                    : closeEditPopover()
                                }
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    className="h-6 w-6 flex items-center justify-center text-t3 hover:text-t1 transition-colors"
                                    title="Edit Time"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                </PopoverTrigger>
                                {renderEditPopoverContent(course)}
                              </Popover>

                              {/* Add slot popover */}
                              <Popover
                                open={addSlotCardOpen === course.id}
                                onOpenChange={(open) =>
                                  open
                                    ? openAddSlotCard(course)
                                    : closeAddSlotCard()
                                }
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    className="h-6 w-6 flex items-center justify-center text-t3 hover:text-t1 transition-colors"
                                    title="Add Time Slot"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </PopoverTrigger>
                                {renderAddSlotCardPopoverContent(course)}
                              </Popover>

                              {/* Delete */}
                              <button
                                className="h-6 w-6 flex items-center justify-center text-t3 hover:text-t1 transition-colors"
                                onClick={() =>
                                  course.id && handleDeleteSchedule(course.id)
                                }
                                title="Remove"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Empty state for mobile */}
              {courseTimes.length === 0 && (
                <div className="border border-subtle p-6 text-center">
                  <p className="font-mono text-xs text-t4">
                    No courses scheduled. Add courses from the list above.
                  </p>
                </div>
              )}
            </div>

            {/* Empty state for desktop */}
            {courseTimes.length === 0 && (
              <div className="hidden md:flex border border-subtle p-8 items-center justify-center">
                <p className="font-mono text-xs text-t4">
                  No courses scheduled. Add courses from the available list
                  above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
