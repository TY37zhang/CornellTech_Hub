"use client";

import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoBannerProps {
  isDemoMode: boolean;
  showDemoBanner: boolean;
  onHideBanner: () => void;
  onResetDemo: () => void;
  onSignIn: () => void;
}

export default function DemoBanner({
  isDemoMode,
  showDemoBanner,
  onHideBanner,
  onResetDemo,
  onSignIn,
}: DemoBannerProps) {
  if (!isDemoMode || !showDemoBanner) {
    return null;
  }

  return (
    <div className="bg-surface-hover border-b border-subtle text-t1">
      <div className="mx-auto max-w-[980px] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-surface-active p-2 flex-shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-t1 font-mono text-lg">
                You're viewing the Course Planner in Demo Mode
              </h3>
              <p className="text-t3 font-mono text-sm">
                Explore all features with sample data. Your changes are saved
                locally.
                <span className="font-medium">
                  {" "}
                  Create an account to save your real course plan!
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={onResetDemo}
              className="bg-surface-active text-t2 hover:bg-surface-active border-strong rounded-none font-mono"
            >
              Reset Demo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onSignIn}
              className="bg-cta text-cta hover:bg-cta-hover rounded-none font-mono"
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onHideBanner}
              className="text-t3 hover:text-t1 hover:bg-surface-active"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
