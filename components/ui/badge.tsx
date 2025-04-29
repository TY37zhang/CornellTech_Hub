import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                new: "border-transparent bg-[#4bcefa] text-white hover:bg-[#4bcefa]/90",
                hot: "border-transparent bg-[#ff5454] text-white hover:bg-[#ff5454]/90",
                academics:
                    "border-transparent bg-red-100 text-red-800 hover:bg-red-100/90 dark:bg-red-800/20 dark:text-red-400 dark:hover:bg-red-800/30",
                career: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/90 dark:bg-blue-800/20 dark:text-blue-400 dark:hover:bg-blue-800/30",
                "campus life":
                    "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100/90 dark:bg-purple-800/20 dark:text-purple-400 dark:hover:bg-purple-800/30",
                technology:
                    "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100/90 dark:bg-amber-800/20 dark:text-amber-400 dark:hover:bg-amber-800/30",
                events: "border-transparent bg-green-100 text-green-800 hover:bg-green-100/90 dark:bg-green-800/20 dark:text-green-400 dark:hover:bg-green-800/30",
                general:
                    "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100/90 dark:bg-orange-800/20 dark:text-orange-400 dark:hover:bg-orange-800/30",
                tag: "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted/80",
                // Department badges with light styling
                arch: "border-transparent bg-cyan-100 text-cyan-800 hover:bg-cyan-100/90 dark:bg-cyan-800/20 dark:text-cyan-400 dark:hover:bg-cyan-800/30",
                cee: "border-transparent bg-lime-100 text-lime-800 hover:bg-lime-100/90 dark:bg-lime-800/20 dark:text-lime-400 dark:hover:bg-lime-800/30",
                ceee: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/90 dark:bg-blue-800/20 dark:text-blue-400 dark:hover:bg-blue-800/30",
                cmbp: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100/90 dark:bg-emerald-800/20 dark:text-emerald-400 dark:hover:bg-emerald-800/30",
                cmpb: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100/90 dark:bg-amber-800/20 dark:text-amber-400 dark:hover:bg-amber-800/30",
                cs: "border-transparent bg-red-100 text-red-800 hover:bg-red-100/90 dark:bg-red-800/20 dark:text-red-400 dark:hover:bg-red-800/30",
                ctiv: "border-transparent bg-rose-100 text-rose-800 hover:bg-rose-100/90 dark:bg-rose-800/20 dark:text-rose-400 dark:hover:bg-rose-800/30",
                design: "border-transparent bg-violet-100 text-violet-800 hover:bg-violet-100/90 dark:bg-violet-800/20 dark:text-violet-400 dark:hover:bg-violet-800/30",
                ece: "border-transparent bg-green-100 text-green-800 hover:bg-green-100/90 dark:bg-green-800/20 dark:text-green-400 dark:hover:bg-green-800/30",
                hadm: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/90 dark:bg-yellow-800/20 dark:text-yellow-400 dark:hover:bg-yellow-800/30",
                hbds: "border-transparent bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100/90 dark:bg-fuchsia-800/20 dark:text-fuchsia-400 dark:hover:bg-fuchsia-800/30",
                hinf: "border-transparent bg-sky-100 text-sky-800 hover:bg-sky-100/90 dark:bg-sky-800/20 dark:text-sky-400 dark:hover:bg-sky-800/30",
                hpec: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100/90 dark:bg-amber-800/20 dark:text-amber-400 dark:hover:bg-amber-800/30",
                iamp: "border-transparent bg-rose-100 text-rose-800 hover:bg-rose-100/90 dark:bg-rose-800/20 dark:text-rose-400 dark:hover:bg-rose-800/30",
                info: "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100/90 dark:bg-purple-800/20 dark:text-purple-400 dark:hover:bg-purple-800/30",
                law: "border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-100/90 dark:bg-indigo-800/20 dark:text-indigo-400 dark:hover:bg-indigo-800/30",
                nba: "border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-100/90 dark:bg-indigo-800/20 dark:text-indigo-400 dark:hover:bg-indigo-800/30",
                nbay: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/90 dark:bg-blue-800/20 dark:text-blue-400 dark:hover:bg-blue-800/30",
                orie: "border-transparent bg-pink-100 text-pink-800 hover:bg-pink-100/90 dark:bg-pink-800/20 dark:text-pink-400 dark:hover:bg-pink-800/30",
                pbsb: "border-transparent bg-green-100 text-green-800 hover:bg-green-100/90 dark:bg-green-800/20 dark:text-green-400 dark:hover:bg-green-800/30",
                phar: "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100/90 dark:bg-purple-800/20 dark:text-purple-400 dark:hover:bg-purple-800/30",
                tech: "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100/90 dark:bg-orange-800/20 dark:text-orange-400 dark:hover:bg-orange-800/30",
                techie: "border-transparent bg-teal-100 text-teal-800 hover:bg-teal-100/90 dark:bg-teal-800/20 dark:text-teal-400 dark:hover:bg-teal-800/30",
                tpcm: "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100/90 dark:bg-orange-800/20 dark:text-orange-400 dark:hover:bg-orange-800/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
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
