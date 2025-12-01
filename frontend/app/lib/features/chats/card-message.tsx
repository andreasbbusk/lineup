import Image from "next/image";
import Link from "next/link";

type CardMessageProps = {
	/** Message content */
	content: string;
	/** Sender image */
	imgSrc: string;
	/** Message timestamp */
	timestamp: string;
	/** Sender name */
	name: string;
	/** Is message read
	 * @default false
	 */
	read?: boolean;
	/** Thread link */
	chatId: string;
};

function CardMessage({ read = false, ...props }: CardMessageProps) {
	return (
		<Link
			href={`/chats/${props.chatId}`}
			className="flex items-start gap-5 self-stretch">
			<Image
				src={props.imgSrc || "/default-avatar.png"}
				alt="Sender image"
				width={64}
				height={64}
				className="rounded-full border border-[var(--color-white)] aspect-square object-cover"
			/>
			<section className="flex w-full min-w-[9rem] h-16 flex-col justify-center items-start gap-2">
				<h3>{props.name}</h3>
				<p
					className={`${
						read ? "font-normal" : "font-bold"
					} truncate w-full overflow-hidden`}>
					{props.content}
				</p>
			</section>
			<span className="body-regular text-[var(--color-grey)] tracking-[0.03125rem] whitespace-nowrap">
				{props.timestamp}
			</span>
		</Link>
	);
}

export { CardMessage };
