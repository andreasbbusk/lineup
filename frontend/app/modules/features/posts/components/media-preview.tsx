"use client";

import { Button } from "@/app/modules/components/buttons";
import { UploadedMedia } from "../types";

interface MediaPreviewProps {
	media: UploadedMedia[];
	onRemove: (index: number) => void;
	maxItems?: number;
}

export function MediaPreview({
	media,
	onRemove,
	maxItems = 4,
}: MediaPreviewProps) {
	if (media.length === 0) return null;

	return (
		<div className="">
			{media.slice(0, maxItems).map((item, index) => (
				<div
					key={index}
					className="relative w-full rounded-[25px] overflow-hidden bg-gray-100">
					{item.type === "image" ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={item.url}
							alt={`Media ${index + 1}`}
							className="h-full w-full object-cover"
						/>
					) : (
						<video
							src={item.url}
							className="h-full w-full object-cover"
							controls
						/>
					)}
					<Button
						variant="primary"
						onClick={() => onRemove(index)}
						className="absolute bottom-2 right-2"
						aria-label="Remove media">
						Remove
					</Button>
				</div>
			))}
		</div>
	);
}
