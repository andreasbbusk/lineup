import Image from "next/image";

type messageProps = {
	/** Message content */
	content: string;
	/** Message sender */
	sender: "self" | "other";
	/** Sender image */
	imgSrc?: string;
};

function Message(props: messageProps) {
	return (
		<>
			{props.sender === "other" ? (
				<div className="flex items-end gap-2 ">
					{props.sender === "other" && props.imgSrc && (
						<Image
							src={props.imgSrc}
							alt="Sender image"
							width={32}
							height={32}
							className="rounded-full"
						/>
					)}
					<div
						className={`flex max-w-[16.5rem] px-3.5 py-2.5 items-center gap-4 justify-center self-start rounded-[1.25rem_1.25rem_1.25rem_0] bg-[var(--color-black)]/10 text-[var(--color-black)] font-normal text-base tracking-[0.03125rem] leading-normal`}>
						{props.content}
					</div>
				</div>
			) : (
				<div
					className={`flex max-w-[16.5rem] px-3.5 py-2.5 items-center gap-4 justify-center self-end rounded-[1.25rem_1.25rem_0_1.25rem] bg-[var(--color-dark-cyan-blue)] font-normal text-base tracking-[0.03125rem] leading-normal text-[var(--color-white)]`}>
					{props.content}
				</div>
			)}
		</>
	);
}

export { Message };

// Example usage:
{
	/* <Message
		sender="self"
		content="Welcome to LineUp!"
	/>
	
	<Message
		sender="other"
		content="Welcome to LineUp! Welcome to LineUp! Welcome to LineUp! Welcome to LineUp!"
		imgSrc="/avatars/cd5ba1b2b51aa23578ec39ca57088f729c806336.webp"
	/> */
}
