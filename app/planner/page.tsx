"use client";

import { useState, useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Search,
  GraduationCap,
  HelpCircle,
  X,
  ArrowRightLeft,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  sampleCourses,
  sampleSelectedCourses,
  sampleCoursePlan,
  sampleUserProgram,
} from "@/lib/sampleData";
import CreditTransferModal from "./components/CreditTransferModal";
import EditCreditTransferModal from "./components/EditCreditTransferModal";
import HelpSection from "./components/HelpSection";
import DemoBanner from "./components/DemoBanner";
import ProgressOverview from "./components/ProgressOverview";
import RequirementCard from "./components/RequirementCard";
import type {
  Course,
  Requirement,
  ProgramRequirement,
  CreditTransfer,
} from "./types";
import { programRequirements } from "./data/programRequirements";

/**
 * How to Use the Planner:
 * 1. Select your program from the dropdown menu
 * 2. Use the course search to find and add courses to your plan
 * 3. Assign courses to specific requirements by dragging them to the appropriate section
 * 4. Track your progress through the progress bars and credit counters
 * 5. Mark courses as "taken" if you've already completed them
 * 6. Your plan will be automatically saved as you make changes
 *
 * Tips:
 * - Hover over requirement sections to see detailed descriptions
 * - Use the search bar to quickly find specific courses
 * - Check the additional requirements section for important program rules
 * - The progress bars show your completion status for each requirement
 */

const CourseSelector = dynamic(() => import("./components/CourseSelector"), {
  ssr: false,
  loading: () => <div className="h-48 bg-surface-active animate-pulse"></div>,
});

const SelectedCourses = dynamic(() => import("./components/SelectedCourses"), {
  ssr: true,
  loading: () => <div className="h-64 bg-surface-active animate-pulse"></div>,
});

const CourseSchedule = dynamic(() => import("./components/CourseSchedule"), {
  ssr: true,
  loading: () => <div className="h-64 bg-surface-active animate-pulse"></div>,
});

const AdditionalQuestions = dynamic(
  () => import("./components/AdditionalQuestions"),
  {
    ssr: true,
    loading: () => <div className="h-32 bg-surface-active animate-pulse"></div>,
  },
);

export default function PlannerPage() {
  const { data: session, status } = useSession();
  const [userProgram, setUserProgram] = useState<string | null>(null);
  const [coursePlan, setCoursePlan] = useState<{ [key: string]: Course[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const { toast } = useToast();
  const [coursePlanIds, setCoursePlanIds] = useState<{
    [courseId: string]: string;
  }>({});
  const selectedCoursesRef = useRef<HTMLDivElement>(null);
  const coursePlanRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false); // new state for modal
  // Add state for collapsible requirement cards
  const [expandedRequirements, setExpandedRequirements] = useState<{
    [key: string]: boolean;
  }>({});
  // Add state for collapsible Additional Questions and Additional Requirements
  const [expandedAdditionalQuestions, setExpandedAdditionalQuestions] =
    useState(true);
  const [expandedAdditionalRequirements, setExpandedAdditionalRequirements] =
    useState(true);

  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  // Ethics course tracking state
  const [selectedEthicsCourse, setSelectedEthicsCourse] =
    useState<Course | null>(null);
  const [ethicsDeductionCategory, setEthicsDeductionCategory] = useState<
    string | null
  >(null);

  // Anchor course tracking state for INFO 5920
  const [selectedAnchorCourse, setSelectedAnchorCourse] =
    useState<Course | null>(null);

  // Track the original category of the anchor course so we can restore it when unchecked
  const [anchorCourseOriginalCategory, setAnchorCourseOriginalCategory] =
    useState<string | null>(null);

  // Special requirements state
  const [specialRequirements, setSpecialRequirements] = useState<any[]>([]);

  // Credit transfer state
  const [creditTransfers, setCreditTransfers] = useState<CreditTransfer[]>([]);
  const [editingTransfer, setEditingTransfer] = useState<CreditTransfer | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Helper: toggle expanded state for a requirement card
  const toggleRequirement = (key: string) => {
    setExpandedRequirements((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "plannerExpandedRequirements",
          JSON.stringify(newState),
        );
      }
      return newState;
    });
  };
  // Helper: toggle for Additional Questions
  const toggleAdditionalQuestions = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setExpandedAdditionalQuestions((prev) => {
        const newState = !prev;
        localStorage.setItem(
          "plannerExpandedAdditionalQuestions",
          JSON.stringify(newState),
        );
        return newState;
      });
    }
  };
  // Helper: toggle for Additional Requirements
  const toggleAdditionalRequirements = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setExpandedAdditionalRequirements((prev) => {
        const newState = !prev;
        localStorage.setItem(
          "plannerExpandedAdditionalRequirements",
          JSON.stringify(newState),
        );
        return newState;
      });
    }
  };

  // Helper: toggle showHelp for How to Use the Planner card
  const toggleShowHelp = (value: boolean) => {
    setShowHelp(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("plannerShowHelp", JSON.stringify(value));
    }
  };

  // Restore expanded/collapsed state from localStorage on mount
  useEffect(() => {
    // Restore expanded/collapsed state for requirements
    if (typeof window !== "undefined") {
      const savedExpandedRequirements = localStorage.getItem(
        "plannerExpandedRequirements",
      );
      if (savedExpandedRequirements) {
        setExpandedRequirements(JSON.parse(savedExpandedRequirements));
      }
      // Restore Additional Questions
      const savedAdditionalQuestions = localStorage.getItem(
        "plannerExpandedAdditionalQuestions",
      );
      if (savedAdditionalQuestions !== null) {
        setExpandedAdditionalQuestions(JSON.parse(savedAdditionalQuestions));
      }
      // Restore Additional Requirements
      const savedAdditionalRequirements = localStorage.getItem(
        "plannerExpandedAdditionalRequirements",
      );
      if (savedAdditionalRequirements !== null) {
        setExpandedAdditionalRequirements(
          JSON.parse(savedAdditionalRequirements),
        );
      }
      // Restore How to Use the Planner help card
      const savedShowHelp = localStorage.getItem("plannerShowHelp");
      if (savedShowHelp !== null) {
        setShowHelp(JSON.parse(savedShowHelp));
      }
    }
    // No cleanup needed
  }, []);

  // Add scroll position persistence
  useEffect(() => {
    // Restore scroll position
    const savedScrollPosition = sessionStorage.getItem("plannerScrollPosition");
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
    }

    // Save scroll position before unload
    const handleBeforeUnload = () => {
      sessionStorage.setItem(
        "plannerScrollPosition",
        window.scrollY.toString(),
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true);

        if (status === "loading") {
          // Don't initialize while session is still loading
          return;
        }

        if (status === "authenticated" && session?.user?.program) {
          setUserProgram(session.user.program);
          setIsDemoMode(false);
          await Promise.all([loadSavedCoursePlans(), loadCreditTransfers()]);
        } else if (status === "authenticated" && session) {
          setIsDemoMode(false);
          // Parallel fetch user program and prepare for course plans
          const [userProgram] = await Promise.all([
            fetchUserProgramAsync(),
            // Could add other parallel operations here
          ]);
          if (userProgram) {
            setUserProgram(userProgram);
            await Promise.all([loadSavedCoursePlans(), loadCreditTransfers()]);
          }
        } else if (status === "unauthenticated") {
          // No session - initialize demo mode
          initializeDemoMode();
        }
      } catch (error) {
        console.error("Error initializing page:", error);
        toast({
          title: "Error",
          description: "Failed to initialize the page",
          variant: "destructive",
        });
      } finally {
        // Only stop loading if we're not in the 'loading' status
        if (status !== "loading") {
          setIsLoading(false);
        }
      }
    };

    const initializeDemoMode = () => {
      // Load demo data
      setIsDemoMode(true);
      setUserProgram(sampleUserProgram);
      setSelectedCourses([...sampleSelectedCourses]);
      setCoursePlan(JSON.parse(JSON.stringify(sampleCoursePlan))); // Deep copy

      // Check if we should force refresh demo data (can be controlled via URL param or localStorage flag)
      const urlParams = new URLSearchParams(window.location.search);
      const forceRefresh =
        urlParams.get("refresh") === "true" ||
        localStorage.getItem("forceRefreshDemo") === "true";

      if (forceRefresh) {
        // Clear all demo-related localStorage and use fresh sample data
        localStorage.removeItem("plannerDemoData");
        localStorage.removeItem("demoScheduleData");
        localStorage.removeItem("additionalQuestionsDemo");
        localStorage.removeItem("showTakenCoursesDemo");
        localStorage.removeItem("forceRefreshDemo");
        console.log("Demo data refreshed with latest sample data");
      } else {
        // Load from localStorage if available (preserving user changes)
        const savedDemoData = localStorage.getItem("plannerDemoData");
        if (savedDemoData) {
          try {
            const demoData = JSON.parse(savedDemoData);
            setSelectedCourses(
              demoData.selectedCourses || [...sampleSelectedCourses],
            );
            setCoursePlan(
              demoData.coursePlan ||
                JSON.parse(JSON.stringify(sampleCoursePlan)),
            );
            setUserProgram(demoData.userProgram || sampleUserProgram);
          } catch (error) {
            console.warn("Failed to load demo data from localStorage:", error);
            // Fall back to fresh sample data
            setSelectedCourses([...sampleSelectedCourses]);
            setCoursePlan(JSON.parse(JSON.stringify(sampleCoursePlan)));
            setUserProgram(sampleUserProgram);
          }
        }
      }
    };

    // Initialize when we have a definitive authentication status
    if (status !== "loading" && !userProgram) {
      initializePage();
    }
  }, [session, status]);

  const loadCreditTransfers = async () => {
    try {
      const response = await fetch("/api/credit-transfers");
      if (response.ok) {
        const data = await response.json();
        setCreditTransfers(data.transfers || []);
      }
    } catch (error) {
      console.error("Error loading credit transfers:", error);
    }
  };

  const loadSavedCoursePlans = async () => {
    try {
      const response = await fetch("/api/planner");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to load course plans: ${errorText}`);
      }

      const data = await response.json();

      // Optimize data processing with single loop
      const uniqueCoursesMap = new Map<string, Course>();
      const newCoursePlan: { [key: string]: Course[] } = {};
      const coursePlanIds: { [courseId: string]: string } = {};

      // Single pass through data for better performance
      for (const plan of data) {
        const courseId = plan.course.id;

        // Handle unique courses map
        const existing = uniqueCoursesMap.get(courseId);
        if (!existing || plan.course.taken) {
          uniqueCoursesMap.set(courseId, plan.course);
        }

        // Handle course plan structure
        if (plan.requirementType) {
          if (!newCoursePlan[plan.requirementType]) {
            newCoursePlan[plan.requirementType] = [];
          }
          newCoursePlan[plan.requirementType].push(plan.course);
          coursePlanIds[courseId] = plan.id;
        }
      }

      const loadedCourses = Array.from(uniqueCoursesMap.values());
      setSelectedCourses(loadedCourses);

      // Store the plan IDs in state
      setCoursePlanIds(coursePlanIds);
      setCoursePlan(newCoursePlan);

      // Load special requirements with the loaded courses and course plan
      await loadSpecialRequirements(loadedCourses, newCoursePlan);
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

  const loadSpecialRequirements = async (
    coursesForLookup?: Course[],
    coursePlanForLookup?: { [key: string]: Course[] },
  ) => {
    try {
      const response = await fetch("/api/course-special-requirements");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error loading special requirements:", errorText);
        throw new Error(`Failed to load special requirements: ${errorText}`);
      }

      const requirements = await response.json();
      setSpecialRequirements(requirements);

      // Find ethics requirement and update local state
      const ethicsReq = requirements.find(
        (req: any) => req.requirement_type === "ethics_course",
      );
      if (ethicsReq && ethicsReq.selected_course_id) {
        // Use provided courses or current selectedCourses state
        const coursesToSearch = coursesForLookup || selectedCourses;
        const course = coursesToSearch.find(
          (c) => c.code === ethicsReq.selected_course_id,
        );
        if (course) {
          setSelectedEthicsCourse(course);
          setEthicsDeductionCategory(ethicsReq.deducted_from_category);
        }
      }

      // Find anchor course requirement and update local state
      const anchorReq = requirements.find(
        (req: any) => req.requirement_type === "techie_5901",
      );
      if (anchorReq && anchorReq.selected_course_id) {
        // Use provided courses or current selectedCourses state
        const coursesToSearch = coursesForLookup || selectedCourses;
        const course = coursesToSearch.find(
          (c) => c.code === anchorReq.selected_course_id,
        );
        if (course) {
          setSelectedAnchorCourse(course);
          console.log("Anchor course loaded from database:", course.code);

          // Move the anchor course to JacobsProgrammaticCore if it's not already there
          // Helper function to find course in the provided course plan (not state)
          const findCourseInProvidedPlan = (
            courseId: string,
            planToSearch: { [key: string]: Course[] },
          ) => {
            for (const [category, courses] of Object.entries(planToSearch)) {
              if (courses.some((course) => course.id === courseId)) {
                return category;
              }
            }
            return null;
          };

          const planToUse = coursePlanForLookup || coursePlan;
          const currentCategory = findCourseInProvidedPlan(
            course.id,
            planToUse,
          );

          if (currentCategory && currentCategory !== "JacobsProgrammaticCore") {
            // Track the original category before moving
            setAnchorCourseOriginalCategory(currentCategory);
            console.log(
              `Tracking original category for ${course.code} during load: ${currentCategory}`,
            );

            // Remove from current category and add to JacobsProgrammaticCore
            setCoursePlan((prev) => ({
              ...prev,
              [currentCategory]:
                prev[currentCategory]?.filter((c) => c.id !== course.id) || [],
              JacobsProgrammaticCore: [
                ...(prev.JacobsProgrammaticCore || []),
                course,
              ],
            }));
            console.log(
              `Moved anchor course ${course.code} from ${currentCategory} to JacobsProgrammaticCore during load`,
            );
          } else if (!currentCategory) {
            // Course not in any category, track this as null
            setAnchorCourseOriginalCategory(null);
            console.log(
              `${course.code} not in any category during load, tracking as null`,
            );

            // Add directly to JacobsProgrammaticCore if not in any category
            setCoursePlan((prev) => ({
              ...prev,
              JacobsProgrammaticCore: [
                ...(prev.JacobsProgrammaticCore || []),
                course,
              ],
            }));
            console.log(
              `Added anchor course ${course.code} to JacobsProgrammaticCore during load`,
            );
          } else {
            console.log(
              `Anchor course ${course.code} is already in JacobsProgrammaticCore`,
            );
          }

          // Add 1-credit INFO 5920 to JacobsProgrammaticCore if not already present
          if (!hasOneCreditInfo5920InCore()) {
            const oneCreditInfo5920 = createOneCreditInfo5920();
            setCoursePlan((prev) => ({
              ...prev,
              JacobsProgrammaticCore: [
                ...(prev.JacobsProgrammaticCore || []),
                oneCreditInfo5920,
              ],
            }));
            console.log(
              "Added 1-credit INFO 5920 to JacobsProgrammaticCore during load (anchor course exists)",
            );
          }
        }
      }
    } catch (error) {
      console.error("Error loading special requirements:", error);
      // Don't throw - special requirements are optional
    }
  };

  const fetchUserProgramAsync = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();

      if (!data.program) {
        toast({
          title: "Program not set",
          description: "Please set your program in the settings page first.",
          variant: "destructive",
        });
        return null;
      }
      return data.program;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your program information.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Save demo data to localStorage
  const saveDemoData = () => {
    if (isDemoMode) {
      const demoData = {
        selectedCourses,
        coursePlan,
        userProgram,
      };
      localStorage.setItem("plannerDemoData", JSON.stringify(demoData));
    }
  };

  // Demo mode handler for requirement assignment
  const handleAddToRequirementDemo = (
    course: Course,
    requirementKey: string | null,
  ) => {
    if (!requirementKey) {
      // Remove from all requirements
      setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
        const newPlan = { ...prevPlan };
        for (const key in newPlan) {
          newPlan[key] = newPlan[key].filter((c) => c.id !== course.id);
        }
        setTimeout(() => saveDemoData(), 0);
        return newPlan;
      });
      return;
    }

    // Remove from other requirements first
    setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
      const newPlan = { ...prevPlan };
      for (const key in newPlan) {
        if (key !== requirementKey) {
          newPlan[key] = newPlan[key].filter((c) => c.id !== course.id);
        }
      }
      return newPlan;
    });

    // Add to selected requirement
    setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
      const currentCourses = prevPlan[requirementKey] || [];
      const newPlan = {
        ...prevPlan,
        [requirementKey]: [...currentCourses, course],
      };
      setTimeout(() => saveDemoData(), 0);
      return newPlan;
    });
  };

  const calculateTotalCredits = () => {
    if (!userProgram) return 0;

    let totalCredits = 0;
    let totalEthicsDeductions = 0;
    let totalEthicsAdditions = 0;
    let totalTransferDeductions = 0;
    let totalTransferAdditions = 0;

    Object.keys(coursePlan).forEach((categoryKey) => {
      const creditInfo = calculateCategoryCredits(categoryKey);
      totalCredits += creditInfo.totalCredits;
      totalEthicsDeductions += creditInfo.ethicsDeduction;
      totalEthicsAdditions += creditInfo.ethicsAddition;
      totalTransferDeductions += creditInfo.transferDeductions;
      totalTransferAdditions += creditInfo.transferAdditions;
    });

    return (
      totalCredits -
      totalEthicsDeductions +
      totalEthicsAdditions -
      totalTransferDeductions +
      totalTransferAdditions
    );
  };

  const calculateRequirementProgress = (requirementKey: string) => {
    if (!userProgram) return 0;

    const creditInfo = calculateCategoryCredits(requirementKey);
    const requiredCredits =
      programRequirements[userProgram].requirements[requirementKey].credits;

    return (creditInfo.netCredits / requiredCredits) * 100;
  };

  const calculateOverallProgress = () => {
    if (!userProgram) return 0;

    const totalCredits = calculateTotalCredits();
    const requiredCredits = programRequirements[userProgram].totalCredits;

    return (totalCredits / requiredCredits) * 100;
  };

  const handleTransferCredits = async (transfer: CreditTransfer) => {
    try {
      if (!isDemoMode) {
        const response = await fetch("/api/credit-transfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromCategory: transfer.fromCategory,
            toCategory: transfer.toCategory,
            creditAmount: transfer.amount,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create credit transfer");
        }
      }

      setCreditTransfers((prev) => [...prev, transfer]);

      toast({
        title: "Success",
        description: `Transferred ${transfer.amount} credit${transfer.amount > 1 ? "s" : ""} from ${transfer.fromCategory.replace(/([A-Z])/g, " $1").trim()} to ${transfer.toCategory.replace(/([A-Z])/g, " $1").trim()}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create credit transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTransfer = (transfer: CreditTransfer) => {
    setEditingTransfer(transfer);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransfer = async (updatedTransfer: CreditTransfer) => {
    try {
      if (!isDemoMode) {
        const response = await fetch(
          `/api/credit-transfers/${updatedTransfer.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromCategory: updatedTransfer.fromCategory,
              toCategory: updatedTransfer.toCategory,
              creditAmount: updatedTransfer.amount,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update credit transfer");
        }
      }

      setCreditTransfers((prev) =>
        prev.map((transfer) =>
          transfer.id === updatedTransfer.id ? updatedTransfer : transfer,
        ),
      );

      toast({
        title: "Success",
        description: `Updated credit transfer: ${updatedTransfer.amount} credit${updatedTransfer.amount > 1 ? "s" : ""} from ${updatedTransfer.fromCategory.replace(/([A-Z])/g, " $1").trim()} to ${updatedTransfer.toCategory.replace(/([A-Z])/g, " $1").trim()}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update credit transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransfer = async (transferId: string) => {
    try {
      if (!isDemoMode) {
        const response = await fetch(`/api/credit-transfers/${transferId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete credit transfer");
        }
      }

      setCreditTransfers((prev) =>
        prev.filter((transfer) => transfer.id !== transferId),
      );

      toast({
        title: "Success",
        description: "Credit transfer deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete credit transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransfer(null);
  };

  const handleAddToRequirement = async (
    course: Course,
    requirementKey: string | null,
  ) => {
    if (!userProgram) {
      toast({
        title: "Error",
        description: "Program must be selected",
        variant: "destructive",
      });
      return;
    }

    // Demo mode - handle locally without API calls
    if (isDemoMode) {
      handleAddToRequirementDemo(course, requirementKey);
      return;
    }

    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in and have a program selected",
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
            newPlan[key] = newPlan[key].filter((c) => c.id !== course.id);
          }
          return newPlan;
        });

        // Delete from database
        const planId = coursePlanIds[course.id];
        if (planId) {
          const deleteResponse = await fetch(`/api/planner?id=${planId}`, {
            method: "DELETE",
          });

          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error("Error deleting course plan:", errorText);
            throw new Error(`Failed to delete course plan: ${errorText}`);
          }

          // Remove the plan ID from state
          setCoursePlanIds((prev) => {
            const newIds = { ...prev };
            delete newIds[course.id];
            return newIds;
          });
        }

        return;
      }

      // Remove from other requirements first
      setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
        const newPlan = { ...prevPlan };
        for (const key in newPlan) {
          if (key !== requirementKey) {
            newPlan[key] = newPlan[key].filter((c) => c.id !== course.id);
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
            0,
          ) + course.credits;

        if (newTotalCredits > programRequirements[userProgram].totalCredits) {
          toast({
            title: "Warning",
            description: `You have selected ${newTotalCredits} total credits, but only ${programRequirements[userProgram].totalCredits} are required for your program.`,
            variant: "destructive",
          });
        } else if (
          newTotalCredits === programRequirements[userProgram].totalCredits
        ) {
          toast({
            title: "Success",
            description: `You have selected the required ${programRequirements[userProgram].totalCredits} credits for your program.`,
            variant: "success",
          });
        }

        return {
          ...prevPlan,
          [requirementKey]: [...currentCourses, course],
        };
      });

      // Save to database
      const saveData = {
        courseId: course.id,
        requirementType: requirementKey,
        semester: course.semester || "Fall",
        year: course.year || new Date().getFullYear(),
        status: "planned",
      };

      try {
        // First check if a plan already exists for this course
        const existingPlanId = coursePlanIds[course.id];
        if (existingPlanId) {
          // Update existing plan
          const updateResponse = await fetch("/api/planner", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: existingPlanId,
              requirementType: requirementKey,
              semester: course.semester || "Fall",
              year: course.year || new Date().getFullYear(),
              status: "planned",
            }),
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error("Error updating course plan:", errorText);
            throw new Error(`Failed to update course plan: ${errorText}`);
          }

          await updateResponse.json();
        } else {
          // Create new plan
          const createResponse = await fetch("/api/planner", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(saveData),
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error("Error creating course plan:", errorText);
            throw new Error(`Failed to create course plan: ${errorText}`);
          }

          const newPlan = await createResponse.json();

          // Store the new plan ID
          setCoursePlanIds((prev) => ({
            ...prev,
            [course.id]: newPlan.id,
          }));
        }
      } catch (error) {
        console.error("Error in save operation:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to save course plan",
          variant: "destructive",
        });
        // Revert the UI state on error
        setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
          const newPlan = { ...prevPlan };
          if (requirementKey) {
            newPlan[requirementKey] = newPlan[requirementKey].filter(
              (c) => c.id !== course.id,
            );
          }
          return newPlan;
        });
      }
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

  const handleRemoveCourse = async (course: Course) => {
    try {
      // Remove from selectedCourses
      setSelectedCourses((prevCourses: Course[]) =>
        prevCourses.filter((c) => c.id !== course.id),
      );

      // Remove from all requirements in coursePlan
      setCoursePlan((prevPlan: { [key: string]: Course[] }) => {
        const newPlan = { ...prevPlan };
        for (const key in newPlan) {
          newPlan[key] = newPlan[key].filter((c) => c.id !== course.id);
        }
        return newPlan;
      });

      // Demo mode - just save to localStorage
      if (isDemoMode) {
        setTimeout(() => saveDemoData(), 0);
        toast({
          title: "Success",
          description: "Course removed successfully",
          variant: "success",
        });
        return;
      }

      // Delete all course plans for this course from database
      const response = await fetch(`/api/planner?courseId=${course.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error deleting course plans:", errorText);
        throw new Error(`Failed to delete course plans: ${errorText}`);
      }

      // Remove all plan IDs for this course from state
      setCoursePlanIds((prev) => {
        const newIds = { ...prev };
        delete newIds[course.id];
        return newIds;
      });

      toast({
        title: "Success",
        description: "Course removed successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error removing course:", error);
      // Revert UI state on error
      setSelectedCourses((prev) => [...prev, course]);
      setCoursePlan((prevPlan) => {
        const newPlan = { ...prevPlan };
        // Restore course to its original requirement if it exists
        if (coursePlanIds[course.id]) {
          const requirementKey = Object.keys(newPlan).find((key) =>
            newPlan[key].some((c) => c.id === course.id),
          );
          if (requirementKey) {
            newPlan[requirementKey] = [...newPlan[requirementKey], course];
          }
        }
        return newPlan;
      });
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove the course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEthicsCourseChange = async (
    hasEthicsCourse: boolean,
    course?: Course,
    deductFromCategory?: string,
  ) => {
    // Update the ethics course tracking state
    if (hasEthicsCourse && course && deductFromCategory) {
      setSelectedEthicsCourse(course);
      setEthicsDeductionCategory(deductFromCategory);
      console.log(
        "Ethics course set:",
        course.code,
        "deducting from:",
        deductFromCategory,
      );
    } else {
      // Clear the ethics course state
      setSelectedEthicsCourse(null);
      setEthicsDeductionCategory(null);
      console.log("Ethics course cleared");
    }

    // Handle demo mode vs production mode differently
    if (isDemoMode) {
      // In demo mode, save to localStorage immediately
      setTimeout(() => saveDemoData(), 0);
    } else {
      // In production mode, reload special requirements to reflect the database change
      // This ensures we get the updated state from the server
      try {
        await loadSpecialRequirements();
      } catch (error) {
        console.error(
          "Error reloading special requirements after ethics course change:",
          error,
        );
        // Don't throw here - the UI should still reflect the change even if reload fails
      }
    }
  };

  const handleTechie5901Change = async (
    hasTechie5901: boolean,
    anchorCourse?: Course,
  ) => {
    // Simplified for demo mode - just save to localStorage
    if (isDemoMode) {
      setTimeout(() => saveDemoData(), 0);
    }

    if (hasTechie5901 && anchorCourse) {
      // Update selected anchor course state
      setSelectedAnchorCourse(anchorCourse);

      // Track the original category before moving the anchor course
      const currentCategory = findCourseInPlan(anchorCourse.id);
      if (currentCategory && currentCategory !== "JacobsProgrammaticCore") {
        setAnchorCourseOriginalCategory(currentCategory);
        console.log(
          `Tracking original category for ${anchorCourse.code}: ${currentCategory}`,
        );
      } else if (!currentCategory) {
        // Course isn't in any category yet, track this as null
        setAnchorCourseOriginalCategory(null);
        console.log(
          `${anchorCourse.code} not in any category, tracking as null`,
        );
      }

      // Move the anchor course to JacobsProgrammaticCore
      if (currentCategory && currentCategory !== "JacobsProgrammaticCore") {
        // Remove from current category and add to JacobsProgrammaticCore
        setCoursePlan((prev) => ({
          ...prev,
          [currentCategory]:
            prev[currentCategory]?.filter((c) => c.id !== anchorCourse.id) ||
            [],
          JacobsProgrammaticCore: [
            ...(prev.JacobsProgrammaticCore || []),
            anchorCourse,
          ],
        }));
        console.log(
          `Moved ${anchorCourse.code} from ${currentCategory} to JacobsProgrammaticCore as anchor course`,
        );
      } else if (!currentCategory) {
        // Add directly to JacobsProgrammaticCore if not in any category
        setCoursePlan((prev) => ({
          ...prev,
          JacobsProgrammaticCore: [
            ...(prev.JacobsProgrammaticCore || []),
            anchorCourse,
          ],
        }));
        console.log(
          `Added ${anchorCourse.code} to JacobsProgrammaticCore as anchor course`,
        );
      }

      // Add 1-credit INFO 5920 to JacobsProgrammaticCore if not already present
      if (!hasOneCreditInfo5920InCore()) {
        const oneCreditInfo5920 = createOneCreditInfo5920();
        setCoursePlan((prev) => ({
          ...prev,
          JacobsProgrammaticCore: [
            ...(prev.JacobsProgrammaticCore || []),
            oneCreditInfo5920,
          ],
        }));
        console.log(
          "Added 1-credit INFO 5920 to JacobsProgrammaticCore for anchor course",
        );
      }
    } else if (!hasTechie5901) {
      // Restore anchor course to its original category if we have one selected
      const currentAnchorCourse = selectedAnchorCourse;
      if (currentAnchorCourse && anchorCourseOriginalCategory) {
        // Move the anchor course back to its original category
        setCoursePlan((prev) => ({
          ...prev,
          JacobsProgrammaticCore: (prev.JacobsProgrammaticCore || []).filter(
            (c) => c.id !== currentAnchorCourse.id,
          ),
          [anchorCourseOriginalCategory]: [
            ...(prev[anchorCourseOriginalCategory] || []),
            currentAnchorCourse,
          ],
        }));
        console.log(
          `Restored ${currentAnchorCourse.code} from JacobsProgrammaticCore to ${anchorCourseOriginalCategory}`,
        );
      } else if (currentAnchorCourse && anchorCourseOriginalCategory === null) {
        // Course wasn't in any category originally, just remove it from JacobsProgrammaticCore
        setCoursePlan((prev) => ({
          ...prev,
          JacobsProgrammaticCore: (prev.JacobsProgrammaticCore || []).filter(
            (c) => c.id !== currentAnchorCourse.id,
          ),
        }));
        console.log(
          `Removed ${currentAnchorCourse.code} from JacobsProgrammaticCore (wasn't in any category originally)`,
        );
      } else if (currentAnchorCourse) {
        // We have an anchor course but no tracked original category (edge case)
        // Just remove from JacobsProgrammaticCore and log a warning
        setCoursePlan((prev) => ({
          ...prev,
          JacobsProgrammaticCore: (prev.JacobsProgrammaticCore || []).filter(
            (c) => c.id !== currentAnchorCourse.id,
          ),
        }));
        console.warn(
          `No original category tracked for ${currentAnchorCourse.code}, just removed from JacobsProgrammaticCore`,
        );
      }

      // Clear selected anchor course state and original category tracking
      setSelectedAnchorCourse(null);
      setAnchorCourseOriginalCategory(null);

      // Remove 1-credit INFO 5920
      removeOneCreditInfo5920FromCore();
      console.log(
        "Cleared anchor course selection and removed 1-credit INFO 5920 from JacobsProgrammaticCore",
      );
    }

    // In production mode, reload special requirements to reflect the database change
    // This ensures we get the updated state from the server
    // Only reload if we just made a change (not during initial load)
    if (!isDemoMode && anchorCourse) {
      try {
        await loadSpecialRequirements();
      } catch (error) {
        console.error(
          "Error reloading special requirements after anchor course change:",
          error,
        );
        // Don't throw here - the UI should still reflect the change even if reload fails
      }
    }

    console.log(
      "Techie 5901 change:",
      hasTechie5901,
      anchorCourse ? `with anchor course ${anchorCourse.code}` : "",
    );
  };

  // Helper function to find which requirement category a course is in
  const findCourseInPlan = (courseId: string): string | null => {
    for (const [category, courses] of Object.entries(coursePlan)) {
      if (courses.some((course) => course.id === courseId)) {
        return category;
      }
    }
    return null;
  };

  // Utility function to create a 1-credit INFO 5920 course object
  const createOneCreditInfo5920 = (): Course => {
    return {
      id: "info-5920-1cr-anchor",
      code: "INFO 5920",
      name: "Specialization Project (1cr)",
      credits: 1,
      description:
        "1-credit component of INFO 5920 added when taking with anchor course.",
      department: "INFO",
      semester: "Spring", // This can be adjusted as needed
      year: new Date().getFullYear(),
    };
  };

  // Utility function to check if 1-credit INFO 5920 already exists in programmatic core
  const hasOneCreditInfo5920InCore = (): boolean => {
    const corecourses = coursePlan.JacobsProgrammaticCore || [];
    return corecourses.some(
      (course) =>
        course.code === "INFO 5920" &&
        course.credits === 1 &&
        course.id === "info-5920-1cr-anchor",
    );
  };

  // Utility function to remove 1-credit INFO 5920 from programmatic core
  const removeOneCreditInfo5920FromCore = () => {
    setCoursePlan((prev) => ({
      ...prev,
      JacobsProgrammaticCore: (prev.JacobsProgrammaticCore || []).filter(
        (course) =>
          !(
            course.code === "INFO 5920" &&
            course.credits === 1 &&
            course.id === "info-5920-1cr-anchor"
          ),
      ),
    }));
  };

  // Helper function to check if a course fulfills ethics requirement
  const isEthicsCourse = (courseCode: string): boolean => {
    // List of courses that can fulfill ethics requirement
    const ethicsCourseCodes = [
      "INFO 5910", // Revolutionary Technologies
      "INFO 5325", // Social and Ethical Issues in Tech
      "TECH 5010", // Ethics in Technology
      "INFO 5999", // Ethics in AI and Data Science
    ];
    return ethicsCourseCodes.includes(courseCode);
  };

  // Helper function to check if ethics requirement is fulfilled and get the course
  const getEthicsFulfillmentInfo = () => {
    // Check Additional Questions state for selected ethics course
    // For demo mode, we'll assume INFO 5910 is the ethics course if it's assigned
    const ethicsCourse = Object.values(coursePlan)
      .flat()
      .find((course) => isEthicsCourse(course.code));
    return ethicsCourse;
  };

  // Helper function to calculate credits for a category including ethics deduction and addition
  const calculateCategoryCredits = (categoryKey: string) => {
    const courses = coursePlan[categoryKey] || [];
    const totalCredits = courses.reduce(
      (sum, course) => sum + course.credits,
      0,
    );

    // Check if this category should have ethics deduction based on user selection
    const shouldDeductEthicsCredit =
      selectedEthicsCourse &&
      ethicsDeductionCategory === categoryKey &&
      courses.some((course) => course.id === selectedEthicsCourse.id);

    // Programs that have ethics requirements typically include MS IS programs
    const programsWithEthicsRequirements = [
      "ms-is-cm",
      "ms-is-ht",
      "ms-is-ut", // MS Information Systems programs
    ];
    const ethicsDeduction =
      shouldDeductEthicsCredit &&
      userProgram &&
      programsWithEthicsRequirements.includes(userProgram)
        ? 1
        : 0;

    // Check if this category should have ethics addition (specifically for JacobsTechnicalCore)
    let ethicsAddition = 0;
    if (
      categoryKey === "JacobsTechnicalCore" &&
      userProgram &&
      programsWithEthicsRequirements.includes(userProgram)
    ) {
      // Check if there's an ethics requirement with a selected course (regardless of credit count)
      const ethicsReq = specialRequirements.find(
        (req: any) =>
          req.requirement_type === "ethics_course" && req.selected_course_id, // Only if a course is actually selected
      );
      if (ethicsReq) {
        ethicsAddition = 1; // Always add 1 credit to JacobsTechnicalCore when ethics course is selected
      }
    }

    // Calculate custom credit transfers
    let transferDeductions = 0;
    let transferAdditions = 0;

    creditTransfers.forEach((transfer) => {
      if (transfer.fromCategory === categoryKey) {
        transferDeductions += transfer.amount;
      }
      if (transfer.toCategory === categoryKey) {
        transferAdditions += transfer.amount;
      }
    });

    return {
      totalCredits,
      ethicsDeduction,
      ethicsAddition,
      transferDeductions,
      transferAdditions,
      netCredits:
        totalCredits -
        ethicsDeduction +
        ethicsAddition -
        transferDeductions +
        transferAdditions,
    };
  };

  const handleCourseTaken = async (course: Course, taken: boolean) => {
    try {
      setSelectedCourses((prevCourses) =>
        prevCourses.map((c) => (c.id === course.id ? { ...c, taken } : c)),
      );
      setCoursePlan((prevPlan) => {
        const newPlan = { ...prevPlan };
        for (const key in newPlan) {
          newPlan[key] = newPlan[key].map((c) =>
            c.id === course.id ? { ...c, taken } : c,
          );
        }
        return newPlan;
      });

      // Demo mode - just save to localStorage
      if (isDemoMode) {
        setTimeout(() => saveDemoData(), 0);
        return;
      }

      const planId = coursePlanIds[course.id];
      if (planId) {
        // Find the requirementType for this course
        let planRequirementType = null;
        for (const [reqKey, courses] of Object.entries(coursePlan)) {
          if (courses.some((c) => c.id === course.id)) {
            planRequirementType = reqKey;
            break;
          }
        }
        // Use course fields for semester/year, and default status/notes
        const planSemester = course.semester;
        const planYear = course.year;
        const planStatus = "planned";
        const planNotes = "";

        const response = await fetch(`/api/planner?id=${planId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: planId,
            requirementType: planRequirementType,
            semester: planSemester,
            year: planYear,
            status: planStatus,
            notes: planNotes,
            taken,
          }),
        });
        if (!response.ok) throw new Error("Failed to update course status");
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive",
      });
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="pt-24">
        {/* Loading Skeleton */}
        <div className="w-full bg-surface">
          <div className="mx-auto max-w-[980px] px-6">
            <div className="text-center py-12">
              <div className="h-12 bg-surface-active w-full max-w-64 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-surface-active w-full max-w-96 mx-auto animate-pulse"></div>
            </div>
            <div className="text-center mb-8">
              <div className="h-8 bg-surface-active w-full max-w-80 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[980px] px-6 py-12 space-y-8">
          <div className="h-24 bg-surface-active animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-surface-active animate-pulse"
                ></div>
              ))}
            </div>
            <div className="md:col-span-8 space-y-6">
              <div className="h-48 bg-surface-active animate-pulse"></div>
              <div className="h-64 bg-surface-active animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProgram || !programRequirements[userProgram]) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <section className="w-full pt-24 pb-12 md:pb-24 lg:pb-16">
            <div className="mx-auto max-w-[980px] px-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-full max-w-2xl border border-subtle bg-surface">
                  <div className="space-y-1 px-6 py-4">
                    <h2 className="text-2xl font-mono text-t1">
                      Program Not Set
                    </h2>
                    <p className="text-t3">
                      Please set your program in the settings page before using
                      the course planner.
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-4 px-6 pb-6">
                    <p className="text-t3">
                      You need to select your program to start planning your
                      courses.
                    </p>
                    <Button
                      asChild
                      className="bg-cta text-cta hover:bg-cta-hover rounded-none font-mono"
                    >
                      <Link href="/settings">Go to Settings</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      {/* Top Section */}
      <div className="w-full border-b border-subtle">
        <div className="mx-auto max-w-[980px] px-6">
          {/* Program Title */}
          <div className="text-center py-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3 mb-2">
              Planner
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Course Planner.
            </h1>
            <p className="mt-3 text-base text-t3">
              Plan and track your academic journey.
            </p>
          </div>
          {/* Program Info */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <GraduationCap className="h-6 w-6 text-t2" />
              <h2 className="text-xl font-mono font-semibold tracking-tighter text-t2">
                {programRequirements[userProgram].name}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode Banner */}
      <DemoBanner
        isDemoMode={isDemoMode}
        showDemoBanner={showDemoBanner}
        onHideBanner={() => setShowDemoBanner(false)}
        onResetDemo={() => {
          localStorage.setItem("forceRefreshDemo", "true");
          window.location.reload();
        }}
        onSignIn={() => signIn()}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-[980px] px-6 py-12 space-y-8">
        <HelpSection
          showHelp={showHelp}
          showHelpModal={showHelpModal}
          onToggleHelp={toggleShowHelp}
          onToggleHelpModal={setShowHelpModal}
        />
        {/* Overall Progress */}
        <ProgressOverview
          totalCredits={calculateTotalCredits()}
          requiredCredits={programRequirements[userProgram].totalCredits}
          overallProgress={calculateOverallProgress()}
        />
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column - Categories */}
          <div ref={coursePlanRef} className="md:col-span-4 space-y-4">
            {Object.entries(programRequirements[userProgram].requirements).map(
              ([key, requirement]) => {
                const isMobile =
                  typeof window !== "undefined" && window.innerWidth < 768;
                const expanded = expandedRequirements[key] ?? !isMobile;

                return (
                  <RequirementCard
                    key={key}
                    requirementKey={key}
                    requirement={requirement}
                    expanded={expanded}
                    onToggle={toggleRequirement}
                    coursePlan={coursePlan}
                    creditTransfers={creditTransfers}
                    calculateCategoryCredits={calculateCategoryCredits}
                    calculateRequirementProgress={calculateRequirementProgress}
                    selectedEthicsCourse={selectedEthicsCourse}
                    selectedAnchorCourse={selectedAnchorCourse}
                    userProgram={userProgram}
                    requirements={programRequirements[userProgram].requirements}
                    onTransferCredits={handleTransferCredits}
                  />
                );
              },
            )}

            {/* Collapsible Additional Questions Card */}
            <div className="border border-subtle">
              <div
                className={`flex justify-between items-center border-b border-subtle px-4 py-3 cursor-pointer md:cursor-default select-none md:select-text`}
                onClick={toggleAdditionalQuestions}
                aria-expanded={expandedAdditionalQuestions}
                aria-controls="additional-questions-content"
                role={
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? "button"
                    : undefined
                }
                tabIndex={
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? 0
                    : -1
                }
              >
                <h3 className="font-mono text-sm text-t2">
                  Additional Questions
                </h3>
                {/* Chevron for mobile */}
                <span className="ml-2 md:hidden">
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedAdditionalQuestions ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
              <div
                id="additional-questions-content"
                className={`px-4 pb-4 transition-all duration-300 overflow-hidden ${expandedAdditionalQuestions ? "block" : "hidden"} md:block`}
              >
                <AdditionalQuestions
                  onEthicsCourseChange={handleEthicsCourseChange}
                  onTechie5901Change={handleTechie5901Change}
                  selectedCourses={selectedCourses}
                  coursePlan={coursePlan}
                  isDemoMode={isDemoMode}
                  currentSelectedEthicsCourse={selectedEthicsCourse}
                  currentEthicsDeductionCategory={ethicsDeductionCategory}
                  currentSelectedAnchorCourse={selectedAnchorCourse}
                  // Credit transfer props
                  creditTransfers={creditTransfers}
                  onTransferCredits={handleTransferCredits}
                  onEditTransfer={handleEditTransfer}
                  onDeleteTransfer={handleDeleteTransfer}
                  requirements={programRequirements[userProgram!].requirements}
                  calculateCategoryCredits={calculateCategoryCredits}
                />
              </div>
            </div>
            {/* Additional Requirements Card */}
            {programRequirements[userProgram].additionalRequirements && (
              <div className="border border-subtle">
                <div
                  className={`flex justify-between items-center border-b border-subtle px-4 py-3 cursor-pointer md:cursor-default select-none md:select-text`}
                  onClick={toggleAdditionalRequirements}
                  aria-expanded={expandedAdditionalRequirements}
                  aria-controls="additional-requirements-content"
                  role={
                    typeof window !== "undefined" && window.innerWidth < 768
                      ? "button"
                      : undefined
                  }
                  tabIndex={
                    typeof window !== "undefined" && window.innerWidth < 768
                      ? 0
                      : -1
                  }
                >
                  <h3 className="font-mono text-sm text-t2">
                    Additional Requirements
                  </h3>
                  {/* Chevron for mobile */}
                  <span className="ml-2 md:hidden">
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedAdditionalRequirements ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
                <div
                  id="additional-requirements-content"
                  className={`px-4 pb-4 transition-all duration-300 overflow-hidden ${expandedAdditionalRequirements ? "block" : "hidden"} md:block`}
                >
                  <div className="space-y-3">
                    <ul className="text-sm text-t3 space-y-2">
                      {programRequirements[
                        userProgram
                      ].additionalRequirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--tc-t3))]"></span>
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Right Column - Course Search and Management */}
          <div className="md:col-span-8 space-y-6">
            {/* Search Section */}
            <div className="border border-subtle p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Search className="h-5 w-5 text-t4" />
                  <Input
                    placeholder="Search for courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-surface-hover border border-strong text-t1 placeholder:text-t4 font-mono text-sm rounded-none"
                  />
                </div>
                {/* Course Selector */}
                <CourseSelector
                  requirement={{
                    credits: programRequirements[userProgram].totalCredits,
                    description: "All available courses",
                  }}
                  selectedCourses={selectedCourses}
                  onSelectCourse={async (course) => {
                    try {
                      // Add to selectedCourses state
                      setSelectedCourses([...selectedCourses, course]);
                      setSearchQuery("");

                      // Demo mode - just save locally
                      if (isDemoMode) {
                        setTimeout(() => saveDemoData(), 0);
                        toast({
                          title: "Success",
                          description: "Course added to your plan",
                          variant: "success",
                        });
                        return;
                      }

                      // Save to database
                      const saveData = {
                        courseId: course.id,
                        requirementType: null, // No requirement type initially
                        semester: course.semester || "Fall",
                        year: course.year || new Date().getFullYear(),
                        status: "planned",
                      };

                      const createResponse = await fetch("/api/planner", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(saveData),
                      });

                      if (!createResponse.ok) {
                        const errorText = await createResponse.text();
                        console.error("Error creating course plan:", errorText);
                        throw new Error(
                          `Failed to create course plan: ${errorText}`,
                        );
                      }

                      const newPlan = await createResponse.json();

                      // Store the new plan ID
                      setCoursePlanIds((prev) => ({
                        ...prev,
                        [course.id]: newPlan.id,
                      }));

                      toast({
                        title: "Success",
                        description: "Course added to your plan",
                        variant: "success",
                      });
                    } catch (error) {
                      console.error("Error saving course:", error);
                      // Revert the UI state on error
                      setSelectedCourses((prev) =>
                        prev.filter((c) => c.id !== course.id),
                      );
                      toast({
                        title: "Error",
                        description:
                          error instanceof Error
                            ? error.message
                            : "Failed to save course to your plan",
                        variant: "destructive",
                      });
                    }
                  }}
                  searchQuery={searchQuery}
                  sampleCourses={isDemoMode ? sampleCourses : undefined}
                />
              </div>
            </div>
            {/* Selected Courses List */}
            <div ref={selectedCoursesRef}>
              <SelectedCourses
                selectedCourses={selectedCourses}
                onRemoveCourse={handleRemoveCourse}
                requirements={programRequirements[userProgram!].requirements}
                onAddToRequirement={handleAddToRequirement}
                coursePlan={coursePlan}
                onCourseTaken={handleCourseTaken}
                isDemoMode={isDemoMode}
              />
            </div>
            <CourseSchedule
              selectedCourses={selectedCourses.filter(
                (course) => !course.taken,
              )}
              isDemoMode={isDemoMode}
            />
          </div>
        </div>

        {/* Edit Transfer Modal */}
        <EditCreditTransferModal
          transfer={editingTransfer}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          requirements={programRequirements[userProgram!].requirements}
          coursePlan={coursePlan}
          calculateCategoryCredits={calculateCategoryCredits}
          onUpdateTransfer={handleUpdateTransfer}
          existingTransfers={creditTransfers}
        />
      </div>
    </div>
  );
}
