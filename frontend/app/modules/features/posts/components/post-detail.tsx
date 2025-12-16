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

export function PostDetail({ post, ...props }: PostDetailProps) {
	const author = post.author;
	const type = post.type;

	const [isLiked, setIsLiked] = useState(post.hasLiked ?? false);
	const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
	const [isCommentOpen, setIsCommentOpen] = useState(false);

	return type === "note" ? (
		<article className="flex p-3.75 flex-col justify-center items-start gap-1.75 self-stretch">
			<div className="flex flex-wrap justify-between flex-row items-center w-full">
				<Authors
					author={author}
					post={post}
					size={"sm"}
					compact={props.compact}
				/>

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
						} catch (error) {
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
		<article className="flex p-3.75 flex-col justify-center items-start gap-3.75 self-stretch">
			<div className="flex justify-between flex-wrap w-full">
				<Authors
					author={author}
					post={post}
					size={"sm"}
					compact={props.compact}
				/>
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
					onClick={() => {
						console.log("Start chat");
					}}>
					Start a chat
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

// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { ArrowLeftIcon } from "lucide-react";
// import type { PostResponse } from "../types";
// import { MediaGrid } from "./media-grid";
// import { TaggedUsers } from "./tagged-users";
// import { Avatar } from "@/app/modules/components/avatar";
// import { Button } from "@/app/modules/components/buttons";
// import { Tags } from "@/app/modules/components/tags";
// import { useCreateConversation } from "@/app/modules/features/chats";
// import { useStartOrNavigateToChat } from "@/app/modules/hooks";
// import { useAppStore } from "@/app/modules/stores/Store";

// interface PostDetailProps {
// 	post: PostResponse;
// 	className?: string;
// }

// function formatDate(dateString: string | null): string {
// 	if (!dateString) return "";
// 	const date = new Date(dateString);
// 	return date.toLocaleDateString("en-US", {
// 		month: "long",
// 		day: "numeric",
// 		year: "numeric",
// 		hour: "numeric",
// 		minute: "2-digit",
// 	});
// }

// function formatRelativeTime(dateString: string | null): string {
// 	if (!dateString) return "";
// 	const date = new Date(dateString);
// 	const now = new Date();
// 	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

// 	if (diffInSeconds < 60) return "just now";
// 	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
// 	if (diffInSeconds < 86400)
// 		return `${Math.floor(diffInSeconds / 3600)}hrs ago`;
// 	if (diffInSeconds < 604800)
// 		return `${Math.floor(diffInSeconds / 86400)}d ago`;

// 	return date.toLocaleDateString("en-US", {
// 		month: "short",
// 		day: "numeric",
// 		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
// 	});
// }

// export function PostDetail({ post, className = "" }: PostDetailProps) {
// 	const router = useRouter();
// 	const author = post.author;
// 	const user = useAppStore((state) => state.user);
// 	const { startOrNavigateToChat, isCreating: isCreatingConversation } =
// 		useStartOrNavigateToChat();

// 	const handleStartChat = () => {
// 		if (!user || !author || user.id === author.id) return;

// 		startOrNavigateToChat({
// 			participantId: author.id,
// 			postId: post.type === "request" ? post.id : undefined,
// 		});
// 	};

// 	const isResolved = (post as { status?: string }).status === "resolved";
// 	const isAuthor = user?.id === author?.id;
// 	const genres = (post.metadata || []).filter((meta) => meta.type === "genre");

// 	return (
// 		<article
// 			className={`space-y-6 p-4 mt-4 max-w-200 mx-auto bg-white rounded-lg ${className}`}>
// 			{/* Author Header */}
// 			<div className="flex items-center gap-3">
// 				<Link href={`/profile/${author?.username || post.authorId}`}>
// 					<Avatar
// 						size="lg"
// 						fallback={
// 							(author?.firstName?.charAt(0)?.toUpperCase() || "") +
// 							(author?.lastName?.charAt(0)?.toUpperCase() || "")
// 						}
// 						src={author?.avatarUrl}
// 						alt={`${author?.username}'s avatar`}></Avatar>
// 				</Link>
// 				<div className="flex-1">
// 					<div className="flex items-center justify-between gap-2">
// 						<div className="flex items-center gap-2 flex-wrap">
// 							<Link
// 								href={`/profile/${author?.username || post.authorId}`}
// 								className="text-base font-medium hover:underline">
// 								{author?.firstName && author?.lastName
// 									? `${author.firstName} ${author.lastName}`
// 									: author?.username || "Unknown User"}
// 							</Link>
// 							<span className="text-base text-gray-700">{post.title}</span>
// 						</div>
// 						<span className="text-sm text-gray-500 whitespace-nowrap">
// 							{formatRelativeTime(post.createdAt)}
// 						</span>
// 					</div>
// 					{post.type === "request" && post.paidOpportunity && (
// 						<div className="mt-2">
// 							<span className="rounded-full border border-black px-2 py-0.5 text-sm font-medium">
// 								#paid-gig
// 							</span>
// 						</div>
// 					)}
// 				</div>
// 			</div>

// 			{/* Post Title with Location */}
// 			<div className="flex items-center justify-between gap-4">
// 				<h1 className="text-3xl font-bold">{post.title}</h1>
// 				{post.location && (
// 					<span className="text-sm text-gray-500 whitespace-nowrap">
// 						{post.location}
// 					</span>
// 				)}
// 			</div>

// 			{/* Start Chat Button for Request Posts */}
// 			{post.type === "request" && !isAuthor && !isResolved && (
// 				<Button
// 					variant="primary"
// 					icon="chat-bubble"
// 					onClick={handleStartChat}
// 					disabled={isCreatingConversation}>
// 					{isCreatingConversation ? "Starting..." : "Start a chat"}
// 				</Button>
// 			)}

// 			{/* Media Grid */}
// 			{post.media && post.media.length > 0 && (
// 				<div>
// 					<MediaGrid media={post.media} showLightbox={true} />
// 				</div>
// 			)}

// 			{/* Post Description */}
// 			<div className="prose max-w-none">
// 				<p className="whitespace-pre-wrap text-gray-700">{post.description}</p>
// 			</div>

// 			{/* Genres for Request Posts */}
// 			{post.type === "request" && genres && genres.length > 0 && (
// 				<div className="flex flex-col items-start gap-4 w-full">
// 					<h3 className="font-normal text-gray-500">Genre</h3>
// 					<ul className="flex flex-wrap py-0 px-3.75 items-center gap-[0.625rem] self-stretch">
// 						{genres.map((meta) => (
// 							<li key={meta.id}>
// 								<Tags text={meta.name} onClick={() => {}} />
// 							</li>
// 						))}
// 					</ul>
// 				</div>
// 			)}

// 			{/* Tags for Non-Request Posts */}
// 			{post.type !== "request" && post.metadata && post.metadata.length > 0 && (
// 				<div>
// 					<h3 className="mb-2 text-sm font-semibold text-gray-500">Tags</h3>
// 					<div className="flex flex-wrap gap-2">
// 						{post.metadata.map((meta) => (
// 							<span
// 								key={meta.id}
// 								className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
// 								{meta.type === "tag" ? "#" : ""}
// 								{meta.name}
// 							</span>
// 						))}
// 					</div>
// 				</div>
// 			)}

// 			{/* Tagged Users */}
// 			{post.taggedUsers && post.taggedUsers.length > 0 && (
// 				<div>
// 					<TaggedUsers taggedUsers={post.taggedUsers} />
// 				</div>
// 			)}

// 			{/* Post Metadata */}
// 			{(post.expiresAt ||
// 				(post.updatedAt && post.updatedAt !== post.createdAt)) && (
// 				<div className="border-t border-gray-200 pt-4">
// 					<div className="flex items-center gap-4 text-sm text-gray-500">
// 						{post.expiresAt && (
// 							<span>Expires: {formatDate(post.expiresAt)}</span>
// 						)}
// 						{post.updatedAt && post.updatedAt !== post.createdAt && (
// 							<span>Updated: {formatDate(post.updatedAt)}</span>
// 						)}
// 					</div>
// 				</div>
// 			)}
// 		</article>
// 	);
// }
