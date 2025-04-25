import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function HousingPage() {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                    Discussions
                </h2>
                <Link href="/forum/create">
                    <Button className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        <span>New Thread</span>
                    </Button>
                </Link>
            </div>
            <Link href="/forum/create">
                <Button className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create New Thread</span>
                </Button>
            </Link>
        </div>
    );
}
