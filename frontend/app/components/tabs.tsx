"use client";

import React from "react";

type TabsPropsProfile = {
  /** Tabs variant */
  variant: "profile";
  /** Active tab */
  activeTab: "about" | "notes";
  /** Callback when tab is clicked */
  onTabChange: (tab: "about" | "notes") => void;
  /** Tab content */
  children: React.ReactNode;
};

type TabsPropsChat = {
  /** Tabs variant */
  variant: "chat";
  /** Active tab */
  activeTab: "chats" | "groups";
  /** Callback when tab is clicked */
  onTabChange: (tab: "chats" | "groups") => void;
  /** Tab content */
  children: React.ReactNode;
};

type TabsPropsCreate = {
  /** Tabs variant */
  variant: "create";
  /** Active tab */
  activeTab: "note" | "story" | "request";
  /** Callback when tab is clicked */
  onTabChange: (tab: "note" | "story" | "request") => void;
  /** Tab content */
  children: React.ReactNode;
};

type TabsProps = TabsPropsProfile | TabsPropsCreate | TabsPropsChat;

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  return (
    <div
      className={`h-full w-full overflow-y-auto overflow-x-hidden bg-white ${className}`}
      data-value={value}
    >
      {children}
    </div>
  );
};

const Tabs = (props: TabsProps) => {
  const children = React.Children.toArray(props.children);

  if (props.variant === "profile" || props.variant === "chat") {
    return (
      <div className="flex flex-col h-full">
        <ul className="flex items-center shrink-0 rounded-tl-[2.8125rem] rounded-tr-[2.8125rem] bg-white will-change-auto">
          <button
            onClick={() =>
              props.variant === "profile"
                ? props.onTabChange("about")
                : props.onTabChange("chats")
            }
            className={`flex w-1/2 py-3.75 justify-center items-center gap-1.25  rounded-tl-[2.8125rem] bg-white text-base font-medium transition-colors ${
              props.activeTab === "about" || props.activeTab === "chats"
                ? "text-black"
                : "text-grey"
            }`}
          >
            {props.variant === "profile" ? "About" : "Chats"}
          </button>
          <svg
            width="1"
            height="25"
            viewBox="0 0 1 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.5"
              y1="0.5"
              x2="0.499999"
              y2="24.5"
              stroke="#C9C9C9"
              strokeLinecap="round"
            />
          </svg>
          <button
            onClick={() =>
              props.variant === "profile"
                ? props.onTabChange("notes")
                : props.onTabChange("groups")
            }
            className={`flex w-1/2 py-3.75 justify-center items-center gap-1.25 rounded-tr-[2.8125rem] bg-white text-base font-medium transition-colors ${
              props.activeTab === "notes" || props.activeTab === "groups"
                ? "text-black"
                : "text-grey"
            }`}
          >
            {props.variant === "profile" ? "Notes" : "Groups"}
          </button>
        </ul>
        <div className="flex-1 min-h-0 relative">
          {children.map((child, index) => {
            if (
              React.isValidElement<TabsContentProps>(child) &&
              child.props.value === props.activeTab
            ) {
              return (
                <div key={index} className="absolute inset-0">
                  {child}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  } else {
    // Variant with 3 tabs
    return (
      <div>
        <ul className="flex h-9 px-20.5 justify-center items-center gap-2">
          <button
            onClick={() => props.onTabChange("note")}
            className={`flex w-15.25 h-6.75 pl-3.5 pr-2.5 py-0.5 justify-center items-center gap-2.5 rounded-[1.9375rem] transition-all ${
              props.activeTab === "note" ? "bg-crocus-yellow" : ""
            }`}
          >
            <span className="text-base font-medium">Note</span>
          </button>
          <button
            onClick={() => props.onTabChange("story")}
            className={`flex w-15.25 h-6.75 pl-3.5 pr-2.5 py-0.5 justify-center items-center gap-2.5 rounded-[1.9375rem] transition-all ${
              props.activeTab === "story" ? "bg-crocus-yellow" : ""
            }`}
          >
            <span className="text-base font-medium">Story</span>
          </button>
          <button
            onClick={() => props.onTabChange("request")}
            className={`flex w-15.25 h-6.75 pl-3.5 pr-2.5 py-0.5 justify-center items-center gap-2.5 rounded-[1.9375rem] transition-all ${
              props.activeTab === "request" ? "bg-crocus-yellow" : ""
            }`}
          >
            <span className="text-base font-medium">Request</span>
          </button>
        </ul>
        <div className="mt-4">
          {children.map((child) => {
            if (
              React.isValidElement<TabsContentProps>(child) &&
              child.props.value === props.activeTab
            ) {
              return child;
            }
            return null;
          })}
        </div>
      </div>
    );
  }
};

export { Tabs, TabsContent };

// Example usage:
{
  /* <Tabs variant="profile" activeTab={activeTab} onTabChange={setActiveTab}>
	<TabsContent value="about">About Me</TabsContent>
	<TabsContent value="notes">My notes</TabsContent>
</Tabs>;

<Tabs variant="chat" activeTab={activeTab} onTabChange={setActiveTab}>
	<TabsContent value="chats">Chats</TabsContent>
	<TabsContent value="groups">Groups</TabsContent>
</Tabs>;

<Tabs variant="create" activeTab={activeTab} onTabChange={setActiveTab}>
	<TabsContent value="note">Create a Note</TabsContent>
	<TabsContent value="story">Share Your Story</TabsContent>
	<TabsContent value="request">Submit a Request</TabsContent>
</Tabs>; */
}
