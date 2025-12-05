import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/app/components/buttons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/popover";

type MessageInputProps = {
  conversationId: string;
  onTyping?: (isTyping: boolean) => void;
  onSendMessage: (content: string) => void;
  isDisabled?: boolean;
};

export function MessageInput({
  onTyping,
  onSendMessage,
  isDisabled,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle typing indicator
  const handleTypingChange = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTyping?.(typing);
    }
  };

  const handleSend = (value: string) => {
    const trimmedContent = value.trim();
    if (!trimmedContent || isDisabled) return;

    onSendMessage(trimmedContent);
    handleTypingChange(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (value: string) => {
    setContent(value);

    // Set typing indicator
    handleTypingChange(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingChange(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend(content);
      setContent("");
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-light-grey p-4 bg-white relative">
      <div className="flex w-full justify-center items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <Button
                variant="icon"
                onClick={() => {}}
                icon="plus"
                disabled={isDisabled}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" sideOffset={10}>
            <ul className="flex flex-col justify-center gap-2.5">
              <li className="flex gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/icons/camera.svg"
                  alt="Attach a picture"
                  width={16}
                  height={16}
                  className="invert brightness-0"
                />
                <p>Attach a picture</p>
              </li>
              <div className="w-full h-px bg-white opacity-20"></div>
              <li className="flex gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/icons/attachment.svg"
                  alt="Attach a file"
                  width={16}
                  height={16}
                  className="invert brightness-0"
                />
                <p>Attach a file</p>
              </li>
              <div className="w-full h-px bg-white opacity-20"></div>
              <li className="flex gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/icons/pin-alt.svg"
                  alt="Share location"
                  width={16}
                  height={16}
                  className="invert brightness-0"
                />
                <p>Share location</p>
              </li>
              <div className="w-full h-px bg-white opacity-20"></div>
              <li className="flex gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src="/icons/stats-up-square.svg"
                  alt="Survey"
                  width={16}
                  height={16}
                  className="invert brightness-0"
                />
                <p>Survey</p>
              </li>
            </ul>
          </PopoverContent>
        </Popover>

        <input
          className="flex h-10 pl-4 pr-4 items-center gap-4 flex-1 rounded-full bg-melting-glacier focus:outline-none text-base placeholder:text-input-placeholder text-black"
          value={content}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
          disabled={isDisabled}
        />
        <Button
          variant="icon"
          onClick={() => {
            if (content) {
              handleSend(content);
              setContent("");
            }
          }}
          icon={content === "" ? "mic" : "send"}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
}
