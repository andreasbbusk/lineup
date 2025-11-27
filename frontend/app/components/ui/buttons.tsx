"use client";

import Image from "next/image";

type buttonProps =
	| {
			/** Button type */
			type?: "button" | "submit" | "reset";
			/** Button variant */
			variant: "primary" | "secondary";
			/** Liquid glass effect */
			glass?: boolean;
			/** Not to be used here
			 * Blank button */
			blank?: boolean;
			/** Button icon:
			 * add-circle | plus | loading | check | chat-bubble | mic | arrow-right | arrow-left
			 */
			icon?: string;
			/** Button pressed state */
			pressed?: boolean;
			/** Button text */
			children?: React.ReactNode;
			/** OnClick event */
			onClick: () => void;
	  }
	| {
			/** Button type */
			type?: "button" | "submit" | "reset";
			/** Button variant */
			variant: "icon";
			/** Not to be used here
			 * Liquid glass effect */
			glass?: boolean;
			/** Blank button */
			blank?: boolean;
			/** Button icon:
			 * add-circle | plus | loading | check | chat-bubble | mic | arrow-right | arrow-left
			 */
			icon: string;
			/** Button pressed state */
			pressed?: boolean;
			/** Button text */
			children?: React.ReactNode;
			/** OnClick event */
			onClick: () => void;
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
	const variantStyles = {
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
		icon: ` ${
			props.blank
				? "flex w-8 h-8 justify-center items-center gap-4 aspect-square rounded-[12.5rem] border border-[var(--color-black)]`"
				: "flex w-8 h-8 p-1 justify-center items-center gap-4 aspect-square rounded-[12.5rem] bg-[var(--color-grey)]/70 "
		}`,
	};

	return (
		<button
			className={`${variantStyles[props.variant]}${
				props.glass ? " liquidGL" : ""
			} flex-1`}
			type={props.type}
			onClick={props.onClick}>
			<div className="content flex justify-center items-center gap-[0.5rem] w-full">
				{props.icon ? (
					<Image
						src={iconPaths[props.icon]}
						alt=""
						width={24}
						height={24}
						className={
							(props.variant === "icon" && !props.blank) ||
							(props.variant === "primary" && props.glass)
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
