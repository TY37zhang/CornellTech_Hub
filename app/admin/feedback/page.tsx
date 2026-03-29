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
  ArrowLeft,
  MessageSquare,
  Bug,
  User,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAdmin, getFullRoleDisplay } from "@/lib/roles";

interface FeedbackItem {
  id: number;
  user_id: string;
  type: string;
  message: string;
  created_at: string;
  status: string;
  admin_notes?: string;
  read?: boolean;
  users: {
    name: string;
    email: string;
  };
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchFeedback = async () => {
    if (!session || !isAdmin(session?.user)) return;

    try {
      setLoading(true);
      const response = await fetch("/api/admin/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [session]);

  const markAsRead = async (id: number, read: boolean) => {
    if (!session || !isAdmin(session?.user)) return;

    try {
      // Find the current item to check its status
      const currentItem = feedback.find((item) => item.id === id);

      // Prepare the update payload
      const updatePayload: { id: number; read: boolean; status?: string } = {
        id,
        read,
      };

      // If marking as read and current status is pending, change to resolved
      if (read && currentItem?.status === "pending") {
        updatePayload.status = "resolved";
      }

      const response = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        // Update the local state
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  read,
                  status: updatePayload.status || item.status,
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating feedback read status:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      case "in_progress":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    if (filter === "all") return true;
    if (filter === "unread") return !item.read;
    if (filter === "read") return !!item.read;
    return true;
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading admin feedback...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-[980px] px-6 py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in with a Cornell email address to access the admin
            feedback.
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
            Admin access is restricted. Contact the administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
      {/* Mobile-optimized Header */}
      <div className="space-y-3 sm:space-y-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button asChild variant="outline" size="sm" className="flex-shrink-0">
            <Link href="/admin" className="flex items-center gap-1 sm:gap-2">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>

          <Button
            onClick={fetchFeedback}
            variant="outline"
            size="sm"
            disabled={loading}
            className="ml-auto sm:hidden"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="hidden sm:inline">User Feedback</span>
              <span className="sm:hidden">Feedback</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Review and manage user feedback and bug reports
            </p>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-4 mt-3 sm:mt-0">
            <Button
              onClick={fetchFeedback}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <div className="text-sm text-muted-foreground">
              <div className="text-right">
                Logged in as: {session?.user?.email}
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-right">
                Role: {getFullRoleDisplay(session?.user)}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile user info */}
        <div className="sm:hidden text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <div className="font-medium">Logged in as:</div>
          <div className="truncate mt-1">{session?.user?.email}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Role: {getFullRoleDisplay(session?.user)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({feedback.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          <EyeOff className="h-3 w-3 mr-1" />
          Unread ({feedback.filter((f) => !f.read).length})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("read")}
        >
          <Eye className="h-3 w-3 mr-1" />
          Read ({feedback.filter((f) => !!f.read).length})
        </Button>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading feedback...
              </div>
            </CardContent>
          </Card>
        ) : filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                No feedback found for the selected filter.
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item) => (
            <Card
              key={item.id}
              className={`hover:shadow-md transition-shadow ${!item.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.type === "bug" ? "Bug Report" : "Feedback"} #
                        {item.id}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.users.name} ({item.users.email})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(item.id, !item.read)}
                      className="h-8"
                    >
                      {item.read ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Mark Unread
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Mark Read
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Message:</h4>
                    <div className="bg-gray-50 p-3 rounded border text-sm whitespace-pre-wrap">
                      {item.message}
                    </div>
                  </div>
                  {item.admin_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Admin Notes:</h4>
                      <div className="bg-blue-50 p-3 rounded border text-sm">
                        {item.admin_notes}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
