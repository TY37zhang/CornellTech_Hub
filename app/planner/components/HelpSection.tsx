"use client";

import { BookOpen, X, HelpCircle } from "lucide-react";

interface HelpSectionProps {
  showHelp: boolean;
  showHelpModal: boolean;
  onToggleHelp: (val: boolean) => void;
  onToggleHelpModal: (val: boolean) => void;
}

export default function HelpSection({
  showHelp,
  showHelpModal,
  onToggleHelp,
  onToggleHelpModal,
}: HelpSectionProps) {
  return (
    <>
      {/* Help Icon Floating Button (when help is hidden) */}
      {!showHelp && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-cta text-cta hover:bg-cta-hover rounded-none p-3 shadow-lg transition-colors"
          aria-label="Show How to Use the Planner"
          onClick={() => onToggleHelpModal(true)}
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      )}

      {/* Modal Popup for Help */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-2xl mx-4 p-6 border border-subtle bg-surface rounded-none shadow-xl">
            <button
              className="absolute top-4 right-4 text-t3 hover:text-t1 transition-colors"
              aria-label="Close How to Use the Planner"
              onClick={() => onToggleHelpModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="pb-0">
              <h2 className="flex items-center gap-2 justify-center text-center w-full text-t1 font-mono text-lg">
                <BookOpen className="h-5 w-5 text-t2" />
                How to Use the Planner
              </h2>
            </div>
            <div className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div className="space-y-2">
                  <h3 className="text-t2 font-mono text-sm">Getting Started</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-t3">
                    <li>
                      Select your program in the <b>settings</b> page
                    </li>
                    <li>
                      Use the course search to find and add courses to your plan
                    </li>
                    <li>
                      Assign courses to specific requirements using the dropdown
                      menu on the right
                    </li>
                    <li>
                      Track your progress through the progress bars and credit
                      counters
                    </li>
                    <li>
                      Add your courses to the Course Schedule section to plan
                      your weekly timetable
                    </li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <h3 className="text-t2 font-mono text-sm">Tips & Tricks</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-t3">
                    <li>
                      Hover over requirement sections to see detailed
                      descriptions
                    </li>
                    <li>Use the search bar to quickly find specific courses</li>
                    <li>
                      Mark courses as &quot;taken&quot; if you&apos;ve already
                      completed them
                    </li>
                    <li>
                      Selected Courses and Course Schedule are collapsible
                    </li>
                    <li>
                      Your plan will be automatically saved as you make changes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Help Section (hidable) */}
      {showHelp && !showHelpModal && (
        <div className="relative p-6 border border-subtle bg-surface rounded-none">
          <button
            className="absolute top-4 right-4 text-t3 hover:text-t1 transition-colors"
            aria-label="Hide How to Use the Planner"
            onClick={() => onToggleHelp(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="pb-0">
            <h2 className="flex items-center gap-2 justify-center text-center w-full text-t1 font-mono text-lg">
              <BookOpen className="h-5 w-5 text-t2" />
              How to Use the Planner
            </h2>
          </div>
          <div className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="space-y-2">
                <h3 className="text-t2 font-mono text-sm">Getting Started</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-t3">
                  <li>
                    Select your program from the{" "}
                    <b>dropdown menu in the settings page</b>
                  </li>
                  <li>
                    Use the course search to find and add courses to your plan
                  </li>
                  <li>
                    Assign courses to specific requirements using the dropdown
                    menu on the right
                  </li>
                  <li>
                    Track your progress through the progress bars and credit
                    counters
                  </li>
                  <li>
                    Add your courses to the Course Schedule section to plan your
                    weekly timetable
                  </li>
                </ol>
              </div>
              <div className="space-y-2">
                <h3 className="text-t2 font-mono text-sm">Tips & Tricks</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-t3">
                  <li>
                    Hover over requirement sections to see detailed descriptions
                  </li>
                  <li>Use the search bar to quickly find specific courses</li>
                  <li>
                    Mark courses as &quot;taken&quot; if you&apos;ve already
                    completed them
                  </li>
                  <li>Selected Courses and Course Schedule are collapsible</li>
                  <li>
                    Your plan will be automatically saved as you make changes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
