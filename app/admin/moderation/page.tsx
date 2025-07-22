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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Shield,
    MessageSquare,
    Star,
    FileText,
    AlertTriangle,
    Users,
    ArrowLeft,
    Eye,
    EyeOff,
    Trash2,
    RotateCcw,
    Flag,
    FlagOff,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Filter,
    History,
    User,
    Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { canModerate, getFullRoleDisplay } from "@/lib/roles";

interface ModerationLog {
    id: string;
    action: string;
    reason: string;
    notes?: string;
    created_at: string;
    users: {
        name: string;
        email: string;
        role: string;
    };
}

interface Report {
    id: string;
    reported_item_type: string;
    reported_item_id: string;
    reason: string;
    description: string;
    status: string;
    created_at: string;
    admin_notes?: string;
    users: {
        name: string;
        email: string;
    };
    contentPreview?: any;
    reportedUser?: any;
    moderationHistory?: ModerationLog[];
}

interface ModerationStats {
    reports: {
        total: number;
        pending: number;
        resolved: number;
        dismissed: number;
    };
    moderation: {
        flaggedContent: number;
        hiddenContent: number;
        deletedContent: number;
    };
}

interface FlaggedContent {
    id: string;
    content?: string;
    title?: string;
    status: string;
    created_at: string;
    moderated_at?: string;
    moderation_reason?: string;
    users: {
        name: string;
        email: string;
    };
}

function FlaggedContentTab() {
    const [flaggedContent, setFlaggedContent] = useState<{
        posts: FlaggedContent[];
        comments: FlaggedContent[];
        reviews: FlaggedContent[];
        replies: FlaggedContent[];
    }>({ posts: [], comments: [], reviews: [], replies: [] });
    const [contentLoading, setContentLoading] = useState(true);
    const [contentTypeFilter, setContentTypeFilter] = useState('all');
    const [contentStatusFilter, setContentStatusFilter] = useState('flagged');

    useEffect(() => {
        fetchFlaggedContent();
    }, [contentTypeFilter, contentStatusFilter]);

    const fetchFlaggedContent = async () => {
        try {
            setContentLoading(true);
            const params = new URLSearchParams({
                status: contentStatusFilter,
                ...(contentTypeFilter !== 'all' && { type: contentTypeFilter }),
            });
            const response = await fetch(`/api/admin/moderation?${params}`);
            if (response.ok) {
                const data = await response.json();
                setFlaggedContent(data);
            }
        } catch (error) {
            console.error('Error fetching flagged content:', error);
        } finally {
            setContentLoading(false);
        }
    };

    const handleContentAction = async (type: string, id: string, action: string, reason: string) => {
        try {
            const response = await fetch('/api/admin/moderation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    targetType: type,
                    targetId: id,
                    reason,
                }),
            });

            if (response.ok) {
                fetchFlaggedContent();
            }
        } catch (error) {
            console.error('Error applying moderation action:', error);
        }
    };

    const renderContentItem = (item: FlaggedContent, type: string) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {type === 'posts' && <MessageSquare className="h-4 w-4" />}
                        {type === 'comments' && <MessageSquare className="h-4 w-4" />}
                        {type === 'reviews' && <Star className="h-4 w-4" />}
                        {type === 'replies' && <FileText className="h-4 w-4" />}
                        <span className="font-medium capitalize">{type.slice(0, -1)}</span>
                        <Badge variant={item.status === 'flagged' ? 'destructive' : item.status === 'hidden' ? 'secondary' : 'outline'}>
                            {item.status}
                        </Badge>
                    </div>
                    {item.title && <h4 className="font-medium mb-1">{item.title}</h4>}
                    <p className="text-sm text-muted-foreground mb-2">
                        {item.content && (item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        By {item.users.name} • {new Date(item.created_at).toLocaleDateString()}
                        {item.moderated_at && ` • Moderated ${new Date(item.moderated_at).toLocaleDateString()}`}
                    </p>
                    {item.moderation_reason && (
                        <p className="text-xs text-orange-600 mt-1">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            {item.moderation_reason}
                        </p>
                    )}
                </div>
                <div className="flex gap-2 ml-4">
                    {item.status === 'flagged' && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleContentAction(type.slice(0, -1), item.id, 'unflag', 'Content approved')}
                            >
                                <FlagOff className="h-3 w-3 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleContentAction(type.slice(0, -1), item.id, 'hide', 'Content hidden for review')}
                            >
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hide
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleContentAction(type.slice(0, -1), item.id, 'delete', 'Content deleted for policy violation')}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                        </>
                    )}
                    {item.status === 'hidden' && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleContentAction(type.slice(0, -1), item.id, 'restore', 'Content restored')}
                            >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restore
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleContentAction(type.slice(0, -1), item.id, 'delete', 'Content permanently deleted')}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                        </>
                    )}
                    {item.status === 'deleted' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContentAction(type.slice(0, -1), item.id, 'restore', 'Content restored from deletion')}
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Filter Controls */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <Label htmlFor="content-type-filter">Type:</Label>
                            <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Content</SelectItem>
                                    <SelectItem value="post">Posts</SelectItem>
                                    <SelectItem value="comment">Comments</SelectItem>
                                    <SelectItem value="review">Reviews</SelectItem>
                                    <SelectItem value="reply">Replies</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="content-status-filter">Status:</Label>
                            <Select value={contentStatusFilter} onValueChange={setContentStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flagged">Flagged</SelectItem>
                                    <SelectItem value="hidden">Hidden</SelectItem>
                                    <SelectItem value="deleted">Deleted</SelectItem>
                                    <SelectItem value="all">All</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={fetchFlaggedContent} size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Content Display */}
            <div className="grid gap-6">
                {contentLoading ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                                Loading flagged content...
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {(contentTypeFilter === 'all' || contentTypeFilter === 'post') && flaggedContent.posts.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Forum Posts ({flaggedContent.posts.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {flaggedContent.posts.map(post => renderContentItem(post, 'posts'))}
                                </CardContent>
                            </Card>
                        )}

                        {(contentTypeFilter === 'all' || contentTypeFilter === 'comment') && flaggedContent.comments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Comments ({flaggedContent.comments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {flaggedContent.comments.map(comment => renderContentItem(comment, 'comments'))}
                                </CardContent>
                            </Card>
                        )}

                        {(contentTypeFilter === 'all' || contentTypeFilter === 'review') && flaggedContent.reviews.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5" />
                                        Course Reviews ({flaggedContent.reviews.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {flaggedContent.reviews.map(review => renderContentItem(review, 'reviews'))}
                                </CardContent>
                            </Card>
                        )}

                        {(contentTypeFilter === 'all' || contentTypeFilter === 'reply') && flaggedContent.replies.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Review Replies ({flaggedContent.replies.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {flaggedContent.replies.map(reply => renderContentItem(reply, 'replies'))}
                                </CardContent>
                            </Card>
                        )}

                        {/* No Content Message */}
                        {!contentLoading && 
                         flaggedContent.posts.length === 0 && 
                         flaggedContent.comments.length === 0 && 
                         flaggedContent.reviews.length === 0 && 
                         flaggedContent.replies.length === 0 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8 text-muted-foreground">
                                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No {contentStatusFilter} content found</p>
                                        <p className="text-sm">
                                            {contentStatusFilter === 'flagged' ? 'No content flagged for review' : `No ${contentStatusFilter} content`}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

// Component to display moderation history
function ModerationHistory({ history }: { history: ModerationLog[] }) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-4 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No moderation actions yet</p>
            </div>
        );
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'hide':
                return <EyeOff className="h-4 w-4 text-orange-600" />;
            case 'delete':
                return <Trash2 className="h-4 w-4 text-red-600" />;
            case 'restore':
            case 'approve':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'flag':
                return <Flag className="h-4 w-4 text-yellow-600" />;
            case 'unflag':
            case 'dismiss':
                return <FlagOff className="h-4 w-4 text-blue-600" />;
            case 'resolve_report':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'dismiss_report':
                return <XCircle className="h-4 w-4 text-gray-600" />;
            case 'review_report':
                return <Eye className="h-4 w-4 text-blue-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'hide':
                return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'delete':
                return 'text-red-700 bg-red-50 border-red-200';
            case 'restore':
            case 'approve':
            case 'resolve_report':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'flag':
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'unflag':
            case 'dismiss':
            case 'dismiss_report':
                return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'review_report':
                return 'text-blue-700 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const formatActionName = (action: string) => {
        switch (action) {
            case 'hide':
                return 'Hidden';
            case 'delete':
                return 'Deleted';
            case 'restore':
                return 'Restored';
            case 'approve':
                return 'Approved';
            case 'flag':
                return 'Flagged';
            case 'unflag':
                return 'Unflagged';
            case 'dismiss':
                return 'Dismissed';
            case 'resolve_report':
                return 'Report Resolved';
            case 'dismiss_report':
                return 'Report Dismissed';
            case 'review_report':
                return 'Report Reviewed';
            default:
                return action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'moderator':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-3">
            {history.map((log) => (
                <div key={log.id} className="border rounded-lg p-3 bg-gray-50/30">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                                {getActionIcon(log.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs px-2 py-0.5 ${getActionColor(log.action)}`}
                                    >
                                        {formatActionName(log.action)}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        <span className="font-medium">{log.users.name}</span>
                                        <Badge 
                                            variant="outline" 
                                            className={`text-xs px-1.5 py-0 ${getRoleBadgeColor(log.users.role)}`}
                                        >
                                            {log.users.role}
                                        </Badge>
                                    </div>
                                </div>
                                {log.reason && (
                                    <p className="text-sm text-muted-foreground mb-1">
                                        <span className="font-medium">Reason:</span> {log.reason}
                                    </p>
                                )}
                                {log.notes && (
                                    <p className="text-sm text-muted-foreground mb-1">
                                        <span className="font-medium">Notes:</span> {log.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper functions for use in the main component
const getActionIcon = (action: string) => {
    switch (action) {
        case 'hide':
            return <EyeOff className="h-4 w-4 text-orange-600" />;
        case 'delete':
            return <Trash2 className="h-4 w-4 text-red-600" />;
        case 'restore':
        case 'approve':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'flag':
            return <Flag className="h-4 w-4 text-yellow-600" />;
        case 'unflag':
        case 'dismiss':
            return <FlagOff className="h-4 w-4 text-blue-600" />;
        case 'resolve_report':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'dismiss_report':
            return <XCircle className="h-4 w-4 text-gray-600" />;
        case 'review_report':
            return <Eye className="h-4 w-4 text-blue-600" />;
        default:
            return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
};

const getActionColor = (action: string) => {
    switch (action) {
        case 'hide':
            return 'text-orange-700 bg-orange-50 border-orange-200';
        case 'delete':
            return 'text-red-700 bg-red-50 border-red-200';
        case 'restore':
        case 'approve':
        case 'resolve_report':
            return 'text-green-700 bg-green-50 border-green-200';
        case 'flag':
            return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        case 'unflag':
        case 'dismiss':
        case 'dismiss_report':
            return 'text-blue-700 bg-blue-50 border-blue-200';
        case 'review_report':
            return 'text-blue-700 bg-blue-50 border-blue-200';
        default:
            return 'text-gray-700 bg-gray-50 border-gray-200';
    }
};

const formatActionName = (action: string) => {
    switch (action) {
        case 'hide':
            return 'Hidden';
        case 'delete':
            return 'Deleted';
        case 'restore':
            return 'Restored';
        case 'approve':
            return 'Approved';
        case 'flag':
            return 'Flagged';
        case 'unflag':
            return 'Unflagged';
        case 'dismiss':
            return 'Dismissed';
        case 'resolve_report':
            return 'Report Resolved';
        case 'dismiss_report':
            return 'Report Dismissed';
        case 'review_report':
            return 'Report Reviewed';
        default:
            return action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ');
    }
};

export default function ModerationDashboard() {
    const { data: session, status } = useSession();
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<ModerationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (session && canModerate(session?.user)) {
            fetchReports();
            fetchStats();
        }
    }, [session, statusFilter]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/reports?status=${statusFilter}&limit=50`);
            if (response.ok) {
                const data = await response.json();
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/moderation/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleReportAction = async (reportId: string, newStatus: string, adminNotes?: string, moderationAction?: string) => {
        try {
            setActionLoading(true);
            const response = await fetch(`/api/admin/reports/${reportId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    adminNotes,
                    moderationAction,
                }),
            });

            if (response.ok) {
                fetchReports();
                fetchStats();
                setSelectedReport(null);
            } else {
                console.error('Failed to update report');
            }
        } catch (error) {
            console.error('Error updating report:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleModerationAction = async (type: string, id: string, action: string, reason: string) => {
        try {
            const response = await fetch('/api/admin/moderation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    targetType: type,
                    targetId: id,
                    reason,
                }),
            });

            if (response.ok) {
                fetchReports();
                fetchStats();
            }
        } catch (error) {
            console.error('Error applying moderation action:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="!bg-orange-100 !text-orange-800 hover:!bg-orange-200 !border-orange-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'reviewed':
                return <Badge className="!bg-blue-100 !text-blue-800 hover:!bg-blue-200 !border-blue-200"><Eye className="h-3 w-3 mr-1" />Reviewed</Badge>;
            case 'resolved':
                return <Badge className="!bg-green-100 !text-green-800 hover:!bg-green-200 !border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
            case 'dismissed':
                return <Badge className="!bg-gray-100 !text-gray-800 hover:!bg-gray-200 !border-gray-200"><XCircle className="h-3 w-3 mr-1" />Dismissed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'post':
                return <MessageSquare className="h-4 w-4" />;
            case 'comment':
                return <MessageSquare className="h-4 w-4" />;
            case 'review':
                return <Star className="h-4 w-4" />;
            case 'reply':
                return <FileText className="h-4 w-4" />;
            case 'user':
                return <Users className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse">
                    Loading moderation dashboard...
                </div>
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
                        the moderation dashboard.
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

    if (!canModerate(session?.user)) {
        return (
            <div className="container mx-auto p-6">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Moderation access is restricted to administrators and
                        moderators only.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

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
                        <Shield className="h-8 w-8" />
                        Content Moderation
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and moderate community content
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Logged in as: {session?.user?.email}
                    <div className="text-xs text-muted-foreground mt-1">
                        Role: {getFullRoleDisplay(session?.user)}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.reports.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.reports.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.moderation.flaggedContent}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Hidden Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{stats.moderation.hiddenContent}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="reports" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="reports">Reports Queue</TabsTrigger>
                    <TabsTrigger value="content">Flagged Content</TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="space-y-6">
                    {/* Filter Controls */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <Label htmlFor="status-filter">Status:</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="dismissed">Dismissed</SelectItem>
                                            <SelectItem value="all">All</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={fetchReports} size="sm" variant="outline">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reports List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reports Queue</CardTitle>
                            <CardDescription>
                                Review and manage user reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                                    Loading reports...
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No reports found</p>
                                    <p className="text-sm">
                                        {statusFilter === 'pending' ? 'No pending reports to review' : `No ${statusFilter} reports`}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reports.map((report) => (
                                        <div key={report.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getTypeIcon(report.reported_item_type)}
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium capitalize">
                                                                {report.reported_item_type} Report
                                                            </span>
                                                            {getStatusBadge(report.status)}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Reported by {report.users.name} • {new Date(report.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => setSelectedReport(report)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Review
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                {getTypeIcon(report.reported_item_type)}
                                                                Report Details
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Review this report and decide what action to take
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <Label className="text-sm font-medium">Reason:</Label>
                                                                <p className="text-sm mt-1">{report.reason}</p>
                                                            </div>
                                                            {report.description && (
                                                                <div>
                                                                    <Label className="text-sm font-medium">Description:</Label>
                                                                    <p className="text-sm mt-1">{report.description}</p>
                                                                </div>
                                                            )}
                                                            {report.contentPreview && (
                                                                <div>
                                                                    <Label className="text-sm font-medium">Reported Content:</Label>
                                                                    <div className="mt-1 p-3 bg-muted rounded border">
                                                                        {report.contentPreview.title && (
                                                                            <h4 className="font-medium mb-2">{report.contentPreview.title}</h4>
                                                                        )}
                                                                        <p className="text-sm">{report.contentPreview.content}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {report.reportedUser && (
                                                                <div>
                                                                    <Label className="text-sm font-medium">Reported User:</Label>
                                                                    <p className="text-sm mt-1">{report.reportedUser.name} ({report.reportedUser.email})</p>
                                                                </div>
                                                            )}

                                                            {/* Moderation History */}
                                                            {report.moderationHistory && report.moderationHistory.length > 0 && (
                                                                <div className="border-t pt-4 mt-4">
                                                                    <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                                                                        <History className="h-4 w-4" />
                                                                        Moderation History
                                                                    </Label>
                                                                    <div className="max-h-60 overflow-y-auto pr-2">
                                                                        <ModerationHistory history={report.moderationHistory} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Action Explanations */}
                                                            <div className="border-t pt-4 mt-6">
                                                                <Label className="text-sm font-medium mb-3 block">Available Actions:</Label>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                                                                    <div className="flex items-start gap-2">
                                                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="font-medium text-green-700">Approve</p>
                                                                            <p>Report is invalid. Content stays visible and report is marked as resolved.</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start gap-2">
                                                                        <XCircle className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="font-medium text-gray-700">Dismiss</p>
                                                                            <p>Report doesn't require action. Marks report as dismissed without affecting content.</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start gap-2">
                                                                        <EyeOff className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="font-medium text-orange-700">Hide Content</p>
                                                                            <p>Content violates rules. Hides from public view but keeps for review.</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start gap-2">
                                                                        <Trash2 className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="font-medium text-red-700">Delete Content</p>
                                                                            <p>Serious violation. Permanently removes content from the platform.</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <DialogFooter className="pt-6">
                                                            <div className="grid grid-cols-2 gap-3 w-full">
                                                                <Button
                                                                    className="w-full !bg-green-600 hover:!bg-green-700 !text-white"
                                                                    onClick={() => handleReportAction(report.id, 'resolved', 'Content reviewed and approved')}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full !border-blue-300 !text-blue-700 hover:!bg-blue-50 hover:!border-blue-400"
                                                                    onClick={() => handleReportAction(report.id, 'dismissed', 'No action needed')}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    Dismiss
                                                                </Button>
                                                                <Button
                                                                    className="w-full !bg-orange-500 hover:!bg-orange-600 !text-white"
                                                                    onClick={() => handleReportAction(report.id, 'resolved', 'Content hidden for policy violation', 'hide')}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <EyeOff className="h-4 w-4 mr-2" />
                                                                    Hide Content
                                                                </Button>
                                                                <Button
                                                                    className="w-full !bg-red-600 hover:!bg-red-700 !text-white"
                                                                    onClick={() => handleReportAction(report.id, 'resolved', 'Content deleted for serious policy violation', 'delete')}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete Content
                                                                </Button>
                                                            </div>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Reason:</span> {report.reason}
                                            </div>
                                            {report.description && (
                                                <div className="text-sm">
                                                    <span className="font-medium">Details:</span> {report.description}
                                                </div>
                                            )}
                                            {report.admin_notes && (
                                                <div className="text-sm mt-1 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                                                    <span className="font-medium text-blue-800">Admin Notes:</span> 
                                                    <span className="text-blue-700"> {report.admin_notes}</span>
                                                </div>
                                            )}
                                            {report.moderationHistory && report.moderationHistory.length > 0 && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                        <History className="h-3 w-3" />
                                                        Latest Action:
                                                    </div>
                                                    {(() => {
                                                        const latestAction = report.moderationHistory[0];
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={`text-xs px-2 py-0.5 ${getActionIcon(latestAction.action) ? getActionColor(latestAction.action) : 'text-gray-700 bg-gray-50 border-gray-200'}`}
                                                                >
                                                                    {formatActionName(latestAction.action)}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    by <span className="font-medium">{latestAction.users.name}</span> 
                                                                    • {new Date(latestAction.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                    <FlaggedContentTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
