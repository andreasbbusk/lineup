type TagsProps = {
	/** Tag text */
	text: string;
	/** Is tag selected */
	selected: boolean;
	/** OnClick event */
	onClick: () => void;
};

function Tags(props: TagsProps) {
	return (
		<div
			className={`inline-flex px-[0.6875rem] py-2 justify-center items-center rounded-[1.1875rem] border text-center font-medium leading-[100%] ${
				props.selected === true
					? "border-[var(--color-blackberry-harvest)] bg-[var(--color-blackberry-harvest)] text-[var(--color-white)]"
					: "border-[var(--color-grey)] text-[var(--color-grey)]"
			}`}
			onClick={props.onClick}>
			{props.text}
		</div>
	);
}

export { Tags };

// Example usage:
{
	/* <Tags
	text="Tag"
	selected={isSelected}
	onClick={() => setIsSelected(!isSelected)}
/>; */
}
