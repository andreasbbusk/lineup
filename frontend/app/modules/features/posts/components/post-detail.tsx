"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostResponse } from "../types";
import { Avatar } from "@/app/modules/components/avatar";
import { Tags } from "@/app/modules/components/tags";
import { Comments } from "./comments";
import { Button } from "@/app/modules/components/buttons";
import { likePost, unlikePost } from "@/app/modules/api/postsApi";
import { ActionBar } from "./action-bar";
import { useAppStore } from "@/app/modules/stores/Store";
import { useStartOrNavigateToChat } from "@/app/modules/hooks";

interface PostDetailProps {
	className?: string;
	post: PostResponse & {
		commentsCount?: number;
		likesCount?: number;
		bookmarksCount?: number;
		hasLiked?: boolean;
		hasBookmarked?: boolean;
		paidOpportunity?: boolean;
	};
	compact?: boolean;
}

export function PostDetail({ post, compact }: PostDetailProps) {
	const author = post.author;
	const user = useAppStore((state) => state.user);
	const { startOrNavigateToChat, isCreating: isCreatingConversation } =
		useStartOrNavigateToChat();

	const handleStartChat = () => {
		if (!user || !author || user.id === author.id) return;

		startOrNavigateToChat({
			participantId: author.id,
			postId: post.type === "request" ? post.id : undefined,
		});
	};

	function formatDate(dateString: string | null, now: Date): string {
		if (!dateString) return "";
		const date = new Date(dateString);
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return "just now";
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400)
			return `${Math.floor(diffInSeconds / 3600)}h ago`;
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

	const type = post.type;

	const [isLiked, setIsLiked] = useState(post.hasLiked ?? false);
	const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
	const [isCommentOpen, setIsCommentOpen] = useState(false);

	return type === "note" ? (
		<article className="flex p-3.75 flex-col justify-center items-start gap-1.75 self-stretch w-full max-w-200 mx-auto">
			<div className="flex flex-wrap justify-between flex-row items-center w-full">
				<Authors author={author} post={post} size={"sm"} compact={compact} />

				<p>
					<RelativeDate dateString={post.createdAt} />
				</p>
			</div>
			<div className="flex items-center gap-1.25">
				{post.paidOpportunity && <Tags hashTag text="paid-gig" />}
			</div>
			<h3 className="text-base font-semibold">{post.title}</h3>
			{post.media && post.media.length > 0 && (
				<div className="flex justify-between items-center self-stretch">
					<Image
						src={post.media[0].url}
						alt={post.description}
						width={300}
						height={300}
						className="w-full rounded-[1.5625rem]"
					/>
				</div>
			)}
			<p className=" line-clamp-4 text-gray-600">{post.description}</p>
			<div className="w-full pt-4">
				<ActionBar
					setIsLiked={async (liked: boolean) => {
						setIsLiked(liked);
						setLikesCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
						try {
							if (liked) {
								await likePost(post.id);
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
				<Comments postId={post.id} />
			</div>
		</article>
	) : (
		<article className="flex p-3.75 flex-col justify-center items-start gap-3.75 self-stretch w-full max-w-200 mx-auto">
			<div className="flex justify-between flex-wrap w-full">
				<Authors author={author} post={post} size={"sm"} compact={compact} />
				<div className="flex justify-end gap-1.25 text-gray-500 ml-auto">
					{post.location && (
						<>
							<p>{post.location}</p>
							<span> - </span>
						</>
					)}
					<p>
						<RelativeDate dateString={post.createdAt} />
					</p>
				</div>
			</div>
			<div className="flex items-center gap-1.25">
				{post.paidOpportunity && <Tags hashTag text="paid-gig" />}
			</div>
			<h3 className="text-base font-semibold">{post.title}</h3>
			{post.media && (
				<div className="flex justify-between items-center self-stretch">
					{post.media && post.media.length > 0 && (
						<Image
							src={post.media[0].url}
							alt={post.description}
							width={300}
							height={300}
							className="w-full rounded-[1.5625rem]"
						/>
					)}
				</div>
			)}
			<p className=" line-clamp-4 text-gray-600">{post.description}</p>
			<div className=" flex self-stretch gap-2.5 items-center justify-between">
				<Button
					variant="primary"
					icon="chat-bubble"
					onClick={handleStartChat}
					disabled={isCreatingConversation}>
					{isCreatingConversation ? "Starting..." : "Start a chat"}
				</Button>
			</div>
			<div className="flex flex-col items-start gap-2.5 self-stretch">
				<h3>Genre</h3>
				{post.metadata && Array.isArray(post.metadata) && (
					<div className="flex flex-wrap gap-2">
						{post.metadata
							.filter((meta) => meta.type === "genre")
							.map((meta) => (
								<Tags
									color="#1e1e1e"
									key={meta.id}
									text={meta.name}
									onClick={() => {}}
								/>
							))}
					</div>
				)}
			</div>
			<div className="flex flex-col items-start gap-2.5 self-stretch">
				<h3>Must have skills</h3>
				<div className="flex items-center content-center gap-2 flex-[1_0_0] flex-wrap">
					<Tags color="#1e1e1e" text="Low tuning" onClick={() => {}} />
					<Tags color="#1e1e1e" text="Odd time signatures" onClick={() => {}} />
					<Tags color="#1e1e1e" text="Good tone knowledge" onClick={() => {}} />
				</div>
			</div>
		</article>
	);
}

function Authors({
	author,
	post,
	size = "xs",
	compact,
}: {
	author?: PostResponse["author"];
	post: PostResponse & {
		taggedUsers?: PostResponse["taggedUsers"];
	};
	size?: "xs" | "sm";
	compact?: boolean;
}) {
	return post.type === "note" ? (
		<div
			className={`flex flex-row items-center justify-center gap-1.25 ${
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
	) : (
		<div className="flex justify-between self-stretch items-center flex-wrap">
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
		</div>
	);
}
