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
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Globe,
  Server,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAdmin } from "@/lib/roles";

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    database: {
      status: string;
      responseTime: number;
      lastChecked: string;
    };
    api: {
      status: string;
      responseTime: number;
      lastChecked: string;
    };
    auth: {
      status: string;
      responseTime: number;
      lastChecked: string;
    };
  };
}

export default function SystemHealthDashboard() {
  const { data: session, status } = useSession();
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/health");
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching health data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && isAdmin(session?.user)) {
      fetchHealthData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchHealthData, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex items-center gap-2">
          <Activity className="h-5 w-5 animate-spin" />
          Loading system health...
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
            Please sign in with a Cornell email address to access system health.
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
            System health access is restricted to administrators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "ok":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "down":
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "ok":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "degraded":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
        );
      case "down":
      case "error":
        return <Badge className="bg-red-100 text-red-800">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-[980px] px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            System Health Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time system monitoring and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={fetchHealthData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(healthData?.status || "unknown")}
            Overall System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>{getStatusBadge(healthData?.status || "unknown")}</div>
            <div className="text-sm text-muted-foreground">
              {healthData?.timestamp &&
                new Date(healthData.timestamp).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Database
            </CardTitle>
            <CardDescription>PostgreSQL connection status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Status</span>
                {getStatusBadge(
                  healthData?.services?.database?.status || "unknown",
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <span className="text-sm">
                  {healthData?.services?.database?.responseTime || 0}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Checked</span>
                <span className="text-sm text-muted-foreground">
                  {healthData?.services?.database?.lastChecked
                    ? new Date(
                        healthData.services.database.lastChecked,
                      ).toLocaleTimeString()
                    : "Never"}
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
            <CardDescription>REST API endpoints status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Status</span>
                {getStatusBadge(healthData?.services?.api?.status || "unknown")}
              </div>
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <span className="text-sm">
                  {healthData?.services?.api?.responseTime || 0}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Checked</span>
                <span className="text-sm text-muted-foreground">
                  {healthData?.services?.api?.lastChecked
                    ? new Date(
                        healthData.services.api.lastChecked,
                      ).toLocaleTimeString()
                    : "Never"}
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
            <CardDescription>NextAuth.js service status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Status</span>
                {getStatusBadge(
                  healthData?.services?.auth?.status || "unknown",
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <span className="text-sm">
                  {healthData?.services?.auth?.responseTime || 0}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Checked</span>
                <span className="text-sm text-muted-foreground">
                  {healthData?.services?.auth?.lastChecked
                    ? new Date(
                        healthData.services.auth.lastChecked,
                      ).toLocaleTimeString()
                    : "Never"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
