function Divider({ long }: { long?: boolean }) {
	return (
		<div
			className={
				long
					? "w-full h-[0.0625rem] bg-black/14 self-end"
					: "w-[16.9375rem] h-[0.0625rem] bg-black/14 self-end"
			}></div>
	);
}

export { Divider };
