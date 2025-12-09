"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/modules/components/dialog";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-xs p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-black">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-grey mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-grey-light text-black rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
              isDestructive
                ? "bg-red-500 text-white"
                : "bg-dark-cyan-blue text-white"
            }`}
          >
            {isLoading ? "Confirming..." : confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
