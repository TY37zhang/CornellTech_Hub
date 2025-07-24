import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
                academics:
                    "border-none bg-red-100 text-red-800 hover:bg-red-100/90",
                career: "border-none bg-blue-100 text-blue-800 hover:bg-blue-100/90",
                "campus life":
                    "border-none bg-purple-100 text-purple-800 hover:bg-purple-100/90",
                technology:
                    "border-none bg-amber-100 text-amber-800 hover:bg-amber-100/90",
                events: "border-none bg-green-100 text-green-800 hover:bg-green-100/90",
                general:
                    "border-none bg-orange-100 text-orange-800 hover:bg-orange-100/90",
                tag: "border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200",
                // Department badges with light styling
                arch: "border-none bg-cyan-100 text-cyan-800 hover:bg-cyan-100/90",
                cee: "border-none bg-lime-100 text-lime-800 hover:bg-lime-100/90",
                ceee: "border-none bg-blue-100 text-blue-800 hover:bg-blue-100/90",
                cmbp: "border-none bg-emerald-100 text-emerald-800 hover:bg-emerald-100/90",
                cmpb: "border-none bg-amber-100 text-amber-800 hover:bg-amber-100/90",
                cs: "border-none bg-red-100 text-red-900 hover:bg-red-200",
                ctiv: "border-none bg-rose-100 text-rose-800 hover:bg-rose-100/90",
                design: "border-none bg-violet-100 text-violet-800 hover:bg-violet-100/90",
                ece: "border-none bg-green-100 text-green-900 hover:bg-green-200",
                hadm: "border-none bg-yellow-100 text-yellow-800 hover:bg-yellow-100/90",
                hbds: "border-none bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100/90",
                hinf: "border-none bg-sky-100 text-sky-800 hover:bg-sky-100/90",
                hpec: "border-none bg-amber-100 text-amber-800 hover:bg-amber-100/90",
                iamp: "border-none bg-rose-100 text-rose-800 hover:bg-rose-100/90",
                info: "border-none bg-purple-100 text-purple-900 hover:bg-purple-200",
                law: "border-none bg-indigo-100 text-indigo-800 hover:bg-indigo-100/90",
                nba: "border-none bg-indigo-100 text-indigo-800 hover:bg-indigo-100/90",
                nbay: "border-none bg-blue-100 text-blue-800 hover:bg-blue-100/90",
                orie: "border-none bg-pink-100 text-pink-900 hover:bg-pink-200",
                pbsb: "border-none bg-green-100 text-green-800 hover:bg-green-100/90",
                phar: "border-none bg-purple-100 text-purple-800 hover:bg-purple-100/90",
                tech: "border-none bg-amber-100 text-amber-900 hover:bg-amber-200",
                techie: "border-none bg-teal-100 text-teal-900 hover:bg-teal-200",
                tpcm: "border-none bg-orange-100 text-orange-800 hover:bg-orange-100/90",
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
