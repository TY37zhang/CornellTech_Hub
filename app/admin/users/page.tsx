"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    AlertTriangle,
    Search,
    UserCog,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAdmin, getRoleDisplayName, getFullRoleDisplay } from "@/lib/roles";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    is_admin: boolean;
    is_mod: boolean;
    program: string | null;
    created_at: string;
}

export default function UserManagement() {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        if (session && isAdmin(session?.user)) {
            fetchUsers();
        }
    }, [session]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, sortBy, sortOrder]);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const response = await fetch("/api/admin/users/role", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (response.ok) {
                // Refresh users list
                fetchUsers();
            } else {
                alert("Failed to update user role");
            }
        } catch (error) {
            console.error("Error updating user role:", error);
            alert("Error updating user role");
        }
    };

    const updateUserElevation = async (
        userId: string,
        elevationType: "is_admin" | "is_mod",
        value: boolean
    ) => {
        try {
            const response = await fetch("/api/admin/users/role", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, [elevationType]: value }),
            });

            if (response.ok) {
                // Refresh users list
                fetchUsers();
            } else {
                const error = await response.json();
                alert(error.error || "Failed to update user elevation");
            }
        } catch (error) {
            console.error("Error updating user elevation:", error);
            alert("Error updating user elevation");
        }
    };

    const handleSort = (newSortBy: string) => {
        if (sortBy === newSortBy) {
            // Toggle sort order if same field
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // New field, default to ascending
            setSortBy(newSortBy);
            setSortOrder("asc");
        }
    };

    const sortUsers = (users: User[]) => {
        return [...users].sort((a, b) => {
            let aValue: any = a[sortBy as keyof User];
            let bValue: any = b[sortBy as keyof User];

            // Handle null values
            if (aValue === null) aValue = "";
            if (bValue === null) bValue = "";

            // Handle dates
            if (sortBy === "created_at") {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            // Handle strings (case insensitive)
            if (typeof aValue === "string") {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            let comparison = 0;
            if (aValue < bValue) {
                comparison = -1;
            } else if (aValue > bValue) {
                comparison = 1;
            }

            return sortOrder === "desc" ? -comparison : comparison;
        });
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse">Loading user management...</div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="container mx-auto p-6">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Please sign in with a Cornell email address to access
                        user management.
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button asChild>
                        <Link href="/auth/signin">Sign In</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (!isAdmin(session?.user)) {
        return (
            <div className="container mx-auto p-6">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        User management access is restricted to administrators
                        only.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Filter and sort users
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole =
            roleFilter === "all" ||
            user.role === roleFilter ||
            (roleFilter === "admin" && user.is_admin) ||
            (roleFilter === "mod" && user.is_mod);
        return matchesSearch && matchesRole;
    });

    const sortedUsers = sortUsers(filteredUsers);

    // Pagination logic
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = sortedUsers.slice(startIndex, endIndex);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href="/admin"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="h-8 w-8" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage user roles and permissions
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Total Users: {users.length}
                </div>
            </div>

            {/* Filters and Sorting */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters & Sorting</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        {/* Search Bar - Main Width */}
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">
                                Search Users
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 pr-4"
                                />
                            </div>
                        </div>

                        {/* Role Filter - Right Side */}
                        <div className="w-48">
                            <label className="text-sm font-medium mb-2 block">
                                Role Filter
                            </label>
                            <Select
                                value={roleFilter}
                                onValueChange={setRoleFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Roles
                                    </SelectItem>
                                    <SelectItem value="student">
                                        Student
                                    </SelectItem>
                                    <SelectItem value="faculty">
                                        Faculty
                                    </SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="mod">
                                        Moderator
                                    </SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sorting Options */}
                        <div className="w-48">
                            <label className="text-sm font-medium mb-2 block">
                                Sort By
                            </label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="role">Role</SelectItem>
                                    <SelectItem value="program">
                                        Program
                                    </SelectItem>
                                    <SelectItem value="created_at">
                                        Created Date
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Order Button */}
                        <div className="w-auto">
                            <label className="text-sm font-medium mb-2 block">
                                &nbsp;
                            </label>
                            <Button
                                onClick={() =>
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    )
                                }
                                variant="outline"
                                size="sm"
                                className="h-10"
                            >
                                {sortOrder === "asc" ? (
                                    <ArrowUp className="h-4 w-4" />
                                ) : (
                                    <ArrowDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({sortedUsers.length})</CardTitle>
                    <CardDescription>
                        Manage user roles and view user information • Showing{" "}
                        {currentUsers.length} of {sortedUsers.length} users
                        {sortBy && (
                            <span className="ml-2 text-xs">
                                • Sorted by {sortBy.replace("_", " ")} (
                                {sortOrder === "asc"
                                    ? "ascending"
                                    : "descending"}
                                )
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {currentUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {currentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                    {user.program && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Program:{" "}
                                                            {user.program}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {user.role ===
                                                        "student" && (
                                                        <Badge variant="secondary">
                                                            Student
                                                        </Badge>
                                                    )}
                                                    {user.role ===
                                                        "faculty" && (
                                                        <Badge variant="events">
                                                            Faculty
                                                        </Badge>
                                                    )}
                                                    {user.role === "staff" && (
                                                        <Badge variant="phar">
                                                            Staff
                                                        </Badge>
                                                    )}
                                                    {user.is_admin && (
                                                        <Badge variant="destructive">
                                                            Admin
                                                        </Badge>
                                                    )}
                                                    {user.is_mod && (
                                                        <Badge variant="career">
                                                            Moderator
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(newRole) =>
                                                        updateUserRole(
                                                            user.id,
                                                            newRole
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-28">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="student">
                                                            Student
                                                        </SelectItem>
                                                        <SelectItem value="faculty">
                                                            Faculty
                                                        </SelectItem>
                                                        <SelectItem value="staff">
                                                            Staff
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        variant={
                                                            user.is_admin
                                                                ? "destructive"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            updateUserElevation(
                                                                user.id,
                                                                "is_admin",
                                                                !user.is_admin
                                                            )
                                                        }
                                                        className="h-6 px-2 text-xs"
                                                        disabled={
                                                            user.id ===
                                                                session?.user
                                                                    ?.id &&
                                                            user.is_admin
                                                        }
                                                        title={
                                                            user.id ===
                                                                session?.user
                                                                    ?.id &&
                                                            user.is_admin
                                                                ? "Cannot remove your own admin privileges"
                                                                : ""
                                                        }
                                                    >
                                                        Admin
                                                    </Button>
                                                    <Button
                                                        variant={
                                                            user.is_mod
                                                                ? "career"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            updateUserElevation(
                                                                user.id,
                                                                "is_mod",
                                                                !user.is_mod
                                                            )
                                                        }
                                                        className="h-6 px-2 text-xs"
                                                    >
                                                        Mod
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(prev - 1, 1)
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from(
                                                { length: totalPages },
                                                (_, i) => i + 1
                                            )
                                                .filter((page) => {
                                                    return (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(
                                                            page - currentPage
                                                        ) <= 1
                                                    );
                                                })
                                                .map((page, index, array) => (
                                                    <div
                                                        key={page}
                                                        className="flex items-center"
                                                    >
                                                        {index > 0 &&
                                                            array[index - 1] !==
                                                                page - 1 && (
                                                                <span className="px-2 text-muted-foreground">
                                                                    ...
                                                                </span>
                                                            )}
                                                        <Button
                                                            onClick={() =>
                                                                setCurrentPage(
                                                                    page
                                                                )
                                                            }
                                                            variant={
                                                                currentPage ===
                                                                page
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            size="sm"
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {page}
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>

                                        <Button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        prev + 1,
                                                        totalPages
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            variant="outline"
                                            size="sm"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
