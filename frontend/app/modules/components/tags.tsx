"use client";

import { CSSProperties, useState } from "react";

type TagsProps = {
	/** Tag text */
	text: string;
	/** Is tag selected (controlled) */
	selected?: boolean;
	/** OnClick event (controlled) */
	onClick?: () => void;
	/** Display hash symbol */
	hashTag?: boolean;
	/** Initial selected state (uncontrolled) */
	defaultSelected?: boolean;
	/** Tag color "use on profile":
	 * "default" | "grey" | "green" | "blue" | "purple" | "red" | "orange"
	 * default: "#1E1E1E",
		grey: "#575252",
		green: "#3F4D54",
		blue: "#3F4254",
		purple: "#4D3F54",
		red: "#543F40",
		orange: "#5D4C43",
	 */
	color?: string;
	className?: string;
};

function Tags(props: TagsProps) {
	// Internal state for uncontrolled mode
	const [internalSelected, setInternalSelected] = useState(
		props.defaultSelected ?? false
	);

	// Use controlled state if provided, otherwise use internal state
	const isControlled = props.selected !== undefined;
	const isSelected = isControlled ? props.selected : internalSelected;

	const handleClick = () => {
		if (props.onClick) {
			// Controlled mode - parent handles state
			props.onClick();
		} else {
			// Uncontrolled mode - component handles its own state
			setInternalSelected(!internalSelected);
		}
	};

	return (
		<div
			style={{ "--profile-theme": `${props.color}` } as CSSProperties}
			className={` ${
				props.hashTag === true ? "py-1 px-2" : "px-2.75 py-2"
			} inline-flex justify-center items-center rounded-[1.1875rem] border text-center font-medium leading-[100%] ${
				isSelected === true
					? "border-blackberry-harvest bg-blackberry-harvest text-white"
					: "border-gray-500 text-gray-500"
			}
			${
				props.color
					? "bg-(--profile-theme) text-white border-(--profile-theme)"
					: "hover:opacity-80"
			}
			${props.className ?? ""} `}
			onClick={handleClick}>
			{props.hashTag && "#"}
			{props.text}
		</div>
	);
}

export { Tags };

// Example usage:
// Uncontrolled (component manages its own state):
// <Tags text="Tag" />
// <Tags text="Tag" defaultSelected={true} />
//
// Controlled (parent manages state):
// <Tags text="Tag" selected={isSelected} onClick={() => setIsSelected(!isSelected)} />
