"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    Edit2,
    Trash2,
    ArrowRightLeft,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CreditTransfer {
    id: string;
    fromCategory: string;
    toCategory: string;
    amount: number;
}

interface CreditTransferListProps {
    transfers: CreditTransfer[];
    onEditTransfer: (transfer: CreditTransfer) => void;
    onDeleteTransfer: (transferId: string) => Promise<void>;
    requirements: { [key: string]: { credits: number; description: string } };
}

export default function CreditTransferList({
    transfers,
    onEditTransfer,
    onDeleteTransfer,
    requirements,
}: CreditTransferListProps) {
    const [deletingId, setDeletingId] = useState<string>("");
    const [collapsed, setCollapsed] = useState(false);

    const getRequirementDisplayName = (key: string) => {
        return key.replace(/([A-Z])/g, " $1").trim();
    };

    const handleDelete = async (transferId: string) => {
        setDeletingId(transferId);
        try {
            await onDeleteTransfer(transferId);
        } catch (error) {
            console.error("Error deleting transfer:", error);
        } finally {
            setDeletingId("");
        }
    };

    if (transfers.length === 0) {
        return (
            <Card className="p-6 w-full overflow-hidden">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <button
                                type="button"
                                aria-label={collapsed ? "Expand" : "Collapse"}
                                onClick={() => setCollapsed((c) => !c)}
                                className="focus:outline-none"
                            >
                                {collapsed ? (
                                    <ChevronRight className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5" />
                                )}
                            </button>
                            <ArrowRightLeft className="h-5 w-5" />
                            Credit Transfers
                        </h3>
                    </div>
                    {!collapsed && (
                        <div className="text-sm text-muted-foreground">
                            No credit transfers have been created yet. To create
                            a transfer, hover over any requirement section above
                            and click the transfer icon (⇄) that appears next to
                            the credit count.
                        </div>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 w-full overflow-hidden">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <button
                            type="button"
                            aria-label={collapsed ? "Expand" : "Collapse"}
                            onClick={() => setCollapsed((c) => !c)}
                            className="focus:outline-none"
                        >
                            {collapsed ? (
                                <ChevronRight className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </button>
                        <ArrowRightLeft className="h-5 w-5" />
                        Active Credit Transfers
                    </h3>
                </div>
                {!collapsed && (
                    <>
                        <div className="text-sm text-muted-foreground">
                            Manage your credit transfers between requirements.
                            These adjustments are reflected in your credit
                            calculations.
                        </div>
                        <div className="space-y-2">
                            {transfers.map((transfer) => (
                                <div
                                    key={transfer.id}
                                    className="flex items-center justify-between p-2 border rounded-lg bg-muted/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant="outline"
                                            className="font-medium text-sm"
                                        >
                                            {transfer.amount} cr
                                        </Badge>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium leading-tight">
                                                {getRequirementDisplayName(
                                                    transfer.fromCategory
                                                )}
                                            </span>
                                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="font-medium leading-tight">
                                                {getRequirementDisplayName(
                                                    transfer.toCategory
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                onEditTransfer(transfer)
                                            }
                                            className="h-8 w-8 p-0"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                            <span className="sr-only">
                                                Edit transfer
                                            </span>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    disabled={
                                                        deletingId ===
                                                        transfer.id
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span className="sr-only">
                                                        Delete transfer
                                                    </span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Delete Credit Transfer
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to
                                                        delete this credit
                                                        transfer? This will
                                                        remove {transfer.amount}{" "}
                                                        credit
                                                        {transfer.amount > 1
                                                            ? "s"
                                                            : ""}{" "}
                                                        from being transferred
                                                        from{" "}
                                                        <span className="font-medium">
                                                            {getRequirementDisplayName(
                                                                transfer.fromCategory
                                                            )}
                                                        </span>{" "}
                                                        to{" "}
                                                        <span className="font-medium">
                                                            {getRequirementDisplayName(
                                                                transfer.toCategory
                                                            )}
                                                        </span>
                                                        . This action cannot be
                                                        undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            handleDelete(
                                                                transfer.id
                                                            )
                                                        }
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        {deletingId ===
                                                        transfer.id
                                                            ? "Deleting..."
                                                            : "Delete Transfer"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}
