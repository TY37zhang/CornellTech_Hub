"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import CreditTransferModal from "./CreditTransferModal";
import type { Course, Requirement, CreditTransfer } from "../types";

interface CategoryCreditInfo {
  totalCredits: number;
  ethicsDeduction: number;
  ethicsAddition: number;
  transferDeductions: number;
  transferAdditions: number;
  netCredits: number;
}

interface RequirementCardProps {
  requirementKey: string;
  requirement: Requirement;
  expanded: boolean;
  onToggle: (key: string) => void;
  coursePlan: { [key: string]: Course[] };
  creditTransfers: CreditTransfer[];
  calculateCategoryCredits: (key: string) => CategoryCreditInfo;
  calculateRequirementProgress: (key: string) => number;
  selectedEthicsCourse: Course | null;
  selectedAnchorCourse: Course | null;
  userProgram: string;
  requirements: { [key: string]: Requirement };
  onTransferCredits: (transfer: CreditTransfer) => Promise<void>;
}

export default function RequirementCard({
  requirementKey,
  requirement,
  expanded,
  onToggle,
  coursePlan,
  creditTransfers,
  calculateCategoryCredits,
  calculateRequirementProgress,
  selectedEthicsCourse,
  selectedAnchorCourse,
  userProgram,
  requirements,
  onTransferCredits,
}: RequirementCardProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="border border-white/[0.06] group hover:border-white/[0.1] transition-colors p-0">
      {/* Header as button on mobile, static on desktop */}
      <div
        className={`flex flex-wrap items-center px-4 py-3 cursor-pointer md:cursor-default select-none md:select-text`}
        onClick={() => {
          if (window.innerWidth < 768) onToggle(requirementKey);
        }}
        aria-expanded={expanded}
        aria-controls={`requirement-content-${requirementKey}`}
        role={isMobile ? "button" : undefined}
        tabIndex={isMobile ? 0 : -1}
      >
        {/* Title and status row */}
        <div className="flex-1 flex flex-col items-start gap-y-1 min-w-0">
          <span className="font-medium truncate text-neutral-200">
            {requirementKey.replace(/([A-Z])/g, " $1").trim()}
          </span>
          <span className="text-neutral-500 font-mono text-xs">
            {(() => {
              const creditInfo = calculateCategoryCredits(requirementKey);
              const adjustments: string[] = [];

              if (creditInfo.ethicsDeduction > 0) {
                adjustments.push(`-${creditInfo.ethicsDeduction} ethics`);
              }
              if (creditInfo.ethicsAddition > 0) {
                adjustments.push(`+${creditInfo.ethicsAddition} ethics`);
              }
              if (creditInfo.transferDeductions > 0) {
                adjustments.push(`-${creditInfo.transferDeductions} transfer`);
              }
              if (creditInfo.transferAdditions > 0) {
                adjustments.push(`+${creditInfo.transferAdditions} transfer`);
              }

              const baseText = `${creditInfo.netCredits} / ${requirement.credits} cr`;
              return adjustments.length > 0
                ? `${baseText} (${adjustments.join(", ")})`
                : baseText;
            })()}
          </span>
        </div>
        {/* Transfer Credits Button */}
        <CreditTransferModal
          requirements={requirements}
          coursePlan={coursePlan}
          calculateCategoryCredits={calculateCategoryCredits}
          onTransferCredits={onTransferCredits}
          existingTransfers={creditTransfers}
          sourceRequirement={requirementKey}
        >
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 opacity-60 group-hover:opacity-100 transition-opacity text-neutral-400 hover:bg-white/[0.06]"
            onClick={(e) => e.stopPropagation()}
            title="Transfer credits from this requirement"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </CreditTransferModal>
        {/* Chevron for mobile */}
        <span className="ml-2 md:hidden text-neutral-600">
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
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
      {/* Collapsible content */}
      <div
        id={`requirement-content-${requirementKey}`}
        className={`px-4 pb-4 transition-all duration-300 overflow-hidden ${expanded ? "block" : "hidden"} md:block`}
      >
        <Progress
          value={calculateRequirementProgress(requirementKey)}
          className="h-1.5 bg-white/[0.06] mb-3"
        />
        <p className="text-neutral-600 text-xs opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto group-hover:mt-2 transition-all duration-300 overflow-hidden">
          {requirement.description}
        </p>

        {/* Credit Transfer Information */}
        {creditTransfers.some(
          (t) =>
            t.fromCategory === requirementKey ||
            t.toCategory === requirementKey,
        ) && (
          <div className="mt-3 space-y-1">
            {creditTransfers
              .filter(
                (t) =>
                  t.fromCategory === requirementKey ||
                  t.toCategory === requirementKey,
              )
              .map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center gap-2 text-xs bg-white/[0.03] text-neutral-400 border border-white/[0.06] font-mono px-2 py-1 rounded"
                >
                  {transfer.fromCategory === requirementKey ? (
                    <>
                      <ArrowRightLeft className="h-3 w-3" />
                      <span>
                        -{transfer.amount} cr to{" "}
                        {transfer.toCategory.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-3 w-3" />
                      <span>
                        +{transfer.amount} cr from{" "}
                        {transfer.fromCategory
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                      </span>
                    </>
                  )}
                </div>
              ))}
          </div>
        )}
        {/* Selected Courses for this category */}
        {(coursePlan[requirementKey] || []).length > 0 && (
          <div className="mt-2 space-y-1">
            {coursePlan[requirementKey].map((course) => (
              <div
                key={course.id}
                className={`flex justify-between items-start text-sm p-2 rounded-lg ${
                  selectedEthicsCourse && selectedEthicsCourse.id === course.id
                    ? "bg-blue-500/[0.06] border border-blue-500/20"
                    : selectedAnchorCourse &&
                        selectedAnchorCourse.id === course.id
                      ? "bg-purple-500/[0.06] border border-purple-500/20"
                      : "bg-white/[0.03]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-normal text-sm ${
                      selectedEthicsCourse &&
                      selectedEthicsCourse.id === course.id
                        ? "text-blue-400"
                        : selectedAnchorCourse &&
                            selectedAnchorCourse.id === course.id
                          ? "text-purple-400"
                          : "text-neutral-200"
                    }`}
                  >
                    {course.code}
                    {selectedEthicsCourse &&
                      selectedEthicsCourse.id === course.id &&
                      " (Ethics)"}
                    {selectedAnchorCourse &&
                      selectedAnchorCourse.id === course.id &&
                      " (Anchor Course)"}
                  </div>
                  <div
                    className={`text-xs ${
                      selectedEthicsCourse &&
                      selectedEthicsCourse.id === course.id
                        ? "text-blue-400/70"
                        : selectedAnchorCourse &&
                            selectedAnchorCourse.id === course.id
                          ? "text-purple-400/70"
                          : "text-neutral-500"
                    }`}
                  >
                    {course.name}
                    {selectedEthicsCourse &&
                      selectedEthicsCourse.id === course.id &&
                      " - fulfills ethics requirement"}
                    {selectedAnchorCourse &&
                      selectedAnchorCourse.id === course.id &&
                      " - anchor course for INFO 5920"}
                  </div>
                </div>
                <div
                  className={`ml-2 font-normal text-sm ${
                    selectedEthicsCourse &&
                    selectedEthicsCourse.id === course.id
                      ? "text-blue-400"
                      : selectedAnchorCourse &&
                          selectedAnchorCourse.id === course.id
                        ? "text-purple-400"
                        : "text-neutral-200"
                  }`}
                >
                  {course.credits} cr
                  {selectedEthicsCourse &&
                    selectedEthicsCourse.id === course.id &&
                    " (-1)"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ethics Credit Addition Card for JacobsTechnicalCore */}
        {requirementKey === "JacobsTechnicalCore" &&
          userProgram &&
          ["ms-is-cm", "ms-is-ht", "ms-is-ut"].includes(userProgram) &&
          selectedEthicsCourse && (
            <div className="mt-2">
              <div className="flex justify-between items-start text-sm p-2 rounded-lg bg-green-500/[0.06] border border-green-500/20">
                <div className="flex-1 min-w-0">
                  <div className="font-normal text-sm text-green-400">
                    Ethics Credit Transfer
                  </div>
                  <div className="text-xs text-green-400/70">
                    1 credit from {selectedEthicsCourse.code} ethics requirement
                  </div>
                </div>
                <div className="ml-2 font-normal text-sm text-green-400">
                  +1 cr
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
