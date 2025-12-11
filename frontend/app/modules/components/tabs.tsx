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
	className?: string;
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
	className?: string;
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
	className?: string;
};

type TabsProps = TabsPropsProfile | TabsPropsCreate | TabsPropsChat;

type TabsContentProps = {
	value: string;
	children: React.ReactNode;
	className?: string;
};

// Configuration for each variant
const TAB_CONFIGS = {
	profile: [
		{ id: "about", label: "About" },
		{ id: "notes", label: "Notes" },
	],
	chat: [
		{ id: "chats", label: "Chats" },
		{ id: "groups", label: "Groups" },
	],
	create: [
		{ id: "note", label: "Note" },
		{ id: "story", label: "Story" },
		{ id: "request", label: "Request" },
	],
} as const;

const TabsContent = ({ value, children, className }: TabsContentProps) => {
	return (
		<div
			className={`flex px-[0.9375rem] pt-2.5 pb-32.5 flex-col items-start gap-[1.875rem] self-stretch bg-white ${className}`}
			data-value={value}>
			{children}
		</div>
	);
};

// Divider component for two-tab layouts
const TabDivider = () => (
	<svg
		width="1"
		height="25"
		viewBox="0 0 1 25"
		fill="none"
		xmlns="http://www.w3.org/2000/svg">
		<line
			x1="0.5"
			y1="0.5"
			x2="0.499999"
			y2="24.5"
			stroke="#C9C9C9"
			strokeLinecap="round"
		/>
	</svg>
);

const Tabs = (props: TabsProps) => {
	const children = React.Children.toArray(props.children);
	const tabs = TAB_CONFIGS[props.variant];

	// Render active tab content
	const renderContent = () =>
		children.find(
			(child) =>
				React.isValidElement<TabsContentProps>(child) &&
				child.props.value === props.activeTab
		);

	// Two-tab layout (profile, chat)
	if (props.variant === "profile" || props.variant === "chat") {
		return (
			<div className={props.className}>
				<ul className="flex items-center rounded-tl-[2.8125rem] rounded-tr-[2.8125rem] bg-white">
					{tabs.map((tab, index) => (
						<React.Fragment key={tab.id}>
							<button
								onClick={() => props.onTabChange(tab.id as any)}
								className={`flex w-1/2 py-[0.9375rem] justify-center items-center gap-[0.3125rem] bg-white text-base font-medium transition-colors ${
									index === 0
										? "rounded-tl-[2.8125rem]"
										: "rounded-tr-[2.8125rem]"
								} ${
									props.activeTab === tab.id
										? "text-[var(--color-black)]"
										: "text-[var(--color-grey)]"
								}`}>
								{tab.label}
							</button>
							{index === 0 && <TabDivider />}
						</React.Fragment>
					))}
				</ul>
				<div>{renderContent()}</div>
			</div>
		);
	}

	// Three-tab layout (create)
	return (
		<div className={props.className}>
			<ul className="flex h-[2.25rem] px-[5.125rem] justify-center items-center gap-2">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => props.onTabChange(tab.id as any)}
						className={`flex h-[1.6875rem] px-3.5 py-[0.125rem] justify-center items-center gap-[0.625rem] rounded-[1.9375rem] transition-all ${
							props.activeTab === tab.id
								? "bg-[var(--color-crocus-yellow)]"
								: ""
						}`}>
						<span className="text-base font-medium">{tab.label}</span>
					</button>
				))}
			</ul>
			<div>{renderContent()}</div>
		</div>
	);
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
