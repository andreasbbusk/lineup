import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/app/components/buttons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/radix-popover";
import { TYPING_INDICATOR_TIMEOUT_MS } from "../../constants";
import { useMessageActionsStore } from "../../stores/messageStore";

type MessageInputProps = {
  onTyping?: (isTyping: boolean) => void;
  onSendMessage: (content: string) => void;
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

  useEffect(() => {
    setContent(
      isEditing && activeMessageAction.originalContent
        ? activeMessageAction.originalContent
        : ""
    );
  }, [isEditing, activeMessageAction]);

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
      onSendMessage(trimmed);
      setContent("");
    }

    clearTimeout(timeout.current);
    updateTyping(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (!isEditing) {
      clearTimeout(timeout.current);
      updateTyping(true);
      timeout.current = setTimeout(
        () => updateTyping(false),
        TYPING_INDICATOR_TIMEOUT_MS
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
    if (e.key === "Escape" && isEditing) clearAction();
  };

  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <div className="border-t border-light-grey p-4 bg-white flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <Button
              variant="icon"
              onClick={() => {}}
              icon="plus"
              disabled={isDisabled || isEditing}
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
        placeholder={isEditing ? "Edit message..." : "Aa"}
        disabled={isDisabled}
      />
      <Button
        variant="icon"
        onClick={handleSend}
        icon={isEditing ? "send" : content ? "send" : "mic"}
        disabled={isDisabled}
      />
    </div>
  );
}
