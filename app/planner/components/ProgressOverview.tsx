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
    <div className="border border-subtle p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-t1 font-mono">Overall Progress</h2>
          <span className="font-mono text-sm text-t3">
            {totalCredits} / {requiredCredits} credits
          </span>
        </div>
        <Progress value={overallProgress} className="h-2 bg-surface-active" />
      </div>
    </div>
  );
}
