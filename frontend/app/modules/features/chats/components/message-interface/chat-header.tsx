import React from "react";
import { Avatar, getInitials } from "@/app/modules/components/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/modules/components/radix-popover";
import {
  EllipsisVertical,
  UserCircle,
  Ban,
  AlertCircle,
  ChevronLeft,
  Info,
  LogOut,
} from "lucide-react";
import type { Conversation } from "../../types";

type ChatHeaderProps = {
  conversationName?: string;
  conversationAvatar?: string | null;
  conversation?: Conversation;
  currentUserId?: string;
  onBack?: () => void;
  onMenuAction?: (action: string) => void;
};

type MenuOption = {
  icon: React.ElementType;
  label: string;
  action: string;
  destructive?: boolean;
  separator?: boolean;
};

const DM_MENU_OPTIONS: MenuOption[] = [
  { icon: UserCircle, label: "Go to profile", action: "profile" },
  { icon: Ban, label: "Block user", action: "block" },
  { icon: AlertCircle, label: "Report user", action: "report" },
];

const getGroupMenuOptions = (isCreator: boolean): MenuOption[] => {
  const options: MenuOption[] = [
    { icon: Info, label: "View Group Info", action: "groupInfo" },
  ];

  if (!isCreator) {
    options.push({
      icon: LogOut,
      label: "Leave Group",
      action: "leaveGroup",
      destructive: true,
      separator: true,
    });
  }

  return options;
};

export function ChatHeader({
  conversationName,
  conversationAvatar,
  conversation,
  currentUserId,
  onBack,
  onMenuAction,
}: ChatHeaderProps) {
  const isGroupChat = conversation?.type === "group";
  const isCreator = conversation?.createdBy === currentUserId;
  const menuOptions = isGroupChat
    ? getGroupMenuOptions(isCreator)
    : DM_MENU_OPTIONS;

  return (
    <div className="flex items-center gap-3 px-4 py-8 bg-dark-cyan-blue">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="text-white" />
        </button>
      )}
      <Avatar
        src={conversationAvatar}
        alt={conversationName || "Chat"}
        fallback={getInitials(
          conversationName?.split(" ")[0],
          conversationName?.split(" ")[1]
        )}
        size="lg"
        expandable={true}
        className="border border-white rounded-full"
      />
      <h2 className="text-lg font-semibold flex-1 text-white">
        {conversationName || "Chat"}
      </h2>
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors">
            <EllipsisVertical className="text-white" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" sideOffset={8}>
          <ul className="flex flex-col gap-2.5">
            {menuOptions.map((option, index) => (
              <React.Fragment key={option.label}>
                {option.separator && (
                  <div className="w-full h-px bg-white opacity-50" />
                )}
                {index > 0 && !option.separator && (
                  <div className="w-full h-px bg-white opacity-50" />
                )}
                <li
                  className={`flex gap-3 cursor-pointer hover:opacity-80 transition-opacity items-center ${
                    option.destructive ? "text-red-500" : ""
                  }`}
                  onClick={() => onMenuAction?.(option.action)}
                >
                  <option.icon className="size-4" />
                  <p>{option.label}</p>
                </li>
              </React.Fragment>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
