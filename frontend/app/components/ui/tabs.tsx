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

type TabsProps = TabsPropsProfile | TabsPropsCreate;

type TabsContentProps = {
	value: string;
	children: React.ReactNode;
};

const TabsContent = ({ value, children }: TabsContentProps) => {
	return (
		<div
			className="flex px-[0.9375rem] pt-[0.625rem] pb-[8.125rem] flex-col items-start gap-[1.875rem] self-stretch bg-[var(--color-white)]"
			data-value={value}>
			{children}
		</div>
	);
};

const Tabs = (props: TabsProps) => {
	const children = React.Children.toArray(props.children);

	if (props.variant === "profile") {
		return (
			<div>
				<ul className="flex items-center rounded-tl-[2.8125rem] rounded-tr-[2.8125rem] bg-[var(--color-white)]">
					<button
						onClick={() => props.onTabChange("about")}
						className={`flex w-1/2 py-[0.9375rem] justify-center items-center gap-[0.3125rem]  rounded-tl-[2.8125rem] bg-[var(--color-white)] text-base font-medium transition-colors ${
							props.activeTab === "about"
								? "text-[var(--color-black)]"
								: "text-[var(--color-grey)]"
						}`}>
						About
					</button>
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
							stroke-linecap="round"
						/>
					</svg>
					<button
						onClick={() => props.onTabChange("notes")}
						className={`flex w-1/2 py-[0.9375rem] justify-center items-center gap-[0.3125rem] rounded-tr-[2.8125rem] bg-[var(--color-white)] text-base font-medium transition-colors ${
							props.activeTab === "notes"
								? "text-[var(--color-black)]"
								: "text-[var(--color-grey)]"
						}`}>
						Notes
					</button>
				</ul>
				<div>
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
	} else {
		// Create variant with 3 tabs
		return (
			<div>
				<ul className="flex h-[2.25rem] px-[5.125rem] justify-center items-center gap-2">
					<button
						onClick={() => props.onTabChange("note")}
						className={`flex w-[3.8125rem] h-[1.6875rem] pl-[0.875rem] pr-[0.625rem] py-[0.125rem] justify-center items-center gap-[0.625rem] rounded-[1.9375rem] transition-all ${
							props.activeTab === "note"
								? "bg-[var(--color-crocus-yellow)]"
								: ""
						}`}>
						<span className="text-base font-medium">Note</span>
					</button>
					<button
						onClick={() => props.onTabChange("story")}
						className={`flex w-[3.8125rem] h-[1.6875rem] pl-[0.875rem] pr-[0.625rem] py-[0.125rem] justify-center items-center gap-[0.625rem] rounded-[1.9375rem] transition-all ${
							props.activeTab === "story"
								? "bg-[var(--color-crocus-yellow)]"
								: ""
						}`}>
						<span className="text-base font-medium">Story</span>
					</button>
					<button
						onClick={() => props.onTabChange("request")}
						className={`flex w-[3.8125rem] h-[1.6875rem] pl-[0.875rem] pr-[0.625rem] py-[0.125rem] justify-center items-center gap-[0.625rem] rounded-[1.9375rem] transition-all ${
							props.activeTab === "request"
								? "bg-[var(--color-crocus-yellow)]"
								: ""
						}`}>
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
