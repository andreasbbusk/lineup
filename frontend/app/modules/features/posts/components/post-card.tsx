"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostResponse } from "../types";
import { MediaGrid } from "./media-grid";
import { Avatar } from "@/app/modules/components/avatar";
import { Tags } from "@/app/modules/components/tags";
import { ActionBar } from "./action-bar";
import { Divider } from "../../profiles/components/edit/divider";
import { Comments } from "./comments";
import { Popover } from "@/app/modules/components/popover";
import { cn } from "@/app/modules/utils/twUtil";
import { Button } from "@/app/modules/components/buttons";
import { likePost, unlikePost } from "@/app/modules/api/postsApi";
import { useQueryClient } from "@tanstack/react-query";
import { NOTIFICATION_QUERY_KEYS } from "@/app/modules/features/notifications";
import { createBookmark, deleteBookmark } from "@/app/modules/api/bookmarksApi";

interface PostCardProps {
	className?: string;
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

// Shared time store - only one interval for all components
const timeSubscribers = new Set<() => void>();
let timeInterval: NodeJS.Timeout | null = null;

function subscribeToTime(callback: () => void) {
	timeSubscribers.add(callback);

	if (!timeInterval) {
		timeInterval = setInterval(() => {
			timeSubscribers.forEach((cb) => cb());
		}, 60000);
	}

	return () => {
		timeSubscribers.delete(callback);
		if (timeSubscribers.size === 0 && timeInterval) {
			clearInterval(timeInterval);
			timeInterval = null;
		}
	};
}

function RelativeDate({ dateString }: { dateString: string | null }) {
	const formattedDate = useSyncExternalStore(
		subscribeToTime,
		() => (dateString ? formatDate(dateString, new Date()) : ""),
		() => {
			if (!dateString) return "";
			const date = new Date(dateString);
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
		}
	);

	return <span>{formattedDate}</span>;
}

export function PostCard({ post, className = "", ...props }: PostCardProps) {
	const author = post.author;
	const type = post.type;
	const queryClient = useQueryClient();

	const [isLiked, setIsLiked] = useState(post.hasLiked ?? false);
	const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
	const [isBookmarked, setIsBookmarked] = useState(post.hasBookmarked ?? false);
	const [isCommentOpen, setIsCommentOpen] = useState(false);
	const [showOption, setShowOption] = useState(false);

	return type === "note" ? (
		<article
			className={cn(
				"relative bg-white py-4 w-full max-w-200 self-center",
				className
			)}>
			<Image
				onClick={() => setShowOption(!showOption)}
				src="/icons/more.svg"
				alt="More options"
				width={24}
				height={24}
				className="absolute right-2 top-2"
			/>
			{showOption && (
				<Popover
					className="absolute right-2 top-8 z-100"
					variant="note"
					onBookmarkClick={async () => {
						const newBookmarked = !isBookmarked;
						setIsBookmarked(newBookmarked);
						setShowOption(false);
						try {
							if (newBookmarked) {
								await createBookmark(post.id);
							} else {
								await deleteBookmark(post.id);
							}
						} catch {
							// Revert on error
							setIsBookmarked(!newBookmarked);
						}
					}}
					isBookmarked={isBookmarked}
				/>
			)}
			{/* Author Header */}
			<div className="mb-3 px-2.5 flex items-center gap-1.25">
				<Authors
					author={author}
					post={post}
					size={"xs"}
					compact={props.compact}
				/>
			</div>

			{/* Post Content */}
			<div>
				<h2 className="px-2.5 mb-2 text-lg font-semibold">{post.title}</h2>

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
					setIsLiked={async (liked: boolean) => {
						setIsLiked(liked);
						setLikesCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
						try {
							if (liked) {
								await likePost(post.id);
								// Invalidate notification queries when liking (creates notification for post author)
								// This includes unread count since unreadCount key starts with ["notifications"]
								queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all, exact: false });
							} else {
								await unlikePost(post.id);
							}
						} catch {
							// Revert on error
							setIsLiked(!liked);
							setLikesCount((prev) =>
								liked ? Math.max(0, prev - 1) : prev + 1
							);
						}
					}}
					isLiked={isLiked}
					isCommentOpen={isCommentOpen}
					setIsCommentOpen={setIsCommentOpen}
					commentsCount={post.commentsCount}
					likesCount={likesCount}
				/>
				{isCommentOpen && <Comments postId={post.id} />}
			</div>
		</article>
	) : props.compact ? (
		<article className="flex p-3.75 flex-col w-85 h-[238px] justify-center gap-2.5 bg-white rounded-(--Corner-Radius-M---Corner-Radius,1.5625rem) shadow-sm">
			<div className="flex justify-between self-stretch">
				<Authors
					author={author}
					post={post}
					size={"xs"}
					compact={props.compact}
				/>
			</div>
			<Divider />
			<h3 className="px-2.5 text-base font-semibold">{post.title}</h3>
			<p className="h-full px-2.5 line-clamp-4 text-gray-600">
				{post.description}
			</p>
			<div className="flex self-stretch gap-2.5 items-end">
				<Link
					href={`/posts/${post.id}`}
					className="text-[#555] text-xs font-bold">
					Read more
				</Link>
				<div className="flex justify-end gap-1.25 flex-[1-0-0] text-sm text-gray-400">
					<p>{post.location}</p>
					{post.location && <span> - </span>}
					<p>
						<RelativeDate dateString={post.createdAt} />
					</p>
				</div>
			</div>
		</article>
	) : (
		<article className="flex p-3.75 flex-col w-full justify-center gap-2.5 bg-white rounded-(--Corner-Radius-M---Corner-Radius,1.5625rem) shadow-sm">
			<Authors
				author={author}
				post={post}
				size={"sm"}
				compact={props.compact}
				isBookmarked={isBookmarked}
				onBookmarkClick={async () => {
					const newBookmarked = !isBookmarked;
					setIsBookmarked(newBookmarked);
					try {
						if (newBookmarked) {
							await createBookmark(post.id);
						} else {
							await deleteBookmark(post.id);
						}
					} catch {
						// Revert on error
						setIsBookmarked(!newBookmarked);
					}
				}}
			/>
			<Divider />
			<h3 className="px-2.5 text-base font-semibold">{post.title}</h3>
			<div className="flex px-1.25 justify-between items-center self-stretch">
				<div className="flex items-center gap-1.25">
					{post.type === "request" && post.paidOpportunity && (
						<Tags hashTag text="paid-gig" />
					)}
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

function Authors({
	author,
	post,
	size = "xs",
	compact,
	isBookmarked,
	onBookmarkClick,
}: {
	author?: PostResponse["author"];
	post: PostResponse & {
		taggedUsers?: PostResponse["taggedUsers"];
	};
	size?: "xs" | "sm";
	compact?: boolean;
	isBookmarked?: boolean;
	onBookmarkClick?: () => void;
}) {
	return post.type === "note" ? (
		<div
			className={`flex flex-row items-center gap-1.25 ${
				compact ? "text-xs" : ""
			}`}>
			<div className="flex gap-1.25">
				<Link href={`/profile/${author?.username}`}>
					<Avatar
						size={size}
						fallback={(author?.firstName ||
							author?.username ||
							"U")[0].toUpperCase()}
						src={author?.avatarUrl}
						alt={author?.username || "User avatar"}
					/>
				</Link>
				{post.taggedUsers?.map((user, idx) => (
					<Link
						href={`/profile/${user.username}`}
						key={user.id || idx}
						className="-ml-2">
						<Avatar
							key={user.id || idx}
							size={size}
							fallback={(user?.firstName ||
								user?.username ||
								"U")[0].toUpperCase()}
							src={user?.avatarUrl}
							alt={user?.username || "User avatar"}
						/>
					</Link>
				))}
				<p className="text-gray-500">
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
		</div>
	) : (
		<div className="flex justify-between self-stretch items-center">
			<div
				className={`flex gap-1.25 flex-[1_0_0] text-gray-500 items-center ${
					compact ? "text-xs" : ""
				}`}>
				<Link href={`/profile/${author?.username}`}>
					<Avatar
						size={size}
						fallback={(author?.firstName ||
							author?.username ||
							"U")[0].toUpperCase()}
						src={author?.avatarUrl}
						alt={author?.username || "User avatar"}
					/>
				</Link>
				{post.taggedUsers?.map((user, idx) => (
					<Link
						href={`/profile/${user.username}`}
						key={user.id || idx}
						className="-ml-2">
						<Avatar
							key={user.id || idx}
							size={size}
							fallback={(user?.firstName ||
								user?.username ||
								"U")[0].toUpperCase()}
							src={user?.avatarUrl}
							alt={user?.username || "User avatar"}
						/>
					</Link>
				))}
				<p className="text-gray-700">
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
				<p>looking for a #guitarist</p>
			</div>
			{compact ? null : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="20"
					viewBox="0 0 16 20"
					fill="none"
					className="cursor-pointer"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onBookmarkClick?.();
					}}>
					<path
						d="M0.75 18.75V2.75C0.75 1.64543 1.64543 0.75 2.75 0.75H12.75C13.8546 0.75 14.75 1.64543 14.75 2.75V18.75L8.83152 14.9453C8.1727 14.5217 7.3273 14.5217 6.66848 14.9453L0.75 18.75Z"
						stroke={isBookmarked ? "none" : "#131927"}
						fill={isBookmarked ? "#FFCF70" : "none"}
						strokeWidth={isBookmarked ? "0" : "1.5"}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			)}
		</div>
	);
}
