"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowRightLeft, Edit2, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface CreditTransfer {
  id: string;
  fromCategory: string;
  toCategory: string;
  amount: number;
}

interface AdditionalQuestionsProps {
  onEthicsCourseChange: (
    hasEthicsCourse: boolean,
    course?: Course,
    deductFromCategory?: string,
  ) => void;
  onTechie5901Change: (hasTechie5901: boolean, anchorCourse?: Course) => void;
  selectedCourses: Course[];
  coursePlan: { [key: string]: Course[] };
  isDemoMode?: boolean;
  currentSelectedEthicsCourse?: Course | null;
  currentEthicsDeductionCategory?: string | null;
  currentSelectedAnchorCourse?: Course | null;
  // Credit transfer props
  creditTransfers?: CreditTransfer[];
  onTransferCredits?: (transfer: CreditTransfer) => Promise<void>;
  onEditTransfer?: (transfer: CreditTransfer) => void;
  onDeleteTransfer?: (transferId: string) => Promise<void>;
  requirements?: { [key: string]: { credits: number; description: string } };
  calculateCategoryCredits?: (categoryKey: string) => any;
}

export default function AdditionalQuestions({
  onEthicsCourseChange,
  onTechie5901Change,
  selectedCourses,
  coursePlan,
  isDemoMode = false,
  currentSelectedEthicsCourse,
  currentEthicsDeductionCategory,
  currentSelectedAnchorCourse,
  // Credit transfer props
  creditTransfers = [],
  onTransferCredits,
  onEditTransfer,
  onDeleteTransfer,
  requirements = {},
  calculateCategoryCredits,
}: AdditionalQuestionsProps) {
  const [tookEthics, setTookEthics] = useState(false);
  const [tookTechie5901, setTookTechie5901] = useState(false);
  const [selectedEthicsCourse, setSelectedEthicsCourse] = useState("");
  const [deductedCategory, setDeductedCategory] = useState<string | null>(null);
  const [selectedAnchorCourse, setSelectedAnchorCourse] = useState("");

  // Credit transfer states
  const [hasCreditTransfers, setHasCreditTransfers] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<CreditTransfer | null>(
    null,
  );
  const [transferFromCategory, setTransferFromCategory] = useState("");
  const [transferToCategory, setTransferToCategory] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [deletingTransferId, setDeletingTransferId] = useState<string>("");

  // Add loading states
  const [isLoading, setIsLoading] = useState(true);

  // Sync local state with parent component's ethics course state
  useEffect(() => {
    if (currentSelectedEthicsCourse && currentEthicsDeductionCategory) {
      setTookEthics(true);
      setSelectedEthicsCourse(currentSelectedEthicsCourse.code);
      setDeductedCategory(currentEthicsDeductionCategory);
    } else {
      // Only clear state if parent has explicitly cleared it
      // This prevents clearing during initial load
      if (
        currentSelectedEthicsCourse === null &&
        currentEthicsDeductionCategory === null
      ) {
        setTookEthics(false);
        setSelectedEthicsCourse("");
        setDeductedCategory(null);
      }
    }
  }, [currentSelectedEthicsCourse, currentEthicsDeductionCategory]);

  // Sync local state with parent component's anchor course state
  useEffect(() => {
    if (currentSelectedAnchorCourse) {
      setTookTechie5901(true); // Ensure checkbox is checked when anchor course is set
      setSelectedAnchorCourse(currentSelectedAnchorCourse.code);
    } else if (currentSelectedAnchorCourse === null) {
      setSelectedAnchorCourse("");
      // Don't uncheck tookTechie5901 here as there might be legacy cases without anchor course
    }
  }, [currentSelectedAnchorCourse]);

  // Sync credit transfer state with actual transfers
  useEffect(() => {
    setHasCreditTransfers(creditTransfers.length > 0);
  }, [creditTransfers]);

  // Load saved requirements on component mount
  useEffect(() => {
    const loadSavedRequirements = async () => {
      try {
        // If parent has already provided state, don't override it with demo data
        if (currentSelectedEthicsCourse || currentSelectedAnchorCourse) {
          setIsLoading(false);
          return;
        }

        if (isDemoMode) {
          // Demo mode - load from localStorage or set defaults
          const savedDemoData = localStorage.getItem("additionalQuestionsDemo");
          if (savedDemoData) {
            const data = JSON.parse(savedDemoData);
            setTookEthics(data.tookEthics || false);
            setSelectedEthicsCourse(data.selectedEthicsCourse || "");
            setDeductedCategory(data.deductedCategory || null);
            setTookTechie5901(data.tookTechie5901 || false);
            setSelectedAnchorCourse(data.selectedAnchorCourse || "");
          } else {
            // Set demo defaults - INFO 5910 fulfills ethics requirement
            // Dynamically find which category INFO 5910 is assigned to
            const ethicsCourse = selectedCourses.find(
              (c) => c.code === "INFO 5910",
            );
            let detectedCategory = null;

            if (ethicsCourse) {
              // Find which category contains this ethics course
              for (const [category, courses] of Object.entries(coursePlan)) {
                if (courses.some((course) => course.code === "INFO 5910")) {
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

        const response = await fetch("/api/course-special-requirements");
        if (!response.ok) {
          console.warn("Failed to fetch requirements:", response.status);
          return; // Don't throw, just return and show the component
        }

        const requirements = await response.json();

        // Find ethics requirement
        const ethicsReq = requirements.find(
          (req: any) => req.requirement_type === "ethics_course",
        );
        if (ethicsReq) {
          setTookEthics(true);
          setSelectedEthicsCourse(ethicsReq.selected_course_id || "");
          setDeductedCategory(ethicsReq.deducted_from_category);

          // Find the course object from selectedCourses
          const course = selectedCourses.find(
            (c) => c.code === ethicsReq.selected_course_id,
          );
          if (course) {
            try {
              await onEthicsCourseChange(
                true,
                course,
                ethicsReq.deducted_from_category,
              );
            } catch (error) {
              console.warn("Error applying ethics course change:", error);
              // Don't throw, just log the error
            }
          }
        }

        // Find Techie 5901 requirement
        const techieReq = requirements.find(
          (req: any) => req.requirement_type === "techie_5901",
        );
        if (techieReq) {
          setTookTechie5901(true);

          // If there's a selected course ID (anchor course), find and set it
          if (techieReq.selected_course_id) {
            setSelectedAnchorCourse(techieReq.selected_course_id);

            // Find the anchor course object from selectedCourses
            const anchorCourse = selectedCourses.find(
              (c) => c.code === techieReq.selected_course_id,
            );

            if (anchorCourse) {
              // Don't call onTechie5901Change during initial loading to avoid conflicts
              // The parent component will load the anchor course via its own loadSpecialRequirements
              console.log(
                "Anchor course loaded in AdditionalQuestions:",
                anchorCourse.code,
              );
            }
          } else {
            // Legacy case - just the checkbox without anchor course
            // Let the parent component handle this via its own loading logic
            console.log("Techie 5901 requirement found without anchor course");
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
  }, [
    isDemoMode,
    currentSelectedEthicsCourse,
    selectedCourses,
    coursePlan,
    onEthicsCourseChange,
    onTechie5901Change,
  ]); // Include necessary dependencies but prioritize parent props

  // Save demo data to localStorage
  const saveDemoData = () => {
    if (isDemoMode) {
      const demoData = {
        tookEthics,
        selectedEthicsCourse: tookEthics ? selectedEthicsCourse : "",
        deductedCategory: tookEthics ? deductedCategory : null,
        tookTechie5901,
        selectedAnchorCourse: tookTechie5901 ? selectedAnchorCourse : "",
      };
      localStorage.setItem("additionalQuestionsDemo", JSON.stringify(demoData));
    }
  };

  // Save ethics course selection to database
  const saveEthicsRequirement = async (
    hasEthicsCourse: boolean,
    course?: Course,
    deductFromCategory?: string,
  ) => {
    if (isDemoMode) {
      // Just save to localStorage for demo mode
      setTimeout(() => saveDemoData(), 0);
      return;
    }

    try {
      // Validate inputs only when ethics course is being set
      if (hasEthicsCourse && (!course || !deductFromCategory)) {
        throw new Error(
          "Course and deduction category are required when ethics course is selected",
        );
      }

      // Validate course exists in selected courses (only when setting ethics course)
      if (
        hasEthicsCourse &&
        course &&
        !selectedCourses.some((c) => c.id === course.id)
      ) {
        throw new Error(
          "Selected course must be in the list of selected courses",
        );
      }

      // Validate category exists in course plan (only when setting ethics course)
      if (
        hasEthicsCourse &&
        deductFromCategory &&
        !Object.keys(coursePlan).includes(deductFromCategory)
      ) {
        throw new Error("Deduction category must exist in course plan");
      }

      // Prepare the request body based on whether we're setting or clearing the ethics course
      const requestBody = {
        requirementType: "ethics_course",
        selectedCourseId: hasEthicsCourse ? course?.code : null,
        deductedFromCategory: hasEthicsCourse ? deductFromCategory : null,
        creditAmount: hasEthicsCourse ? course?.credits || -1 : null,
        addedToCategory: hasEthicsCourse ? "JacobsTechnicalCore" : null, // Always add 1 credit to JacobsTechnicalCore when setting
      };

      const response = await fetch("/api/course-special-requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error saving ethics requirement:", error);

      // Revert state on error based on the original intent
      if (hasEthicsCourse) {
        // If we were trying to set ethics course, revert to cleared state
        setTookEthics(false);
        setSelectedEthicsCourse("");
        setDeductedCategory(null);
        try {
          await onEthicsCourseChange(false);
        } catch (innerError) {
          console.error("Error reverting ethics course change:", innerError);
        }
      } else {
        // If we were trying to clear ethics course, revert to previous state
        // Note: This is tricky since we don't have previous state here
        // The calling component should handle the revert in this case
      }
      throw error;
    }
  };

  // Save Techie 5901 selection to database
  const saveTechie5901Requirement = async (
    hasTechie5901: boolean,
    anchorCourse?: Course,
  ) => {
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
          "Program does not have JacobsProgrammaticCore requirement",
        );
      }

      const response = await fetch("/api/course-special-requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirementType: "techie_5901",
          selectedCourseId: hasTechie5901
            ? anchorCourse?.code || "TECHIE5901"
            : null,
          deductedFromCategory: null,
          creditAmount: 1,
          addedToCategory: hasTechie5901 ? "JacobsProgrammaticCore" : null,
          anchorCourseId: anchorCourse?.code || null,
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
      setSelectedAnchorCourse("");
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
      // Clear all ethics-related state
      setSelectedEthicsCourse("");
      setDeductedCategory(null);

      // Notify parent component to clear its state
      onEthicsCourseChange(false);

      try {
        // Save the cleared state to database/localStorage
        await saveEthicsRequirement(false);
      } catch (error) {
        console.error("Error clearing ethics requirement:", error);
        // Revert UI state on error
        setTookEthics(true);
        // Re-throw to let calling component handle it
        throw error;
      }
    }
  };

  const handleEthicsCourseSelect = async (courseCode: string) => {
    setSelectedEthicsCourse(courseCode);
    const selectedCourse = selectedCourses.find(
      (course) => course.code === courseCode,
    );

    if (selectedCourse) {
      // Always deduct from the category where the course is currently assigned
      const assignedCategory = findCourseAssignment(courseCode);
      let targetCategory = assignedCategory;

      if (!targetCategory) {
        // If not assigned to a category yet, determine the best default
        if (selectedCourse.credits === 1) {
          // For 1-credit ethics courses, default to Jacobs Technical Core if it exists
          targetCategory = Object.keys(coursePlan).includes(
            "JacobsTechnicalCore",
          )
            ? "JacobsTechnicalCore"
            : Object.keys(coursePlan)[0]; // Fallback to first available category
          console.log(
            `1-credit ethics course ${courseCode} not assigned - defaulting to ${targetCategory}`,
          );
        } else {
          // For multi-credit courses, default to first available category
          targetCategory = Object.keys(coursePlan)[0];
          console.log(
            `Ethics course ${courseCode} not assigned to category - defaulting to ${targetCategory}`,
          );
        }
      } else {
        console.log(
          `Ethics course ${courseCode} (${selectedCourse.credits} cr) - deducting from assigned category: ${assignedCategory}`,
        );
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

    if (!newValue) {
      // Clear anchor course selection when unchecking
      setSelectedAnchorCourse("");
      onTechie5901Change(false);
      await saveTechie5901Requirement(false);
    }
    // Don't call onTechie5901Change(true) immediately - wait for anchor course selection
  };

  const handleAnchorCourseSelect = async (courseCode: string) => {
    setSelectedAnchorCourse(courseCode);
    const anchorCourse = selectedCourses.find(
      (course) => course.code === courseCode,
    );

    if (anchorCourse) {
      // Notify parent component with both checkbox state and anchor course
      onTechie5901Change(true, anchorCourse);
      await saveTechie5901Requirement(true, anchorCourse);
    }
  };

  // Credit transfer helper functions
  const getRequirementDisplayName = (key: string) => {
    return key.replace(/([A-Z])/g, " $1").trim();
  };

  const resetTransferForm = () => {
    setTransferFromCategory("");
    setTransferToCategory("");
    setTransferAmount("");
    setEditingTransfer(null);
  };

  const openTransferDialog = (transfer?: CreditTransfer) => {
    if (transfer) {
      setEditingTransfer(transfer);
      setTransferFromCategory(transfer.fromCategory);
      setTransferToCategory(transfer.toCategory);
      setTransferAmount(transfer.amount.toString());
    } else {
      resetTransferForm();
    }
    setIsTransferDialogOpen(true);
  };

  const handleTransferSubmit = async () => {
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmittingTransfer(true);
    try {
      if (editingTransfer && onEditTransfer) {
        // Handle edit - call the edit function with updated transfer
        const updatedTransfer: CreditTransfer = {
          ...editingTransfer,
          fromCategory: transferFromCategory,
          toCategory: transferToCategory,
          amount: amount,
        };
        onEditTransfer(updatedTransfer);
      } else if (onTransferCredits) {
        // Handle create - call the create function
        await onTransferCredits({
          id: crypto.randomUUID(),
          fromCategory: transferFromCategory,
          toCategory: transferToCategory,
          amount: amount,
        });
      }
      setIsTransferDialogOpen(false);
      resetTransferForm();
    } catch (error) {
      console.error("Error with transfer operation:", error);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const handleDeleteTransfer = async (transferId: string) => {
    if (!onDeleteTransfer) return;

    setDeletingTransferId(transferId);
    try {
      await onDeleteTransfer(transferId);
    } catch (error) {
      console.error("Error deleting transfer:", error);
    } finally {
      setDeletingTransferId("");
    }
  };

  const validateTransferForm = (): string | null => {
    if (!transferFromCategory) return "Please select a source requirement.";
    if (!transferToCategory) return "Please select a destination requirement.";
    if (transferFromCategory === transferToCategory)
      return "Source and destination must be different.";

    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0)
      return "Please enter a valid credit amount.";

    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading...</div>
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
              <SelectTrigger className="w-full bg-neutral-950 border border-input rounded-md h-10">
                <SelectValue placeholder="Select course" className="text-sm" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-950">
                {selectedCourses.length > 0 ? (
                  selectedCourses.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.code}
                      className="text-sm py-2.5 pl-3 pr-6 hover:bg-white/[0.04] cursor-pointer"
                    >
                      {course.code} - {course.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value=""
                    disabled
                    className="text-sm py-2.5 pl-3 pr-6 text-neutral-500"
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
      <div className="space-y-2">
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
        {tookTechie5901 && (
          <div className="pl-6 space-y-2">
            <label className="text-sm font-medium">
              Which course is your anchor course?
            </label>
            <Select
              value={selectedAnchorCourse}
              onValueChange={handleAnchorCourseSelect}
            >
              <SelectTrigger className="w-full bg-neutral-950 border border-input rounded-md h-10">
                <SelectValue
                  placeholder="Select anchor course"
                  className="text-sm"
                />
              </SelectTrigger>
              <SelectContent className="bg-neutral-950">
                {selectedCourses.length > 0 ? (
                  selectedCourses.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.code}
                      className="text-sm py-2.5 pl-3 pr-6 hover:bg-white/[0.04] cursor-pointer"
                    >
                      {course.code} - {course.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value=""
                    disabled
                    className="text-sm py-2.5 pl-3 pr-6 text-neutral-500"
                  >
                    No courses selected
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Credit Transfer Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="creditTransfers"
              checked={hasCreditTransfers}
              onCheckedChange={(checked) => {
                setHasCreditTransfers(checked as boolean);
              }}
            />
            <label
              htmlFor="creditTransfers"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Transfer credits between requirements?
            </label>
          </div>
          {hasCreditTransfers && (
            <Dialog
              open={isTransferDialogOpen}
              onOpenChange={setIsTransferDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHasCreditTransfers(true);
                    openTransferDialog();
                  }}
                  className="h-8 w-8 p-0 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-colors"
                  title="Add credit transfer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-purple-400">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-full">
                      <ArrowRightLeft className="h-4 w-4 text-purple-400" />
                    </div>
                    {editingTransfer ? "Edit Transfer" : "Add Credit Transfer"}
                  </DialogTitle>
                  <DialogDescription className="text-purple-400">
                    Move credits from one requirement to another. This is useful
                    for courses that can count towards multiple requirements.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromCategory">From Requirement</Label>
                    <Select
                      value={transferFromCategory}
                      onValueChange={setTransferFromCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(requirements).map((key) => (
                          <SelectItem key={key} value={key}>
                            {getRequirementDisplayName(key)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toCategory">To Requirement</Label>
                    <Select
                      value={transferToCategory}
                      onValueChange={setTransferToCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(requirements)
                          .filter((key) => key !== transferFromCategory)
                          .map((key) => (
                            <SelectItem key={key} value={key}>
                              {getRequirementDisplayName(key)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Credit Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Enter credit amount"
                    />
                  </div>

                  {validateTransferForm() && (
                    <div className="text-sm text-red-600">
                      {validateTransferForm()}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsTransferDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTransferSubmit}
                    disabled={isSubmittingTransfer || !!validateTransferForm()}
                  >
                    {isSubmittingTransfer
                      ? "Saving..."
                      : editingTransfer
                        ? "Update Transfer"
                        : "Create Transfer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Existing Transfers List */}
        {creditTransfers.length > 0 && (
          <div className="mt-3">
            <div className="space-y-3">
              {creditTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="group relative p-4 border border-border/60 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 hover:shadow-sm hover:border-border"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Enhanced Credit Badge */}
                      <div className="flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-semibold text-sm px-2 py-1 shadow-sm"
                        >
                          {transfer.amount}
                        </Badge>
                      </div>

                      {/* Transfer Flow */}
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex items-center justify-center gap-3 text-sm w-full">
                          <span className="font-semibold text-neutral-200 leading-tight truncate">
                            {getRequirementDisplayName(transfer.fromCategory)}
                          </span>
                          <ArrowRight className="h-4 w-4 text-purple-400 flex-shrink-0" />
                          <span className="font-semibold text-neutral-200 leading-tight truncate">
                            {getRequirementDisplayName(transfer.toCategory)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTransferDialog(transfer)}
                        className="h-6 w-6 p-0 hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span className="sr-only">Edit transfer</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-neutral-200 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            disabled={deletingTransferId === transfer.id}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete transfer</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Credit Transfer
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this credit
                              transfer? This will remove {transfer.amount}{" "}
                              credit
                              {transfer.amount > 1 ? "s" : ""} from being
                              transferred from{" "}
                              <span className="font-medium">
                                {getRequirementDisplayName(
                                  transfer.fromCategory,
                                )}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {getRequirementDisplayName(transfer.toCategory)}
                              </span>
                              . This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTransfer(transfer.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingTransferId === transfer.id
                                ? "Deleting..."
                                : "Delete Transfer"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ethics Status Info Card */}
      {tookEthics && selectedEthicsCourse && deductedCategory && (
        <Card className="p-4 bg-green-500/10 border-green-500/20 mt-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-400">
              ✓ Ethics Requirement Fulfilled
            </div>
            <div className="text-sm text-green-400">
              <div className="mb-1">
                <strong>{selectedEthicsCourse}</strong> fulfills the ethics
                requirement.
              </div>
              <div className="text-green-400">
                1 credit is automatically deducted from{" "}
                <strong>
                  {deductedCategory.replace(/([A-Z])/g, " $1").trim()}
                </strong>{" "}
                to avoid double-counting.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Anchor Course Status Info Card */}
      {tookTechie5901 && selectedAnchorCourse && (
        <Card className="p-4 bg-blue-500/10 border-blue-500/20 mt-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-400">
              ✓ INFO 5920 Anchor Course Selected
            </div>
            <div className="text-sm text-blue-400">
              <div className="mb-1">
                <strong>{selectedAnchorCourse}</strong> is your anchor course
                for INFO 5920.
              </div>
              <div className="text-blue-400">
                This course has been moved to{" "}
                <strong>Jacobs Programmatic Core</strong> and will count as your
                anchor course for the specialization project.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Credit Transfer Status Info Card */}
      {/* {creditTransfers.length > 0 && (
                <Card className="p-5 bg-gradient-to-r from-purple-50/80 to-blue-50/80 border-purple-200 shadow-sm mt-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full">
                                <ArrowRightLeft className="h-3.5 w-3.5 text-purple-700" />
                            </div>
                            <div className="text-sm font-semibold text-purple-800">
                                Credit Transfers Active (
                                {creditTransfers.length})
                            </div>
                        </div>
                        <div className="pl-8 space-y-2">
                            {creditTransfers.map((transfer) => (
                                <div
                                    key={transfer.id}
                                    className="text-sm text-purple-700"
                                >
                                    <span className="font-medium">
                                        {transfer.amount} credit
                                        {transfer.amount > 1 ? "s" : ""}
                                    </span>{" "}
                                    transferred from{" "}
                                    <span className="font-medium">
                                        {getRequirementDisplayName(
                                            transfer.fromCategory
                                        )}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {getRequirementDisplayName(
                                            transfer.toCategory
                                        )}
                                    </span>
                                </div>
                            ))}
                            <div className="text-xs text-purple-600 mt-3 pt-2 border-t border-purple-200/50">
                                ℹ️ These transfers are automatically
                                reflected in your credit calculations above.
                            </div>
                        </div>
                    </div>
                </Card>
            )} */}
    </div>
  );
}
