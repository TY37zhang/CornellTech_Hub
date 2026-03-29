import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-none bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-none bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-none bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        new: "border-none bg-[#4bcefa] text-white hover:bg-[#4bcefa]/90",
        hot: "border-none bg-[#ff5454] text-white hover:bg-[#ff5454]/90",
        academics: "border-none bg-red-500/10 text-red-400 hover:bg-red-500/15",
        career: "border-none bg-blue-500/10 text-blue-400 hover:bg-blue-500/15",
        "campus life":
          "border-none bg-purple-500/10 text-purple-400 hover:bg-purple-500/15",
        technology:
          "border-none bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
        events:
          "border-none bg-green-500/10 text-green-400 hover:bg-green-500/15",
        general:
          "border-none bg-orange-500/10 text-orange-400 hover:bg-orange-500/15",
        tag: "border border-strong bg-surface-active text-t2 hover:bg-surface-active",
        // Department badges with dark styling
        arch: "border-none bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/15",
        cee: "border-none bg-lime-500/10 text-lime-400 hover:bg-lime-500/15",
        ceee: "border-none bg-blue-500/10 text-blue-400 hover:bg-blue-500/15",
        cmbp: "border-none bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15",
        cmpb: "border-none bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
        cs: "border-none bg-red-500/10 text-red-400 hover:bg-red-500/15",
        ctiv: "border-none bg-rose-500/10 text-rose-400 hover:bg-rose-500/15",
        design:
          "border-none bg-violet-500/10 text-violet-400 hover:bg-violet-500/15",
        ece: "border-none bg-green-500/10 text-green-400 hover:bg-green-500/15",
        hadm: "border-none bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/15",
        hbds: "border-none bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/15",
        hinf: "border-none bg-sky-500/10 text-sky-400 hover:bg-sky-500/15",
        hpec: "border-none bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
        iamp: "border-none bg-rose-500/10 text-rose-400 hover:bg-rose-500/15",
        info: "border-none bg-purple-500/10 text-purple-400 hover:bg-purple-500/15",
        law: "border-none bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15",
        nba: "border-none bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15",
        nbay: "border-none bg-blue-500/10 text-blue-400 hover:bg-blue-500/15",
        orie: "border-none bg-pink-500/10 text-pink-400 hover:bg-pink-500/15",
        pbsb: "border-none bg-green-500/10 text-green-400 hover:bg-green-500/15",
        phar: "border-none bg-purple-500/10 text-purple-400 hover:bg-purple-500/15",
        tech: "border-none bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
        techie: "border-none bg-teal-500/10 text-teal-400 hover:bg-teal-500/15",
        tpcm: "border-none bg-orange-500/10 text-orange-400 hover:bg-orange-500/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
