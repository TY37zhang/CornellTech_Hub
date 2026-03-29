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
  Database,
  AlertTriangle,
  Activity,
  RefreshCw,
  ArrowLeft,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  Flag,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAdmin } from "@/lib/roles";

interface DatabaseStats {
  tables: {
    users: number;
    forum_posts: number;
    forum_comments: number;
    course_reviews: number;
    course_planner: number;
    course_schedules: number;
    feedback: number;
    reports: number;
  };
  connections: {
    active: number;
    max: number;
    idle: number;
  };
  performance: {
    avgQueryTime: number;
    slowQueries: number;
    cacheHitRatio: number;
  };
  storage: {
    totalSize: string;
    indexSize: string;
    dataSize: string;
  };
}

export default function DatabaseManagement() {
  const { data: session, status } = useSession();
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/database/stats");
      if (response.ok) {
        const data = await response.json();
        setDbStats(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching database stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && isAdmin(session?.user)) {
      fetchDatabaseStats();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex items-center gap-2">
          <Database className="h-5 w-5 animate-spin" />
          Loading database management...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-[980px] px-6 py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in with a Cornell email address to access database
            management.
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
      <div className="mx-auto max-w-[980px] px-6 py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Database management access is restricted to administrators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Management
          </h1>
          <p className="text-muted-foreground">
            Database performance metrics, statistics, and maintenance tools
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={fetchDatabaseStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                PostgreSQL database hosted on Neon
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium">Neon Database</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Table Statistics</CardTitle>
          <CardDescription>Record counts for major tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Users</p>
                  <p className="text-sm text-muted-foreground">
                    Total accounts
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {dbStats?.tables?.users || "---"}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Forum Posts</p>
                  <p className="text-sm text-muted-foreground">
                    Community posts
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {dbStats?.tables?.forum_posts || "---"}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Comments</p>
                  <p className="text-sm text-muted-foreground">
                    Forum comments
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {dbStats?.tables?.forum_comments || "---"}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Course Reviews</p>
                  <p className="text-sm text-muted-foreground">
                    Student reviews
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {dbStats?.tables?.course_reviews || "---"}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium">Planner Entries</p>
                  <p className="text-sm text-muted-foreground">
                    Course planning records
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {dbStats?.tables?.course_planner || "---"}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-cyan-600" />
                <div>
                  <p className="font-medium">Course Schedules</p>
                  <p className="text-sm text-muted-foreground">
                    Schedule entries
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {dbStats?.tables?.course_schedules || "---"}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Feedback</p>
                  <p className="text-sm text-muted-foreground">
                    User feedback submissions
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {dbStats?.tables?.feedback || "---"}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Flag className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Content moderation reports
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {dbStats?.tables?.reports || "---"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Average Query Time</span>
              <Badge variant="outline">
                {dbStats?.performance?.avgQueryTime || "---"}ms
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Slow Queries</span>
              <Badge variant="outline">
                {dbStats?.performance?.slowQueries || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Cache Hit Ratio</span>
              <Badge variant="outline">
                {dbStats?.performance?.cacheHitRatio || "---"}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Connection Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Active Connections</span>
              <Badge variant="outline">
                {dbStats?.connections?.active || "---"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Idle Connections</span>
              <Badge variant="outline">
                {dbStats?.connections?.idle || "---"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Max Connections</span>
              <Badge variant="outline">
                {dbStats?.connections?.max || "---"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
