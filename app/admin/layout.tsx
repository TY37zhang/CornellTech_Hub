import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard - Cornell Tech Hub",
    description: "Administrative interface for Cornell Tech Hub",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}