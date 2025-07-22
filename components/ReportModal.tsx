"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedItemType: string; // 'post', 'comment', 'review', 'user'
  reportedItemId: string;
  reportedItemTitle?: string; // Optional title for display
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam or promotional content" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misinformation", label: "False or misleading information" },
  { value: "off-topic", label: "Off-topic or irrelevant" },
  { value: "academic_integrity", label: "Academic integrity violation" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "personal_info", label: "Sharing personal information" },
  { value: "copyright", label: "Copyright infringement" },
  { value: "other", label: "Other (please specify)" },
];

export default function ReportModal({
  isOpen,
  onClose,
  reportedItemType,
  reportedItemId,
  reportedItemTitle,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for reporting this content.",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to report content.",
        variant: "destructive",
      });
      return;
    }

    if (reason === "other" && !description.trim()) {
      toast({
        title: "Please provide details",
        description: "When selecting 'Other', please provide additional details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reported_item_type: reportedItemType,
          reported_item_id: reportedItemId,
          reason,
          description: description.trim() || null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Report submitted",
          description: "Thank you for your report. Our moderation team will review it.",
        });
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Failed to submit report",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    setIsSubmitting(false);
    onClose();
  };

  const getItemTypeDisplayName = () => {
    switch (reportedItemType) {
      case "post":
        return "forum post";
      case "comment":
        return "comment";
      case "review":
        return "course review";
      case "user":
        return "user profile";
      default:
        return "content";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report {getItemTypeDisplayName()}
          </DialogTitle>
          <DialogDescription>
            {reportedItemTitle && (
              <>Reporting: "{reportedItemTitle}"<br /></>
            )}
            Help us maintain a safe and respectful community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">
              Additional details {reason === "other" ? "(required)" : "(optional)"}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help our moderation team..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {description.length}/500 characters
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Flag className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}