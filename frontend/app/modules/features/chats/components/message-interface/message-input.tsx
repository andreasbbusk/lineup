import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/app/modules/components/buttons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/modules/components/radix-popover";
import { TYPING_INDICATOR_TIMEOUT_MS } from "../../constants";
import { useMessageActionsStore } from "../../stores/messageStore";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MessageInputProps = {
  onTyping?: (isTyping: boolean) => void;
  onSendMessage: (content: string, replyToMessageId?: string | null) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  isDisabled?: boolean;
};

const MENU_ITEMS = [
  { icon: "camera", label: "Attach a picture" },
  { icon: "attachment", label: "Attach a file" },
  { icon: "pin-alt", label: "Share location" },
  { icon: "stats-up-square", label: "Survey" },
];

export function MessageInput({
  onTyping,
  onSendMessage,
  onEditMessage,
  isDisabled,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const { activeMessageAction, clearAction } = useMessageActionsStore();
  const isEditing = activeMessageAction?.type === "edit";
  const isReplying = activeMessageAction?.type === "reply";
  const replyToMessage = activeMessageAction?.replyToMessage;

  // Sync content when entering/exiting edit mode
  useEffect(() => {
    if (isEditing && activeMessageAction?.originalContent) {
      setContent(activeMessageAction.originalContent);
    } else if (!isEditing && !isReplying) {
      setContent("");
    }
    // We only want to run this when the *mode* changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isReplying]);

  const updateTyping = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTyping?.(typing);
    }
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || isDisabled) return;

    if (isEditing && onEditMessage && activeMessageAction) {
      onEditMessage(activeMessageAction.messageId, trimmed);
    } else {
      const replyToMessageId = isReplying ? replyToMessage?.id : null;
      onSendMessage(trimmed, replyToMessageId ?? undefined);
      setContent("");
    }

    clearTimeout(timeout.current);
    updateTyping(false);
    clearAction();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setContent(newValue);

    if (!isEditing) {
      clearTimeout(timeout.current);

      if (newValue.trim().length > 0) {
        updateTyping(true);
        timeout.current = setTimeout(
          () => updateTyping(false),
          TYPING_INDICATOR_TIMEOUT_MS
        );
      } else {
        updateTyping(false);
      }
    }
  };

  const handleBlur = () => {
    if (!isEditing && isTyping) {
      clearTimeout(timeout.current);
      updateTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
    if (e.key === "Escape" && (isEditing || isReplying)) clearAction();
  };

  const handleCancelReply = () => {
    clearAction();
  };

  useEffect(() => () => clearTimeout(timeout.current), []);

  // Truncate message content for preview
  const getReplyPreview = (content: string | null | undefined) => {
    if (!content) return "";
    return content.length > 50 ? `${content.slice(0, 50)}...` : content;
  };

  return (
    <div className="border-t border-light-grey bg-white">
      <AnimatePresence>
        {isReplying && replyToMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2 border-b border-light-grey flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-grey mb-1">
                  Replying to {replyToMessage.sender?.firstName || replyToMessage.sender?.username || "User"}
                </div>
                <div className="text-sm text-black truncate">
                  {getReplyPreview(replyToMessage.content)}
                </div>
              </div>
              <button
                onClick={handleCancelReply}
                className="shrink-0 p-1 hover:bg-melting-glacier rounded-full transition-colors"
                aria-label="Cancel reply"
              >
                <X size={16} className="text-grey" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-4 flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <Button
              variant="icon"
              onClick={() => {}}
              icon="plus"
              disabled={isDisabled || isEditing || isReplying}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" sideOffset={10}>
          <ul className="flex flex-col gap-2.5">
            {MENU_ITEMS.map((item, i) => (
              <React.Fragment key={item.icon}>
                {i > 0 && <div className="w-full h-px bg-white opacity-50" />}
                <li className="flex gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Image
                    src={`/icons/${item.icon}.svg`}
                    alt={item.label}
                    width={16}
                    height={16}
                    className="invert brightness-0"
                  />
                  <p>{item.label}</p>
                </li>
              </React.Fragment>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
      <input
        className="flex h-10 px-4 flex-1 rounded-full bg-melting-glacier focus:outline-none text-base placeholder:text-input-placeholder text-black"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={isEditing ? "Edit message..." : isReplying ? "Type a reply..." : "Aa"}
        disabled={isDisabled}
      />
      <Button
        variant="icon"
        onClick={handleSend}
        icon={isEditing ? "send" : content ? "send" : "mic"}
        disabled={isDisabled}
      />
      </div>
    </div>
  );
}
