"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/radix-popover";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useMessageActionsStore } from "../../stores/messageStore";

interface MessageActionsMenuProps {
  messageId: string;
  content: string;
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageActionsMenu({
  messageId,
  content,
  children,
  isOpen,
  onOpenChange,
}: MessageActionsMenuProps) {
  const { startEdit, startDelete } = useMessageActionsStore();

  const handleAction = (action: "edit" | "delete") => {
    action === "edit" ? startEdit(messageId, content) : startDelete(messageId);
    onOpenChange(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => void (document.body.style.overflow = "");
  }, [isOpen]);

  const menuItems = [
    { icon: Copy, label: "Copy", onClick: handleCopy },
    { icon: Pencil, label: "Edit", onClick: () => handleAction("edit") },
    {
      icon: Trash2,
      label: "Delete",
      onClick: () => handleAction("delete"),
      className: "text-red-600",
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => onOpenChange(false)}
          style={{ WebkitBackdropFilter: "blur(8px)" }}
        />
      )}

      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div className={isOpen ? "relative z-50" : ""}>{children}</div>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="p-0 w-32 overflow-hidden bg-grey border-none rounded-md shadow-2xl z-50"
        >
          <div className="flex flex-col p-3 gap-2.5 text-white">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                {index > 0 && <div className="w-full h-0.25 bg-white opacity-20 -mt-2.5 mb-2.5" />}
                <button
                  onClick={item.onClick}
                  className={`flex items-center gap-2 text-sm hover:opacity-80 transition-opacity w-full text-left ${
                    item.className || ""
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
