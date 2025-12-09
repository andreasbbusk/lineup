"use client";

import { Avatar, getInitials } from "@/app/components/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/dialog";
import { VisuallyHidden } from "@/app/components/visually-hidden";
import { Crown, X } from "lucide-react";
import type { Conversation } from "../../types";

interface GroupInfoModalProps {
  conversation: Conversation | undefined;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupInfoModal({
  conversation,
  currentUserId,
  open,
  onOpenChange,
}: GroupInfoModalProps) {
  if (!conversation || conversation.type !== "group") {
    return null;
  }

  const isCreator = conversation.createdBy === currentUserId;
  const participants = conversation.participants ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <VisuallyHidden>
          <DialogTitle>Group Info</DialogTitle>
        </VisuallyHidden>
      </DialogHeader>
      <DialogContent className="max-w-xs p-4">
        <div className="flex flex-col gap-6 mt-4">
          {/* Group Details */}
          <div className="flex flex-col items-center gap-3">
            <Avatar
              src={conversation.avatarUrl}
              alt={conversation.name || "Group"}
              fallback={getInitials(conversation.name?.split(" ")[0])}
              size="xl"
              className="border border-grey-light rounded-full"
            />
            <h3 className="text-xl font-semibold text-black">
              {conversation.name || "Unnamed Group"}
            </h3>
            <p className="text-sm text-grey">
              {participants.length}{" "}
              {participants.length === 1 ? "member" : "members"}
            </p>
          </div>

          {/* Members List */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-grey uppercase tracking-wide">
              Members
            </h4>
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
              {participants.map((participant) => {
                const isAdmin = participant.userId === conversation.createdBy;
                const fullName = [
                  participant.user?.firstName,
                  participant.user?.lastName,
                ]
                  .filter(Boolean)
                  .join(" ");
                const displayName =
                  fullName || participant.user?.username || "Unknown";

                return (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-grey-light/20"
                  >
                    <Avatar
                      src={participant.user?.avatarUrl}
                      alt={displayName}
                      fallback={getInitials(
                        participant.user?.firstName,
                        participant.user?.lastName
                      )}
                      size="md"
                      className="rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-grey truncate">
                        @{participant.user?.username}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        <Crown className="size-3" />
                        <span>Admin</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="fixed top-4 right-4 active:scale-95 transition-transform"
          >
            <X className="size-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
