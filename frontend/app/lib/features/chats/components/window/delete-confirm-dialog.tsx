"use client";

import { Button } from "@/app/components/buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/dialog";
import { useDeleteMessage } from "../../hooks/query/useDeleteMessage";
import { useMessageActionsStore } from "../../stores/messageStore";

interface DeleteConfirmDialogProps {
  conversationId: string;
}

export function DeleteConfirmDialog({
  conversationId,
}: DeleteConfirmDialogProps) {
  const { activeMessageAction, clearAction } = useMessageActionsStore();
  const { mutate: deleteMessage, isPending } = useDeleteMessage(conversationId);

  const handleDelete = () => {
    if (activeMessageAction?.messageId) {
      deleteMessage(activeMessageAction.messageId);
    }
  };

  return (
    <Dialog
      open={activeMessageAction?.type === "delete"}
      onOpenChange={(open) => !open && clearAction()}
    >
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Delete message?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this message?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={clearAction}
            disabled={isPending}
            className="px-4 py-2 text-sm"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-maroon hover:opacity-90 text-white"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
