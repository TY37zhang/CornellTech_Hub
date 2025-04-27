import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
    return (
        <div className="container flex flex-col items-center justify-center min-h-[80vh] py-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
                Coming Soon
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
                This feature is currently under development and will be
                available soon.
            </p>
            <Link href="/">
                <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </Link>
        </div>
    );
}
