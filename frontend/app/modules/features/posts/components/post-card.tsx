"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostResponse } from "../types";
import { MediaGrid } from "./media-grid";
import { Avatar } from "@/app/modules/components/avatar";
import { Tags } from "@/app/modules/components/tags";
import { ActionBar } from "./action-bar";
import { Divider } from "../../profiles/components/edit/divider";
import { Button } from "@/app/modules/components/buttons";
import { Comments } from "./comments";
import { Popover } from "@/app/modules/components/popover";

interface PostCardProps {
	post: PostResponse & {
		commentsCount?: number;
		likesCount?: number;
		bookmarksCount?: number;
		hasLiked?: boolean;
		hasBookmarked?: boolean;
	};
	compact?: boolean;
}

function formatDate(dateString: string | null, now: Date): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "just now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
}

// Client-only date formatter to prevent hydration mismatches
function RelativeDate({ dateString }: { dateString: string | null }) {
	const [mounted, setMounted] = useState(false);
	const [formattedDate, setFormattedDate] = useState<string>("");

	useEffect(() => {
		setMounted(true);
		const updateDate = () => {
			setFormattedDate(formatDate(dateString, new Date()));
		};
		updateDate();
		// Update every minute for relative times
		const interval = setInterval(updateDate, 60000);
		return () => clearInterval(interval);
	}, [dateString]);

	// During SSR and initial render, show a stable format
	if (!mounted || !dateString) {
		const date = dateString ? new Date(dateString) : null;
		if (date) {
			return (
				<span suppressHydrationWarning>
					{date.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					})}
				</span>
			);
		}
		return <span suppressHydrationWarning></span>;
	}

	return <span suppressHydrationWarning>{formattedDate}</span>;
}

export function PostCard({ post, ...props }: PostCardProps) {
	const author = post.author;
	const type = post.type;

	const [isLiked, setIsLiked] = useState(false);
	const [isCommentOpen, setIsCommentOpen] = useState(false);
	const [showOption, setShowOption] = useState(false);

	return type === "note" ? (
		<article className="relative bg-white p-4">
			<Image
				onClick={() => setShowOption(!showOption)}
				src="/icons/more.svg"
				alt="More options"
				width={24}
				height={24}
				className="absolute right-2 top-2"
			/>
			{showOption && (
				<Popover className="absolute right-2 top-8 z-100" variant="note" />
			)}
			{/* Author Header */}
			<div className="mb-3 px-2.5 flex items-center gap-1.25">
				<div className="flex flex-row items-center gap-1.25">
					<div className="flex space-x-2">
						<Link href={`/users/${author?.id}`}>
							<Avatar
								size="xs"
								fallback={(author?.firstName ||
									author?.username ||
									"U")[0].toUpperCase()}
								src={author?.avatarUrl}
								alt={author?.username || "User avatar"}
							/>
						</Link>
						{post.taggedUsers?.map((user, idx) => (
							<Link href={`/users/${user.id}`} key={user.id || idx}>
								<Avatar
									key={user.id || idx}
									size="xs"
									fallback={(user?.firstName ||
										user?.username ||
										"U")[0].toUpperCase()}
									src={user?.avatarUrl}
									alt={user?.username || "User avatar"}
								/>
							</Link>
						))}
					</div>
					<p className="text-xs text-gray-500">
						{(() => {
							const names = [
								author?.firstName || author?.username || "User",
								...(post.taggedUsers?.map(
									(u) => u.firstName || u.username || "User"
								) || []),
							];
							if (names.length === 1) return names[0];
							if (names.length === 2) return ` ${names[0]} and ${names[1]}`;
							return `${names.slice(0, -1).join(", ")} and ${
								names[names.length - 1]
							}`;
						})()}
					</p>
				</div>
				<Tags hashTag text="dummy" className="text-xs" />
			</div>

			{/* Post Content */}
			<div>
				<h2 className="px-2.5 mb-2 text-lg font-semibold hover:underline">
					{post.title}
				</h2>

				{/* Media Preview */}
				{post.media && post.media.length > 0 && (
					<div className="mb-3">
						<MediaGrid media={post.media} showLightbox={false} />
					</div>
				)}

				<p className="mb-3 px-2.5 line-clamp-3 text-gray-600">
					{post.description}
				</p>
				<ActionBar
					setIsLiked={setIsLiked}
					isLiked={isLiked}
					isCommentOpen={isCommentOpen}
					setIsCommentOpen={setIsCommentOpen}
					commentsCount={post.commentsCount}
					likesCount={post.likesCount}
				/>
				{isCommentOpen && <Comments />}
			</div>
		</article>
	) : props.compact ? (
		<article className="flex p-3.75 flex-col w-85 justify-center gap-2.5 bg-white rounded-(--Corner-Radius-M---Corner-Radius,1.5625rem) shadow-sm">
			<div className="flex justify-between self-stretch">
				<div className="flex gap-1.25 flex-[1_0_0] text-xs text-gray-500 items-center">
					<Link
						href={`/users/${author?.id}`}
						className="flex flex-row items-center gap-1.25">
						<Avatar
							size="xs"
							fallback={(author?.firstName ||
								author?.username ||
								"U")[0].toUpperCase()}
							src={author?.avatarUrl}
							alt={author?.username || "User avatar"}
						/>
						<p className="text-gray-700">
							{author?.firstName || author?.username || "User"}
						</p>
					</Link>
					<p>looking for a #guitarist</p>
				</div>
			</div>
			<Divider long />
			<h3 className="px-2.5 text-base font-semibold">{post.title}</h3>
			<p className="px-2.5 line-clamp-4 text-gray-600">{post.description}</p>
			<div className="flex self-stretch gap-[0.625rem] items-end">
				<Link
					href={`/posts/${post.id}`}
					className="text-[#555] text-xs font-bold">
					Read more
				</Link>
				<div className="flex justify-end gap-[0.3125rem] flex-[1-0-0] text-sm text-gray-400">
					<p>{post.location}</p>
					{post.location && <span> - </span>}
					<p>
						<RelativeDate dateString={post.createdAt} />
					</p>
				</div>
			</div>
		</article>
	) : (
		<article className="flex p-3.75 flex-col w-full justify-center gap-[0.625rem] bg-white rounded-(--Corner-Radius-M---Corner-Radius,1.5625rem) shadow-sm">
			<div className="flex justify-between self-stretch items-center">
				<div className="flex gap-1.25 flex-[1_0_0] text-gray-500 items-center">
					<Link
						href={`/users/${author?.id}`}
						className="flex flex-row items-center gap-1.25">
						<Avatar
							size="sm"
							fallback={(author?.firstName ||
								author?.username ||
								"U")[0].toUpperCase()}
							src={author?.avatarUrl}
							alt={author?.username || "User avatar"}
						/>
						<p className="text-gray-700">
							{author?.firstName || author?.username || "User"}
						</p>
					</Link>
					<p>looking for a #guitarist</p>
				</div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="20"
					viewBox="0 0 16 20"
					fill="none">
					<path
						d="M0.75 18.75V2.75C0.75 1.64543 1.64543 0.75 2.75 0.75H12.75C13.8546 0.75 14.75 1.64543 14.75 2.75V18.75L8.83152 14.9453C8.1727 14.5217 7.3273 14.5217 6.66848 14.9453L0.75 18.75Z"
						stroke="#131927"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<Divider long />
			<h3 className="px-2.5 text-base font-semibold">{post.title}</h3>
			<div className="flex px-1.25 justify-between items-center self-stretch">
				<div className="flex items-center gap-1.25">
					{post.type === "request" && post.paidOpportunity && (
						<Tags hashTag text="paid-gig" />
					)}
					<Tags hashTag text="dummy" />
				</div>
				<div className="flex justify-end gap-1.25 text-gray-500">
					<p>{post.location}</p>
					{post.location && <span> - </span>}
					<p>
						<RelativeDate dateString={post.createdAt} />
					</p>
				</div>
			</div>
			<p className="px-2.5 line-clamp-4 text-gray-600">{post.description}</p>
			<div className="px-2.5 flex self-stretch gap-2.5 items-center justify-between">
				<Link href={`/posts/${post.id}`} className="text-[#555] font-bold">
					Read more
				</Link>
				<Button
					variant="primary"
					icon="chat-bubble"
					onClick={() => {
						console.log("Start chat");
					}}>
					Start a chat
				</Button>
			</div>
		</article>
	);
}
