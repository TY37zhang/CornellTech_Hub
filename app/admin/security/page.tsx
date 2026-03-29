"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Globe,
  ArrowLeft,
  Key,
  TestTube,
} from "lucide-react";
import Link from "next/link";

interface SecurityStats {
  totalEvents: number;
  last24Hours: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  topEndpoints: Array<{ endpoint: string; count: number }>;
  suspiciousIPs: Array<{ ip: string; events: number; lastSeen: string }>;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: "pass" | "warn" | "fail";
      duration: number;
      message?: string;
    };
    environment: {
      status: "pass" | "warn" | "fail";
      duration: number;
      message?: string;
    };
    security: {
      status: "pass" | "warn" | "fail";
      duration: number;
      message?: string;
    };
    services: {
      status: "pass" | "warn" | "fail";
      duration: number;
      message?: string;
    };
  };
}

export default function SecurityDashboard() {
  const { data: session, status } = useSession();
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(
    null,
  );
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch security stats
      const securityResponse = await fetch("/api/security/monitor");
      if (securityResponse.ok) {
        const securityData = await securityResponse.json();
        setSecurityStats(securityData);
      } else if (securityResponse.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (securityResponse.status === 401) {
        setError("Please sign in to access the admin dashboard.");
      } else {
        setError("Failed to load security data");
      }

      // Fetch health status
      const healthResponse = await fetch("/api/health");
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthStatus(healthData);
      }

      // Update last refreshed timestamp
      setLastUpdated(new Date());
    } catch (err) {
      setError("Network error occurred");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Are you sure you want to clear all security logs?")) return;

    try {
      const response = await fetch("/api/security/monitor", {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchData(); // Refresh data
        alert("Security logs cleared successfully");
      } else {
        alert("Failed to clear logs");
      }
    } catch (err) {
      alert("Error clearing logs");
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("Please sign in to access the admin dashboard");
      setLoading(false);
      return;
    }
    fetchData();
  }, [status]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "pass":
        return "text-green-600";
      case "warn":
        return "text-yellow-600";
      case "fail":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[980px] px-6 py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {status === "unauthenticated" && (
          <div className="mt-4">
            <Button onClick={() => (window.location.href = "/auth/signin")}>
              Sign In
            </Button>
          </div>
        )}
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
                Back to Admin
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security & System Health
          </h1>
          <p className="text-muted-foreground">
            Real-time security monitoring, system health, and administrative
            tools
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last refresh: {lastUpdated.toLocaleTimeString()}
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={clearLogs} variant="destructive">
              Clear Logs
            </Button>
          </div>
        </div>
      </div>

      {/* System Health */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Overall system status: {healthStatus.environment} environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(healthStatus.checks).map(([check, data]) => (
                <div key={check} className="text-center">
                  <div
                    className={`text-lg font-semibold ${getHealthColor(data.status)}`}
                  >
                    {data.status.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {check}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {data.duration}ms
                  </div>
                </div>
              ))}
            </div>
            <Badge
              variant={
                healthStatus.status === "healthy" ? "default" : "destructive"
              }
              className="mt-4"
            >
              {healthStatus.status}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Security Overview */}
      {securityStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {securityStats.totalEvents}
                </div>
                <p className="text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Last 24 Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {securityStats.last24Hours.total}
                </div>
                <p className="text-muted-foreground">Recent events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suspicious IPs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {securityStats.suspiciousIPs.length}
                </div>
                <p className="text-muted-foreground">Under monitoring</p>
              </CardContent>
            </Card>
          </div>

          {/* Event Types */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Type (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(securityStats.last24Hours.byType).map(
                  ([type, count]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center p-3 border rounded"
                    >
                      <span className="capitalize">
                        {type.replace("_", " ")}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Severity */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Severity (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(securityStats.last24Hours.bySeverity).map(
                  ([severity, count]) => (
                    <div
                      key={severity}
                      className="flex justify-between items-center p-3 border rounded"
                    >
                      <span className="capitalize">{severity}</span>
                      <Badge className={getSeverityColor(severity)}>
                        {count}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top Endpoints (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityStats.topEndpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <code className="text-sm">{endpoint.endpoint}</code>
                    <Badge variant="outline">{endpoint.count} events</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suspicious IPs */}
          {securityStats.suspiciousIPs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Suspicious Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {securityStats.suspiciousIPs.map((ip, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <code className="text-sm">{ip.ip}</code>
                        <div className="text-xs text-muted-foreground">
                          Last seen: {new Date(ip.lastSeen).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="destructive">{ip.events} events</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Security Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security Tools
          </CardTitle>
          <CardDescription>
            Administrative security utilities and testing tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="sm">
              <Link
                href="/api/csrf-token"
                target="_blank"
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Get CSRF Token
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                fetch("/api/security/monitor", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: "admin_test",
                    severity: "low",
                    details: {
                      test: true,
                      timestamp: new Date().toISOString(),
                    },
                    endpoint: "/admin/security",
                  }),
                })
                  .then(() => {
                    alert("Test security event logged successfully");
                    fetchData(); // Refresh security stats
                  })
                  .catch(() => alert("Failed to log test event"));
              }}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test Security Event
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Logged in as: {session?.user?.email} | Last updated:{" "}
        {new Date().toLocaleString()}
      </div>
    </div>
  );
}
