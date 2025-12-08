"use client";

import { Pencil, X } from "lucide-react";
import { useMessageActionsStore } from "../../stores/messageStore";

export function EditModeBanner() {
  const { activeMessageAction, clearAction } = useMessageActionsStore();

  if (activeMessageAction?.type !== "edit") return null;

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-melting-glacier border-t border-light-grey">
      <div className="flex items-center gap-2 text-black">
        <Pencil className="w-4 h-4" />
        <span className="text-sm font-medium">
          Editing: {activeMessageAction.originalContent}
        </span>
      </div>
      <button
        onClick={clearAction}
        className="p-1 text-grey hover:bg-light-grey rounded-full transition-colors"
        aria-label="Cancel editing"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
