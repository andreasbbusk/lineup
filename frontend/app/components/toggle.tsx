type ToggleProps = {
	/** Toggle state */
	isOn: boolean;
	/** Callback when toggle is clicked */
	onToggle: () => void;
	/** Optional label for the toggle */
	label?: string;
	/** Disabled state */
	disabled?: boolean;
};

function Toggle(props: ToggleProps) {
	return (
		<div className="flex items-start  gap-2.5">
			<button
				onClick={props.onToggle}
				disabled={props.disabled}
				className={`flex w-[3.3125rem] items-center gap-2.5 rounded-[1.4375rem] border p-0.75 transition-all ${
					props.isOn
						? "justify-end border-crocus-yellow"
						: "justify-start border-grey"
				} ${props.disabled ? "cursor-not-allowed opacity-40" : ""}`}
				aria-pressed={props.isOn}
				aria-label={props.label}>
				<div
					className={`h-5 w-5 rounded-full transition-colors ${
						props.isOn ? "bg-crocus-yellow" : "bg-grey"
					}`}
				/>
			</button>
			{props.label && (
				<span
					className={`text-base font-normal leading-normal tracking-[0.03125rem] text-black ${
						props.disabled ? "opacity-40" : ""
					}`}>
					{props.label}
				</span>
			)}
		</div>
	);
}

export { Toggle };

// example usage:
// const [isOn, setIsOn] = useState(false);
// <Toggle isOn={isOn} onToggle={() => setIsOn(!isOn)} label="Enable feature" />
