"use client";

import { useState } from "react";
import type { PostResponse } from "../types";

interface MediaGridProps {
	media?: PostResponse["media"];
	className?: string;
	showLightbox?: boolean;
}

export function MediaGrid({
	media,
	className = "",
	showLightbox = false,
}: MediaGridProps) {
	const [selectedMedia, setSelectedMedia] = useState<number | null>(null);
	const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

	if (!media || media.length === 0) return null;

	// Sort by displayOrder
	const sortedMedia = [...media].sort(
		(a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
	);

	const handleMediaClick = (index: number) => {
		if (showLightbox) {
			setSelectedMedia(index);
		}
	};

	const closeLightbox = () => {
		setSelectedMedia(null);
	};

	// Helper to determine if URL is a blob URL
	const isBlobUrl = (url: string) => url.startsWith("blob:");

	// Helper to handle image errors
	const handleImageError = (
		url: string,
		e: React.SyntheticEvent<HTMLImageElement, Event>
	) => {
		if (!failedImages.has(url)) {
			setFailedImages((prev) => new Set(prev).add(url));
			// Only log if it's not a blob URL (blob URLs might fail if revoked)
			if (!isBlobUrl(url)) {
				console.error("Failed to load image:", url);
			}
		}
		const target = e.target as HTMLImageElement;
		target.style.display = "none";
	};

	// Single media item
	if (sortedMedia.length === 1) {
		const item = sortedMedia[0];
		return (
			<>
				<div className={`relative min-h-[200px] ${className}`}>
					{item.type === "image" ? (
						<>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={item.url}
								alt="Post media"
								className="px-2.5 flex w-full justify-center items-center gap-2.5 rounded-[1.5625rem] object-cover"
								onClick={() => handleMediaClick(0)}
								style={{
									cursor: showLightbox ? "pointer" : "default",
									minHeight: "200px",
								}}
								onError={(e) => handleImageError(item.url, e)}
								{...(!isBlobUrl(item.url) && { crossOrigin: "anonymous" })}
								loading="lazy"
							/>
						</>
					) : (
						<video
							src={item.url}
							controls
							className="w-full rounded-lg"
							poster={item.thumbnailUrl || undefined}
						/>
					)}
				</div>
				{showLightbox && selectedMedia === 0 && (
					<MediaLightbox
						media={sortedMedia}
						currentIndex={0}
						onClose={closeLightbox}
						onNext={() => setSelectedMedia(null)} // Only one item
						onPrev={() => setSelectedMedia(null)}
					/>
				)}
			</>
		);
	}

	// Multiple media items - grid layout
	if (sortedMedia.length === 2) {
		return (
			<>
				<div className={`grid grid-cols-2 gap-2 ${className}`}>
					{sortedMedia.map((item, index) => (
						<div key={item.id} className="relative aspect-square">
							{item.type === "image" ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={item.url}
									alt={`Media ${index + 1}`}
									className="absolute inset-0 h-full w-full rounded-lg object-cover"
									onClick={() => handleMediaClick(index)}
									style={{ cursor: showLightbox ? "pointer" : "default" }}
									onError={(e) => handleImageError(item.url, e)}
									{...(!isBlobUrl(item.url) && { crossOrigin: "anonymous" })}
								/>
							) : (
								<video
									src={item.url}
									controls
									className="h-full w-full rounded-lg object-cover"
									poster={item.thumbnailUrl || undefined}
								/>
							)}
						</div>
					))}
				</div>
				{showLightbox && selectedMedia !== null && (
					<MediaLightbox
						media={sortedMedia}
						currentIndex={selectedMedia}
						onClose={closeLightbox}
						onNext={() =>
							setSelectedMedia(
								selectedMedia < sortedMedia.length - 1 ? selectedMedia + 1 : 0
							)
						}
						onPrev={() =>
							setSelectedMedia(
								selectedMedia > 0 ? selectedMedia - 1 : sortedMedia.length - 1
							)
						}
					/>
				)}
			</>
		);
	}

	// 3 or 4 media items - special grid
	return (
		<>
			<div className={`grid grid-cols-2 gap-2 ${className}`}>
				{sortedMedia.slice(0, 3).map((item, index) => (
					<div
						key={item.id}
						className={`relative ${
							index === 0 && sortedMedia.length > 3 ? "row-span-2" : ""
						} aspect-square`}>
						{item.type === "image" ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={item.url}
								alt={`Media ${index + 1}`}
								className="absolute inset-0 h-full w-full rounded-lg object-cover"
								onClick={() => handleMediaClick(index)}
								style={{ cursor: showLightbox ? "pointer" : "default" }}
								onError={(e) => handleImageError(item.url, e)}
								{...(!isBlobUrl(item.url) && { crossOrigin: "anonymous" })}
							/>
						) : (
							<video
								src={item.url}
								controls
								className="h-full w-full rounded-lg object-cover"
								poster={item.thumbnailUrl || undefined}
							/>
						)}
						{index === 2 && sortedMedia.length > 3 && (
							<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-white">
								<span className="text-2xl font-bold">
									+{sortedMedia.length - 3}
								</span>
							</div>
						)}
					</div>
				))}
				{sortedMedia.length > 3 && (
					<div
						className="relative aspect-square cursor-pointer"
						onClick={() => handleMediaClick(3)}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={sortedMedia[3].url}
							alt="Media 4"
							className="absolute inset-0 h-full w-full rounded-lg object-cover"
							onError={(e) => handleImageError(sortedMedia[3].url, e)}
							{...(!isBlobUrl(sortedMedia[3].url) && {
								crossOrigin: "anonymous",
							})}
						/>
						{sortedMedia.length > 4 && (
							<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-white">
								<span className="text-2xl font-bold">
									+{sortedMedia.length - 4}
								</span>
							</div>
						)}
					</div>
				)}
			</div>
			{showLightbox && selectedMedia !== null && (
				<MediaLightbox
					media={sortedMedia}
					currentIndex={selectedMedia}
					onClose={closeLightbox}
					onNext={() =>
						setSelectedMedia(
							selectedMedia < sortedMedia.length - 1 ? selectedMedia + 1 : 0
						)
					}
					onPrev={() =>
						setSelectedMedia(
							selectedMedia > 0 ? selectedMedia - 1 : sortedMedia.length - 1
						)
					}
				/>
			)}
		</>
	);
}

// Lightbox component for viewing media in full screen
function MediaLightbox({
	media,
	currentIndex,
	onClose,
	onNext,
	onPrev,
}: {
	media: PostResponse["media"];
	currentIndex: number;
	onClose: () => void;
	onNext: () => void;
	onPrev: () => void;
}) {
	if (!media || media.length === 0) return null;

	const currentMedia = media[currentIndex];

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
			onClick={onClose}>
			<button
				onClick={onClose}
				className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
				aria-label="Close">
				×
			</button>
			{media.length > 1 && (
				<>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onPrev();
						}}
						className="absolute left-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
						aria-label="Previous">
						‹
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onNext();
						}}
						className="absolute right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
						aria-label="Next">
						›
					</button>
				</>
			)}
			<div
				className="relative max-h-[90vh] max-w-[90vw]"
				onClick={(e) => e.stopPropagation()}>
				{currentMedia.type === "image" ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={currentMedia.url}
						alt={`Media ${currentIndex + 1}`}
						className="max-h-[90vh] max-w-[90vw] object-contain"
					/>
				) : (
					<video
						src={currentMedia.url}
						controls
						className="max-h-[90vh] max-w-[90vw]"
						poster={currentMedia.thumbnailUrl || undefined}
					/>
				)}
			</div>
			{media.length > 1 && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
					{currentIndex + 1} / {media.length}
				</div>
			)}
		</div>
	);
}
