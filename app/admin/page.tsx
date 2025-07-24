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
import {
    Shield,
    Activity,
    Users,
    Settings,
    Database,
    AlertTriangle,
    TrendingUp,
    MessageSquare,
    Star,
    RefreshCw,
    CheckCircle,
    XCircle,
    Flag,
    Globe,
    Server,
    Reply,
    AlertOctagon,
    MessageCircle,
    BookOpen,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAdmin, getFullRoleDisplay } from "@/lib/roles";

interface AdminStats {
    database: {
        tables: {
            users: number;
            forum_posts: number;
            forum_comments: number;
            course_reviews: number;
            course_planner?: number;
            course_schedules?: number;
            feedback?: number;
            reports: number;
            review_replies?: number;
            courses: number;
        };
    };
    health: {
        status: string;
        services: {
            database: { status: string; responseTime: number };
            api: { status: string; responseTime: number };
            auth: { status: string; responseTime: number };
        };
    };
    onlineUsers: number;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchAdminStats = async () => {
        if (!session || !isAdmin(session?.user)) return;

        try {
            setLoading(true);

            // Fetch all stats in parallel
            const [databaseRes, healthRes, onlineUsersRes] = await Promise.all([
                fetch("/api/admin/database/stats"),
                fetch("/api/admin/health"),
                fetch("/api/admin/online-users"),
            ]);

            const [databaseData, healthData, onlineUsersData] =
                await Promise.all([
                    databaseRes.ok ? databaseRes.json() : null,
                    healthRes.ok ? healthRes.json() : null,
                    onlineUsersRes.ok ? onlineUsersRes.json() : null,
                ]);

            if (databaseData && healthData && onlineUsersData) {
                setStats({
                    database: {
                        tables: databaseData.tables,
                    },
                    health: {
                        status: healthData.status,
                        services: healthData.services,
                    },
                    onlineUsers: onlineUsersData.onlineUsers || 0,
                });
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminStats();
        // Auto-refresh every 2 minutes
        const interval = setInterval(fetchAdminStats, 120000);
        return () => clearInterval(interval);
    }, [session]);

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case "healthy":
            case "ok":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "degraded":
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case "down":
            case "error":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "healthy":
            case "ok":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 font-medium"
                    >
                        Healthy
                    </Badge>
                );
            case "degraded":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium"
                    >
                        Degraded
                    </Badge>
                );
            case "down":
            case "error":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 font-medium"
                    >
                        Down
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="font-medium">
                        Unknown
                    </Badge>
                );
        }
    };

    const formatUptime = (uptimeHours: number) => {
        const days = Math.floor(uptimeHours / 24);
        const hours = Math.floor(uptimeHours % 24);
        if (days > 0) {
            return `${days}d ${hours}h`;
        } else {
            return `${hours}h`;
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse">Loading admin dashboard...</div>
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
                        the admin dashboard.
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
                        Admin access is restricted. Contact the administrator
                        for access.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-hidden">
            {/* Mobile-optimized header */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
                        <span className="hidden sm:inline">Admin Dashboard</span>
                        <span className="sm:hidden">Admin</span>
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Cornell Tech Hub Administration
                    </p>
                </div>
                
                {/* Mobile-first action bar */}
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center justify-between sm:items-center sm:gap-3">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                        <Button
                            onClick={fetchAdminStats}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            className="ml-2 sm:ml-0"
                        >
                            <RefreshCw
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}${loading ? "" : " mr-1 sm:mr-2"}`}
                            />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>
                    
                    {/* User info - collapsible on mobile */}
                    <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 p-2 rounded-md sm:bg-transparent sm:p-0">
                        <div className="sm:text-right">
                            <span className="font-medium">Logged in as:</span>
                            <div className="truncate mt-1 sm:mt-0 sm:inline sm:ml-1">
                                {session?.user?.email}
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 sm:text-right">
                            Role: {getFullRoleDisplay(session?.user)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile-optimized Admin Actions */}
            <Card className="shadow-sm border-l-4 border-l-purple-500">
                <div className="p-3 sm:px-6 sm:py-4">
                    <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                            <span className="font-medium text-sm sm:text-base sm:font-semibold">Quick Actions</span>
                        </div>
                        
                        {/* Mobile: Single row layout */}
                        <div className="flex flex-row gap-1 sm:gap-3">
                            <Button asChild variant="ghost" size="sm" className="h-8 sm:h-9 flex-1 sm:flex-none justify-center px-1 py-1 sm:px-3 sm:py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                <Link href="/admin/users" className="flex items-center gap-1 sm:gap-2">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                    <span className="font-medium text-xs sm:text-sm">Users</span>
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="h-8 sm:h-9 flex-1 sm:flex-none justify-center px-1 py-1 sm:px-3 sm:py-2 hover:bg-green-50 hover:text-green-700 transition-colors">
                                <Link href="/admin/moderation" className="flex items-center gap-1 sm:gap-2">
                                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                    <span className="font-medium text-xs sm:text-sm">Moderation</span>
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="h-8 sm:h-9 flex-1 sm:flex-none justify-center px-1 py-1 sm:px-3 sm:py-2 hover:bg-pink-50 hover:text-pink-700 transition-colors">
                                <Link href="/admin/feedback" className="flex items-center gap-1 sm:gap-2">
                                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600" />
                                    <span className="font-medium text-xs sm:text-sm">Feedback</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Admin Statistics Dashboard */}
            {stats && (
                <>
                    {/* Mobile-optimized Statistics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Total Users
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.users.toLocaleString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Online Users
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.onlineUsers.toLocaleString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            User Reports
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.reports.toLocaleString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            User Feedback
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.feedback?.toLocaleString() || 0}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Forum & Activity Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Forum Posts
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.forum_posts.toLocaleString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Comments
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.forum_comments.toLocaleString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Course Planner
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.course_planner?.toLocaleString() || 0}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Course Schedules
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.course_schedules?.toLocaleString() || 0}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Course & Content Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Total Courses
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.courses.toLocaleString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Course Reviews
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.course_reviews.toLocaleString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="px-3 pt-4 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <Reply className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                                            Review Replies
                                        </span>
                                    </div>
                                    <div className="text-lg sm:text-2xl font-bold tracking-tight">
                                        {stats.database.tables.review_replies?.toLocaleString() || 0}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mobile-optimized Services Health */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5 text-blue-600" />
                                    Database
                                </CardTitle>
                                <CardDescription>
                                    PostgreSQL connection status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span>Status</span>
                                        {getStatusBadge(
                                            stats.health.services.database
                                                .status
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Response Time</span>
                                        <span className="text-sm">
                                            {
                                                stats.health.services.database
                                                    .responseTime
                                            }
                                            ms
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-green-600" />
                                    API
                                </CardTitle>
                                <CardDescription>
                                    REST API endpoints status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span>Status</span>
                                        {getStatusBadge(
                                            stats.health.services.api.status
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Response Time</span>
                                        <span className="text-sm">
                                            {
                                                stats.health.services.api
                                                    .responseTime
                                            }
                                            ms
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Server className="h-5 w-5 text-purple-600" />
                                    Authentication
                                </CardTitle>
                                <CardDescription>
                                    NextAuth.js service status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span>Status</span>
                                        {getStatusBadge(
                                            stats.health.services.auth.status
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Response Time</span>
                                        <span className="text-sm">
                                            {
                                                stats.health.services.auth
                                                    .responseTime
                                            }
                                            ms
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </>
            )}

            {loading && !stats && (
                <Card>
                    <CardContent className="p-12">
                        <div className="flex items-center justify-center">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            Loading dashboard statistics...
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
