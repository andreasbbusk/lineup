"use client";

import { useState } from "react";

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
			className={`inline-flex px-[0.6875rem] py-2 justify-center items-center rounded-[1.1875rem] border text-center font-medium leading-[100%] ${
				isSelected === true
					? "border-[var(--color-blackberry-harvest)] bg-[var(--color-blackberry-harvest)] text-[var(--color-white)]"
					: "border-[var(--color-grey)] text-[var(--color-grey)]"
			}`}
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
