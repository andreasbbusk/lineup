"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import type { PostResponse } from "../types";
import { MediaGrid } from "./media-grid";
import { TaggedUsers } from "./tagged-users";
import { Avatar } from "@/app/modules/components/avatar";
import { Button } from "@/app/modules/components/buttons";
import { Tags } from "@/app/modules/components/tags";
import { useCreateConversation } from "@/app/modules/features/chats";
import { useAppStore } from "@/app/modules/stores/Store";

interface PostDetailProps {
	post: PostResponse;
	className?: string;
}

function formatDate(dateString: string | null): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function formatRelativeTime(dateString: string | null): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "just now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}hrs ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
}

export function PostDetail({ post, className = "" }: PostDetailProps) {
	const router = useRouter();
	const author = post.author;
	const user = useAppStore((state) => state.user);
	const { mutate: createConversation, isPending: isCreatingConversation } =
		useCreateConversation();

	const handleStartChat = () => {
		if (!user || !author || user.id === author.id) return;

		createConversation(
			{
				type: "direct",
				participantIds: [author.id],
				name: null,
				avatarUrl: null,
				postId: post.type === "request" ? post.id : undefined,
			},
			{
				onSuccess: (conversation) => {
					router.push(`/chats/${conversation.id}`);
				},
				onError: (error) => {
					console.error("Failed to create conversation:", error);
				},
			}
		);
	};

	const isResolved = (post as { status?: string }).status === "resolved";
	const isAuthor = user?.id === author?.id;
	const genres = (post.metadata || []).filter((meta) => meta.type === "genre");

	return (
		<article className={`space-y-6 p-4 mt-4 max-w-200 mx-auto bg-white rounded-lg ${className}`}>
			{/* Back Button */}
			<button
				onClick={() => router.back()}
				className="flex h-10 w-10 items-center justify-center transition-all active:scale-90"
				aria-label="Go back">
				<ArrowLeftIcon size={24} className="text-gray-600" />
			</button>

			{/* Author Header */}
			<div className="flex items-center gap-3">
				<Link href={`/profile/${author?.username || post.authorId}`}>
					<Avatar
						size="lg"
						fallback={
							(author?.firstName?.charAt(0)?.toUpperCase() || "") +
							(author?.lastName?.charAt(0)?.toUpperCase() || "")
						}
						src={author?.avatarUrl}
						alt={`${author?.username}'s avatar`}></Avatar>
				</Link>
				<div className="flex-1">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2 flex-wrap">
							<Link
								href={`/profile/${author?.username || post.authorId}`}
								className="text-base font-medium hover:underline">
								{author?.firstName && author?.lastName
									? `${author.firstName} ${author.lastName}`
									: author?.username || "Unknown User"}
							</Link>
							<span className="text-base text-gray-700">{post.title}</span>
						</div>
						<span className="text-sm text-gray-500 whitespace-nowrap">
							{formatRelativeTime(post.createdAt)}
						</span>
					</div>
					{post.type === "request" && post.paidOpportunity && (
						<div className="mt-2">
							<span className="rounded-full border border-black px-2 py-0.5 text-sm font-medium">
								#paid-gig
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Post Title with Location */}
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-3xl font-bold">{post.title}</h1>
				{post.location && (
					<span className="text-sm text-gray-500 whitespace-nowrap">
						{post.location}
					</span>
				)}
			</div>



			{/* Start Chat Button for Request Posts */}
			{post.type === "request" && !isAuthor && !isResolved && (
				<Button
					variant="primary"
					icon="chat-bubble"
					onClick={handleStartChat}
					disabled={isCreatingConversation}>
					{isCreatingConversation ? "Starting..." : "Start a chat"}
				</Button>
			)}

			{/* Media Grid */}
			{post.media && post.media.length > 0 && (
				<div>
					<MediaGrid media={post.media} showLightbox={true} />
				</div>
			)}

			{/* Post Description */}
			<div className="prose max-w-none">
				<p className="whitespace-pre-wrap text-gray-700">{post.description}</p>
			</div>

			{/* Genres for Request Posts */}
			{post.type === "request" && genres && genres.length > 0 && (
				<div className="flex flex-col items-start gap-4 w-full">
					<h3 className="font-normal text-gray-500">Genre</h3>
					<ul className="flex flex-wrap py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
						{genres.map((meta) => (
							<li key={meta.id}>
								<Tags text={meta.name} onClick={() => {}} />
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Tags for Non-Request Posts */}
			{post.type !== "request" &&
				post.metadata &&
				post.metadata.length > 0 && (
					<div>
						<h3 className="mb-2 text-sm font-semibold text-gray-500">Tags</h3>
						<div className="flex flex-wrap gap-2">
							{post.metadata.map((meta) => (
								<span
									key={meta.id}
									className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
									{meta.type === "tag" ? "#" : ""}
									{meta.name}
								</span>
							))}
						</div>
					</div>
				)}

			{/* Tagged Users */}
			{post.taggedUsers && post.taggedUsers.length > 0 && (
				<div>
					<TaggedUsers taggedUsers={post.taggedUsers} />
				</div>
			)}

			{/* Post Metadata */}
			{(post.expiresAt || (post.updatedAt && post.updatedAt !== post.createdAt)) && (
				<div className="border-t border-gray-200 pt-4">
					<div className="flex items-center gap-4 text-sm text-gray-500">
						{post.expiresAt && <span>Expires: {formatDate(post.expiresAt)}</span>}
						{post.updatedAt && post.updatedAt !== post.createdAt && (
							<span>Updated: {formatDate(post.updatedAt)}</span>
						)}
					</div>
				</div>
			)}
		</article>
	);
}
