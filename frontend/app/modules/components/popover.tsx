import Image from "next/image";

type PopoverProps = {
	/** Popover variant */
	variant:
		| "my-profile"
		| "message"
		| "profile-actions"
		| "other-profile"
		| "note";
	/** Optional additional class names for styling, used for placement */
	className?: string;
};

type PopoverItem = {
	icon: string;
	label: string;
	alt?: string;
};

const popoverConfigs: Record<PopoverProps["variant"], PopoverItem[]> = {
	"other-profile": [
		{ icon: "/icons/share-ios.svg", label: "Share profile" },
		{ icon: "/icons/remove-user.svg", label: "Disconnect" },
		{ icon: "/icons/delete-circle.svg", label: "Block user" },
		{ icon: "/icons/chat-bubble-warning.svg", label: "Report user" },
	],
	message: [
		{ icon: "/icons/camera.svg", label: "Attach a picture" },
		{ icon: "/icons/attachment.svg", label: "Attach a file" },
		{ icon: "/icons/pin-alt.svg", label: "Share location" },
		{ icon: "/icons/stats-up-square.svg", label: "Survey" },
	],
	"profile-actions": [
		{ icon: "/icons/user-circle.svg", label: "Go to profile" },
		{ icon: "/icons/delete-circle.svg", label: "Block user" },
		{ icon: "/icons/chat-bubble-warning.svg", label: "Report user" },
	],
	"my-profile": [
		{ icon: "/icons/bookmark-empty.svg", label: "Saved" },
		{ icon: "/icons/hourglass.svg", label: "Archived" },
	],
	note: [
		{ icon: "/icons/bookmark-empty.svg", label: "Save note" },
		{ icon: "/icons/share-ios.svg", label: "Share note" },
		{ icon: "/icons/eye-empty.svg", label: "Hide notes from this user" },
		{ icon: "/icons/chat-bubble-warning.svg", label: "Report note" },
	],
};

function Popover(props: PopoverProps) {
	const items = popoverConfigs[props.variant];

	return (
		<ul
			className={`${props.className} w-fit text-white flex p-3 flex-col justify-center gap-2 rounded-[1.5625rem] bg-[rgba(108,108,108)] shadow-lg`}>
			{items.map((item, index) => (
				<>
					<li key={item.label} className="flex gap-2">
						<Image
							src={item.icon}
							alt={item.alt || item.label}
							width={16}
							height={16}
							className="invert brightness-0"
						/>
						<p>{item.label}</p>
					</li>
					{index < items.length - 1 && (
						<div className="w-full h-px bg-white"></div>
					)}
				</>
			))}
		</ul>
	);
}

export { Popover };
