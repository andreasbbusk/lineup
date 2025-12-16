"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import type { SearchTab } from "../types";
import { TAB_ORDER, TAB_LABELS } from "../constants";

interface SearchTabsProps {
	activeTab: SearchTab;
	onTabChange: (tab: SearchTab) => void;
}

function SearchTabsComponent({ activeTab, onTabChange }: SearchTabsProps) {
	const handleTabClick = useCallback(
		(tab: SearchTab) => {
			onTabChange(tab);
		},
		[onTabChange]
	);

	return (
		<div className="w-full overflow-x-auto no-scrollbar">
			<div className="flex items-center gap-4 min-w-max relative">
				{TAB_ORDER.map((tab) => (
					<button
						key={tab}
						onClick={() => handleTabClick(tab)}
						className={`text-sm font-medium transition-colors whitespace-nowrap pb-2 relative ${
							activeTab === tab
								? "text-black"
								: "text-black/60 hover:text-black/80"
						}`}>
						{TAB_LABELS[tab]}
						{activeTab === tab && (
							<motion.div
								layoutId="activeTabIndicator"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
								transition={{
									type: "spring",
									stiffness: 380,
									damping: 30,
								}}
							/>
						)}
					</button>
				))}
			</div>
		</div>
	);
}

export const SearchTabs = memo(SearchTabsComponent);
