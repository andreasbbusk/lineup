import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/app/components/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/radix-popover";
import { TYPING_INDICATOR_TIMEOUT_MS } from "../../constants";

// ============================================================================
// Types & Constants
// ============================================================================

type MessageInputProps = {
  onTyping?: (isTyping: boolean) => void;
  onSendMessage: (content: string) => void;
  isDisabled?: boolean;
};

/** Attachment menu options (placeholder for future features) */
const MENU_ITEMS = [
  { icon: "camera", label: "Attach a picture" },
  { icon: "attachment", label: "Attach a file" },
  { icon: "pin-alt", label: "Share location" },
  { icon: "stats-up-square", label: "Survey" },
];

// ============================================================================
// Component
// ============================================================================

export function MessageInput({ onTyping, onSendMessage, isDisabled }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update typing status and notify parent
  const updateTyping = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTyping?.(typing);
    }
  };

  // Send message and reset input state
  const handleSend = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isDisabled) return;

    onSendMessage(trimmedContent);
    setContent("");
    clearTimeout(timeout.current);
    updateTyping(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <div className="border-t border-light-grey p-4 bg-white flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <Button variant="icon" onClick={() => {}} icon="plus" disabled={isDisabled} />
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
        onChange={(e) => {
          setContent(e.target.value);
          clearTimeout(timeout.current);
          updateTyping(true);
          timeout.current = setTimeout(() => updateTyping(false), TYPING_INDICATOR_TIMEOUT_MS);
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Aa"
        disabled={isDisabled}
      />
      <Button
        variant="icon"
        onClick={handleSend}
        icon={content ? "send" : "mic"}
        disabled={isDisabled}
      />
    </div>
  );
}
