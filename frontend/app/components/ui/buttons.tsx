import Image from "next/image";

type buttonProps =
	| {
			/** Button type */
			type: "primary" | "secondary";
			/** Liquid glass effect */
			glass?: boolean;
			/** Button icon */
			icon?: string;
			/** Button pressed state */
			pressed?: boolean;
			/** Button text */
			children?: React.ReactNode;
	  }
	| {
			/** Button type */
			type: "icon";
			/** Liquid glass effect */
			glass?: boolean;
			/** Button icon */
			icon: string;
			/** Button pressed state */
			pressed?: boolean;
			/** Button text */
			children?: React.ReactNode;
	  };

const iconPaths: Record<string, string> = {
	"add-circle": "/icons/add-circle.svg",
	plus: "/icons/plus.svg",
	loading: "/icons/loading.svg",
	check: "/icons/check.svg",
	"chat-bubble": "/icons/chat-bubble.svg",
	mic: "/icons/mic.svg",
	"arrow-right": "/icons/arrow-right.svg",
	"arrow-left": "/icons/arrow-left.svg",
};

const Button = (props: buttonProps) => {
	// Defined styles for each button type
	const typeStyles = {
		primary: ` ${
			props.glass
				? props.pressed
					? "flex-row-reverse flex px-[2.375rem] py-2 flex-col justify-center items-center gap-2.5 rounded-[1.5625rem] bg-crocus-yellow/50 text-[var(--color-white)]"
					: "flex-row-reverse flex px-[2.375rem] py-2 flex-col justify-center items-center gap-2.5 rounded-[1.5625rem] bg-[var(--color-grey)]/30 text-[var(--color-white)]"
				: "flex px-2.5 py-2 items-center gap-[0.3125rem] rounded-full bg-[var(--color-crocus-yellow)]"
		}`,
		secondary: ` ${
			props.glass
				? "flex-row-reverse flex px-2.5 py-1 justify-center items-center gap-[0.3125rem] rounded-full bg-[var(--color-crocus-yellow)]"
				: "flex px-2.5 py-1 justify-center items-center gap-2 rounded-[5.625rem] border border-[var(--color-grey)] text-[var(--color-grey)]"
		}`,
		icon: `flex w-8 h-8 p-1 justify-center items-center gap-4 aspect-square rounded-[12.5rem] bg-[var(--color-grey)]/70 `,
	};

	return (
		<button
			className={`${typeStyles[props.type]}${props.glass ? " liquidGL" : ""}`}
			data-type={props.type}>
			<div className="content flex justify-center items-center gap-[0.5rem]">
				{props.icon ? (
					<Image
						src={iconPaths[props.icon]}
						alt=""
						width={16}
						height={16}
						className={
							props.type === "icon" || (props.type === "primary" && props.glass)
								? "brightness-0 invert"
								: ""
						}
					/>
				) : null}
				{props.children}
			</div>
		</button>
	);
};

export { Button };
