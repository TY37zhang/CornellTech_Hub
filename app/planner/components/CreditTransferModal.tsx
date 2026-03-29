"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface CreditTransferModalProps {
  requirements: { [key: string]: Requirement };
  coursePlan: { [key: string]: any[] };
  calculateCategoryCredits: (categoryKey: string) => {
    totalCredits: number;
    ethicsDeduction: number;
    ethicsAddition: number;
    netCredits: number;
  };
  onTransferCredits: (transfer: CreditTransfer) => Promise<void>;
  existingTransfers: CreditTransfer[];
  sourceRequirement: string;
  children: React.ReactNode;
}

export default function CreditTransferModal({
  requirements,
  coursePlan,
  calculateCategoryCredits,
  onTransferCredits,
  existingTransfers,
  sourceRequirement,
  children,
}: CreditTransferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [toCategory, setToCategory] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const resetForm = () => {
    setToCategory("");
    setAmount("");
    setValidationError("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const getAvailableCredits = (): number => {
    const creditInfo = calculateCategoryCredits(sourceRequirement);

    // Available credits = all current credits (allow transferring any assigned credits)
    // This allows users to transfer credits even if requirement isn't overfulfilled
    return creditInfo.netCredits;
  };

  const getRequirementShortfall = (categoryKey: string): number => {
    const creditInfo = calculateCategoryCredits(categoryKey);
    const requiredCredits = requirements[categoryKey].credits;

    // Shortfall = required minus current (if positive)
    return Math.max(0, requiredCredits - creditInfo.netCredits);
  };

  const validateTransfer = (): string => {
    if (!toCategory) {
      return "Please select a destination requirement.";
    }

    if (sourceRequirement === toCategory) {
      return "Cannot transfer credits to the same requirement.";
    }

    const transferAmount = parseInt(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return "Please enter a valid credit amount (greater than 0).";
    }

    const availableCredits = getAvailableCredits();
    if (transferAmount > availableCredits) {
      return `Cannot transfer ${transferAmount} credits. Only ${availableCredits} credits currently assigned to ${getRequirementDisplayName(sourceRequirement)}.`;
    }

    // Warn if this would leave the source requirement under-fulfilled
    const sourceRequiredCredits = requirements[sourceRequirement].credits;
    const sourceCreditsAfterTransfer = availableCredits - transferAmount;
    if (sourceCreditsAfterTransfer < sourceRequiredCredits) {
      const shortfall = sourceRequiredCredits - sourceCreditsAfterTransfer;
      // This is just a warning, not a blocking error
    }

    return "";
  };

  const handleSubmit = async () => {
    const error = validateTransfer();
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransferCredits({
        id: crypto.randomUUID(),
        fromCategory: sourceRequirement,
        toCategory,
        amount: parseInt(amount),
      });
      setIsOpen(false);
      resetForm();
    } catch (error) {
      setValidationError("Failed to create transfer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequirementDisplayName = (key: string) => {
    return key.replace(/([A-Z])/g, " $1").trim();
  };

  const previewTransferImpact = () => {
    if (!toCategory || !amount) return null;

    const transferAmount = parseInt(amount);
    if (isNaN(transferAmount)) return null;

    const fromCredits = calculateCategoryCredits(sourceRequirement);
    const toCredits = calculateCategoryCredits(toCategory);

    return (
      <div className="mt-4 p-4 bg-muted/50 rounded-none">
        <h4 className="font-medium mb-2">Transfer Preview:</h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">
              {getRequirementDisplayName(sourceRequirement)}:
            </span>{" "}
            {fromCredits.netCredits} cr →{" "}
            {fromCredits.netCredits - transferAmount} cr
          </div>
          <div>
            <span className="font-medium">
              {getRequirementDisplayName(toCategory)}:
            </span>{" "}
            {toCredits.netCredits} cr → {toCredits.netCredits + transferAmount}{" "}
            cr
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Credits
          </DialogTitle>
          <DialogDescription>
            Move credits from one requirement to another. This is useful for
            courses that can count towards multiple requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Requirement (Read-only) */}
          <div className="space-y-2">
            <Label>From Requirement</Label>
            <div className="px-3 py-2 bg-muted rounded-none">
              <span className="font-medium">
                {getRequirementDisplayName(sourceRequirement)}
              </span>
              <span className="text-muted-foreground ml-2">
                ({getAvailableCredits()} credits available)
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
                  .filter(([key]) => key !== sourceRequirement)
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
              max={getAvailableCredits()}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setValidationError("");
              }}
              placeholder="Enter credits to transfer"
            />
            <p className="text-sm text-muted-foreground">
              Maximum: {getAvailableCredits()} credits
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
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !toCategory || !amount}
            >
              {isSubmitting ? "Transferring..." : "Transfer Credits"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
