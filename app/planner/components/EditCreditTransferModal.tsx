"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Requirement {
    credits: number;
    description: string;
}

interface CreditTransfer {
    id: string;
    fromCategory: string;
    toCategory: string;
    amount: number;
}

interface EditCreditTransferModalProps {
    transfer: CreditTransfer | null;
    isOpen: boolean;
    onClose: () => void;
    requirements: { [key: string]: Requirement };
    coursePlan: { [key: string]: any[] };
    calculateCategoryCredits: (categoryKey: string) => {
        totalCredits: number;
        ethicsDeduction: number;
        ethicsAddition: number;
        transferDeductions: number;
        transferAdditions: number;
        netCredits: number;
    };
    onUpdateTransfer: (updatedTransfer: CreditTransfer) => Promise<void>;
    existingTransfers: CreditTransfer[];
}

export default function EditCreditTransferModal({
    transfer,
    isOpen,
    onClose,
    requirements,
    coursePlan,
    calculateCategoryCredits,
    onUpdateTransfer,
    existingTransfers,
}: EditCreditTransferModalProps) {
    const [toCategory, setToCategory] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string>("");

    const resetForm = () => {
        if (transfer) {
            setToCategory(transfer.toCategory);
            setAmount(transfer.amount.toString());
        } else {
            setToCategory("");
            setAmount("");
        }
        setValidationError("");
    };

    useEffect(() => {
        if (isOpen && transfer) {
            resetForm();
        } else if (!isOpen) {
            setValidationError("");
        }
    }, [isOpen, transfer]);

    const getAvailableCreditsForEdit = (): number => {
        if (!transfer) return 0;
        
        const creditInfo = calculateCategoryCredits(transfer.fromCategory);
        
        // For editing, we need to account for the current transfer being edited
        // Add back the current transfer amount, then check what's available
        const otherTransfersFromCategory = existingTransfers
            .filter(t => t.id !== transfer.id && t.fromCategory === transfer.fromCategory)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const actualNetCredits = creditInfo.totalCredits - creditInfo.ethicsDeduction + creditInfo.ethicsAddition - otherTransfersFromCategory;
        
        return actualNetCredits;
    };

    const getRequirementShortfall = (categoryKey: string): number => {
        const creditInfo = calculateCategoryCredits(categoryKey);
        const requiredCredits = requirements[categoryKey].credits;
        
        // For the target category, if this is the current target, subtract the existing transfer
        let adjustedNetCredits = creditInfo.netCredits;
        if (transfer && categoryKey === transfer.toCategory) {
            adjustedNetCredits -= transfer.amount;
        }
        
        return Math.max(0, requiredCredits - adjustedNetCredits);
    };

    const validateTransfer = (): string => {
        if (!transfer) return "No transfer selected for editing.";
        
        if (!toCategory) {
            return "Please select a destination requirement.";
        }

        if (transfer.fromCategory === toCategory) {
            return "Cannot transfer credits to the same requirement.";
        }

        const transferAmount = parseInt(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return "Please enter a valid credit amount (greater than 0).";
        }

        const availableCredits = getAvailableCreditsForEdit();
        if (transferAmount > availableCredits) {
            return `Cannot transfer ${transferAmount} credits. Only ${availableCredits} credits available in ${getRequirementDisplayName(transfer.fromCategory)}.`;
        }

        return "";
    };

    const handleSubmit = async () => {
        if (!transfer) return;
        
        const error = validateTransfer();
        if (error) {
            setValidationError(error);
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedTransfer = {
                ...transfer,
                toCategory,
                amount: parseInt(amount),
            };
            
            await onUpdateTransfer(updatedTransfer);
            onClose();
        } catch (error) {
            setValidationError("Failed to update transfer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRequirementDisplayName = (key: string) => {
        return key.replace(/([A-Z])/g, " $1").trim();
    };

    const previewTransferImpact = () => {
        if (!transfer || !toCategory || !amount) return null;

        const transferAmount = parseInt(amount);
        if (isNaN(transferAmount)) return null;

        const fromCredits = calculateCategoryCredits(transfer.fromCategory);
        const toCredits = calculateCategoryCredits(toCategory);

        // Calculate what credits would be after removing old transfer and adding new one
        const fromCreditsAfter = fromCredits.netCredits + transfer.amount - transferAmount;
        const toCreditsAfter = toCategory === transfer.toCategory 
            ? toCredits.netCredits - transfer.amount + transferAmount
            : toCredits.netCredits + transferAmount;
        
        // If changing destination, also show the old destination
        const oldToCredits = toCategory !== transfer.toCategory 
            ? calculateCategoryCredits(transfer.toCategory) 
            : null;

        return (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Transfer Preview:</h4>
                <div className="space-y-2 text-sm">
                    <div>
                        <span className="font-medium">{getRequirementDisplayName(transfer.fromCategory)}:</span>{" "}
                        {fromCredits.netCredits} cr → {fromCreditsAfter} cr
                    </div>
                    {oldToCredits && toCategory !== transfer.toCategory && (
                        <div>
                            <span className="font-medium">{getRequirementDisplayName(transfer.toCategory)} (old):</span>{" "}
                            {oldToCredits.netCredits} cr → {oldToCredits.netCredits - transfer.amount} cr
                        </div>
                    )}
                    <div>
                        <span className="font-medium">{getRequirementDisplayName(toCategory)}:</span>{" "}
                        {toCategory === transfer.toCategory ? fromCredits.netCredits : toCredits.netCredits} cr → {toCreditsAfter} cr
                    </div>
                </div>
            </div>
        );
    };

    if (!transfer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5" />
                        Edit Credit Transfer
                    </DialogTitle>
                    <DialogDescription>
                        Modify this credit transfer. Changes will update your credit calculations immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Source Requirement (Read-only) */}
                    <div className="space-y-2">
                        <Label>From Requirement</Label>
                        <div className="px-3 py-2 bg-muted rounded-md">
                            <span className="font-medium">{getRequirementDisplayName(transfer.fromCategory)}</span>
                            <span className="text-muted-foreground ml-2">
                                ({getAvailableCreditsForEdit()} credits available)
                            </span>
                        </div>
                    </div>

                    {/* Destination Requirement */}
                    <div className="space-y-2">
                        <Label htmlFor="to-requirement">To Requirement</Label>
                        <Select
                            value={toCategory}
                            onValueChange={(value) => {
                                setToCategory(value);
                                setValidationError("");
                            }}
                        >
                            <SelectTrigger id="to-requirement">
                                <SelectValue placeholder="Select destination requirement" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(requirements)
                                    .filter(([key]) => key !== transfer.fromCategory)
                                    .map(([key, req]) => {
                                        const shortfall = getRequirementShortfall(key);
                                        return (
                                            <SelectItem key={key} value={key}>
                                                {getRequirementDisplayName(key)}
                                                {shortfall > 0 && ` (needs ${shortfall} cr)`}
                                            </SelectItem>
                                        );
                                    })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Credit Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="credit-amount">Credit Amount</Label>
                        <Input
                            id="credit-amount"
                            type="number"
                            min="1"
                            max={getAvailableCreditsForEdit()}
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setValidationError("");
                            }}
                            placeholder="Enter credits to transfer"
                        />
                        <p className="text-sm text-muted-foreground">
                            Maximum: {getAvailableCreditsForEdit()} credits
                        </p>
                    </div>

                    {/* Preview */}
                    {previewTransferImpact()}

                    {/* Validation Error */}
                    {validationError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{validationError}</AlertDescription>
                        </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !toCategory || !amount}
                        >
                            {isSubmitting ? "Updating..." : "Update Transfer"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}