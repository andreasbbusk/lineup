type messageProps = {
	/** Message content */
	content: string;
	/** Message sender */
	sender: "self" | "other";
};

function Message(props: messageProps) {
	return (
		<div
			className={`flex max-w-[16.5rem] px-3.5 py-2.5 items-center gap-4 ${
				props.sender === "self"
					? "justify-center self-start rounded-[1.25rem_1.25rem_0_1.25rem] bg-[var(--color-dark-cyan-blue)] font-normal text-base tracking-[0.03125rem] leading-normal text-[var(--color-white)]"
					: "justify-center self-end rounded-[1.25rem_1.25rem_1.25rem_0] bg-[var(--color-black)]/10 text-[var(--color-black)] font-normal text-base tracking-[0.03125rem] leading-normal"
			}`}>
			{props.content}
		</div>
	);
}

export { Message };
