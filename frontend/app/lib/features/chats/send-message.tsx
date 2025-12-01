import { Button } from "../../../components/ui/buttons";

type sendMessageProps = {
	/** Input value */
	value: string;
	/** OnSend event */
	onSend: (message: string) => void;
	/** OnChange event */
	onChange: (value: string) => void;
};

function SendMessage(props: sendMessageProps) {
	return (
		<div className="flex w-[22.0625rem] justify-center items-center gap-2">
			<Button
				variant="icon"
				onClick={() => {
					props.onSend(props.value);
					props.onChange("");
				}}
				icon="plus"
			/>
			<input
				className="flex h-8 pl-2 pr-2.5 items-center gap-4 flex-1 rounded-[0.5625rem] bg-[var(--color-grey)]/20"
				value={props.value}
				onChange={(e) => props.onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						props.onSend(props.value);
						props.onChange("");
					}
				}}
				placeholder="Aa"
			/>
			<Button
				variant="icon"
				onClick={() => {
					props.onSend(props.value);
					props.onChange("");
				}}
				icon={props.value === "" ? "mic" : "send"}
			/>
		</div>
	);
}
export { SendMessage };
