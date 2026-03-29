"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressOverviewProps {
  totalCredits: number;
  requiredCredits: number;
  overallProgress: number;
}

export default function ProgressOverview({
  totalCredits,
  requiredCredits,
  overallProgress,
}: ProgressOverviewProps) {
  return (
    <div className="border border-white/[0.06] p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-neutral-200 font-mono">
            Overall Progress
          </h2>
          <span className="font-mono text-sm text-neutral-500">
            {totalCredits} / {requiredCredits} credits
          </span>
        </div>
        <Progress value={overallProgress} className="h-2 bg-white/[0.06]" />
      </div>
    </div>
  );
}
