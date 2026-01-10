"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/modules/components/radix-popover";
import { Copy, Pencil, Trash2, type LucideIcon } from "lucide-react";
import { useMessageActionsStore } from "../../stores/messageStore";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}

interface MessageActionsMenuProps {
  messageId: string;
  content: string;
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  className = "",
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-white/10 transition-colors w-full text-left rounded-sm ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

export function MessageActionsMenu({
  messageId,
  content,
  children,
  isOpen,
  onOpenChange,
}: MessageActionsMenuProps) {
  const { startEdit, startDelete } = useMessageActionsStore();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(console.error);
    close();
  };

  const close = () => onOpenChange(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={close}
          style={{ WebkitBackdropFilter: "blur(8px)" }}
        />
      )}

      <Popover open={isOpen} onOpenChange={onOpenChange} modal={true}>
        <PopoverTrigger asChild>
          {/* Wrapper ensures the trigger stays above the backdrop (z-50 vs z-40) */}
          <div className={isOpen ? "relative z-50" : ""}>{children}</div>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-32 p-1 bg-grey border-none rounded-md shadow-2xl text-white overflow-hidden z-50"
        >
          <div className="flex flex-col">
            <MenuItem icon={Copy} label="Copy" onClick={handleCopy} />
            <div className="h-px bg-white/20 my-1 mx-2" />{" "}
            <MenuItem
              icon={Pencil}
              label="Edit"
              onClick={() => {
                startEdit(messageId, content);
                close();
              }}
            />
            <div className="h-px bg-white/20 my-1 mx-2" />
            <MenuItem
              icon={Trash2}
              label="Delete"
              onClick={() => {
                startDelete(messageId);
                close();
              }}
              className="text-red-600"
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
