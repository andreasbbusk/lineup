"use client";

import Image from "next/image";
import GlassSurface from "./glass-surface";

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
			/** Custom className for additional styling */
			className?: string;
			/** Disabled state */
			disabled?: boolean;
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
			/** Custom className for additional styling */
			className?: string;
			/** Disabled state */
			disabled?: boolean;
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
	send: "/icons/send-diagonal.svg",
	"add-user": "/icons/add-user.svg",
	close: "/icons/close.svg",
};

const Button = (props: buttonProps) => {
	// Defined styles for each button type
	const variantStyles = {
		primary: ` ${
			props.glass
				? "gap-[0.25rem] flex-row-reverse flex justify-center items-center rounded-[1.5625rem] text-[var(--color-white)] text-nowrap hover:opacity-80"
				: "flex px-2.5 py-2 justify-center items-center gap-1.25 rounded-full bg-[var(--color-crocus-yellow)] hover:opacity-80"
		}`,
		secondary: ` ${
			props.glass
				? "flex-row-reverse flex px-2.5 py-1 justify-center items-center gap-1.25 rounded-full bg-[var(--color-crocus-yellow)] hover:opacity-80"
				: "flex px-2.5 py-1 justify-center items-center gap-2 rounded-[5.625rem] border border-[var(--color-grey)] text-[var(--color-grey)] hover:opacity-80"
		}`,
		icon: ` ${
			props.blank
				? "flex w-8 h-8 justify-center items-center gap-4 aspect-square rounded-[12.5rem] border border-[var(--color-black)] hover:opacity-80"
				: "flex w-8 h-8 p-1 justify-center items-center gap-4 aspect-square rounded-[12.5rem] bg-[var(--color-grey)]/70 hover:opacity-80"
		}`,
	};

	return (
		<>
			{props.glass && props.variant !== "secondary" && (
				<GlassSurface
					width={"100%"}
					height={40}
					refraction={0}
					dispersion={0}
					className="px-[30px] py-2 hover:opacity-80">
					<button
						className={`${variantStyles[props.variant]} cursor-pointer ${
							props.className ? ` ${props.className}` : ""
						}${props.disabled ? " opacity-50 cursor-not-allowed" : ""} hover:${
							props.pressed
						}`}
						type={props.type}
						onClick={props.onClick}
						disabled={props.disabled}>
						{props.icon ? (
							<Image
								src={iconPaths[props.icon]}
								alt=""
								width={16}
								height={16}
								className={
									(props.variant === "icon" && !props.blank) ||
									(props.variant === "primary" && props.glass)
										? "brightness-0 invert"
										: ""
								}
							/>
						) : null}
						{props.children}
					</button>
				</GlassSurface>
			)}
			{(!props.glass || (props.glass && props.variant === "secondary")) && (
				<button
					className={`${variantStyles[props.variant]} cursor-pointer ${
						props.className ? ` ${props.className}` : ""
					}${props.disabled ? " opacity-50 cursor-not-allowed" : ""}`}
					type={props.type}
					onClick={props.onClick}
					disabled={props.disabled}>
					{props.icon ? (
						<Image
							src={iconPaths[props.icon]}
							alt=""
							width={props.variant === "icon" ? 28 : 16}
							height={props.variant === "icon" ? 28 : 16}
							className={
								(props.variant === "icon" && !props.blank) ||
								(props.variant === "primary" && props.glass)
									? "brightness-0 invert"
									: ""
							}
						/>
					) : null}
					{props.children}
				</button>
			)}
		</>
	);
};

export { Button };
