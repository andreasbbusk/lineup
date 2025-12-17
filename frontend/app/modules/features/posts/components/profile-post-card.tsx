"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { PostResponse } from "../types";
import { Avatar } from "@/app/modules/components/avatar";
import { Tags } from "@/app/modules/components/tags";
import { Button } from "@/app/modules/components/buttons";
import { useStartOrNavigateToChat } from "@/app/modules/hooks";
import { useResolvePost, useUpdatePost, useDeletePost } from "@/app/modules/hooks/mutations";
import { useAppStore } from "@/app/modules/stores/Store";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/app/modules/components/radix-popover";

interface ProfilePostCardProps {
	post: PostResponse & {
		commentsCount?: number;
		likesCount?: number;
		bookmarksCount?: number;
		hasLiked?: boolean;
		hasBookmarked?: boolean;
	};
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

export function ProfilePostCard({ post }: ProfilePostCardProps) {
	const router = useRouter();
	const author = post.author;
	const user = useAppStore((state) => state.user);
	const { startOrNavigateToChat, isCreating: isCreatingConversation } =
		useStartOrNavigateToChat();
	const { mutate: resolvePost, isPending: isResolvingPost } = useResolvePost();
	const { mutate: updatePost, isPending: isUpdatingPost } = useUpdatePost();
	const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost();

	// Edit mode state
	const [isEditing, setIsEditing] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [editTitle, setEditTitle] = useState(post.title);
	const [editDescription, setEditDescription] = useState(post.description || "");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleStartChat = () => {
		if (!user || !author || user.id === author.id) return;

		startOrNavigateToChat({
			participantId: author.id,
			postId: post.type === "request" ? post.id : undefined,
		});
	};

	const handleResolveRequest = () => {
		resolvePost(post.id);
	};

	const handleEditPost = () => {
		setIsMenuOpen(false);
		setIsEditing(true);
	};

	const handleSaveEdit = () => {
		updatePost(
			{
				postId: post.id,
				data: {
					title: editTitle,
					description: editDescription,
				},
			},
			{
				onSuccess: () => {
					setIsEditing(false);
				},
			}
		);
	};

	const handleCancelEdit = () => {
		setEditTitle(post.title);
		setEditDescription(post.description || "");
		setIsEditing(false);
	};

	const handleDeletePost = () => {
		setIsMenuOpen(false);
		setShowDeleteConfirm(true);
	};

	const confirmDelete = () => {
		deletePost(post.id, {
			onSuccess: () => {
				setShowDeleteConfirm(false);
			},
		});
	};

	const isResolved = (post as { status?: string }).status === "resolved";
	const isAuthor = user?.id === author?.id;
	const showResolveButton = post.type === "request" && isAuthor && !isResolved;

	// Get the first media item for the large image
	const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;

	// Get genre tags (metadata with type "genre") - for requests
	const genreTags = post.metadata?.filter(
		(meta) => meta.type === "genre"
	) || [];

	// Get tag metadata (for notes)
	const tagMetadata = post.metadata?.filter(
		(meta) => meta.type === "tag"
	) || [];

	// Get looking for tag (e.g., "#guitarist") - typically the first tag for requests
	const lookingForTag = post.type === "request" 
		? (post.metadata?.find(
			(meta) => meta.type === "tag" && 
			(meta.name.toLowerCase().includes("guitarist") ||
			 meta.name.toLowerCase().includes("drummer") ||
			 meta.name.toLowerCase().includes("bassist") ||
			 meta.name.toLowerCase().includes("vocalist") ||
			 meta.name.toLowerCase().includes("songwriter"))
		) || post.metadata?.find((meta) => meta.type === "tag"))
		: null;

	return (
		<article className="flex flex-col gap-4 bg-white rounded-[1.5625rem] p-4 shadow-sm border border-gray-200 relative">
			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
						<h3 className="text-lg font-semibold mb-2">Delete Post?</h3>
						<p className="text-gray-600 mb-4">
							Are you sure you want to delete this post? This action cannot be undone.
						</p>
						<div className="flex gap-3 justify-end">
							<Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={confirmDelete}
								disabled={isDeletingPost}
								className="bg-red-500 hover:bg-red-600"
							>
								{isDeletingPost ? "Deleting..." : "Delete"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Author Header with Menu */}
			<div className="flex items-center gap-2.5">
				<Link href={`/profile/${author?.username || post.authorId}`}>
					<Avatar
						size="sm"
						fallback={
							(author?.firstName?.charAt(0)?.toUpperCase() || "") +
							(author?.lastName?.charAt(0)?.toUpperCase() || "")
						}
						src={author?.avatarUrl}
						alt={author?.username || "User avatar"}
					/>
				</Link>
				<div className="flex-1 flex items-center gap-1.5 flex-wrap">
					<p className="text-sm text-gray-700">
						{author?.firstName || author?.username || "User"}
						{lookingForTag && (
							<span className="text-gray-500">
								{" "}
								looking for a #{lookingForTag.name}
							</span>
						)}
					</p>
					<span className="text-xs text-gray-500">
						<RelativeDate dateString={post.createdAt} />
					</span>
				</div>

				{/* Dropdown Menu for Author */}
				{isAuthor && !isEditing && (
					<Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
						<PopoverTrigger asChild>
							<button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
								<Image
									src="/icons/more-vert.svg"
									alt="More options"
									width={20}
									height={20}
								/>
							</button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-44">
							<div className="flex flex-col gap-1">
								<button
									onClick={handleEditPost}
									className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors"
								>
									<Image src="/icons/edit-pencil.svg" alt="" width={16} height={16} className="invert" />
									Edit Post
								</button>
								<button
									onClick={handleDeletePost}
									className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors text-red-300"
								>
									<Image src="/icons/delete-circle.svg" alt="" width={16} height={16} className="invert opacity-80" />
									Delete Post
								</button>
							</div>
						</PopoverContent>
					</Popover>
				)}
			</div>

			{/* Paid Gig Tag */}
			{post.type === "request" && post.paidOpportunity && (
				<div>
					<Tags hashTag text="paid-gig" />
				</div>
			)}

			{/* Post Title */}
			{isEditing ? (
				<input
					type="text"
					value={editTitle}
					onChange={(e) => setEditTitle(e.target.value)}
					className="text-lg font-semibold text-gray-900 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
					placeholder="Post title"
				/>
			) : (
				<h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
			)}

			{/* Large Image */}
			{firstMedia && firstMedia.type === "image" && (
				<div className="relative w-full rounded-[1.5625rem] overflow-hidden">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={firstMedia.url}
						alt={post.title}
						className="w-full h-auto object-cover"
						onError={(e) => {
							console.error("Failed to load image:", firstMedia.url);
							const target = e.target as HTMLImageElement;
							target.style.display = "none";
						}}
					/>
				</div>
			)}

			{/* Description */}
			{isEditing ? (
				<textarea
					value={editDescription}
					onChange={(e) => setEditDescription(e.target.value)}
					className="text-gray-700 leading-relaxed w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
					placeholder="Post description"
				/>
			) : (
				<p className="text-gray-700 leading-relaxed">{post.description}</p>
			)}

			{/* Edit Mode Actions */}
			{isEditing && (
				<div className="flex gap-2 justify-end">
					<Button variant="secondary" onClick={handleCancelEdit}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleSaveEdit}
						disabled={isUpdatingPost}
					>
						{isUpdatingPost ? "Saving..." : "Save"}
					</Button>
				</div>
			)}

			{/* Resolved Text / Resolve Button - Bottom Right */}
			{post.type === "request" && isAuthor && (
				<div className="flex justify-end">
					{isResolved ? (
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-500">Resolved</span>
						</div>
					) : !isEditing && (
						<Button
							variant="primary"
							onClick={handleResolveRequest}
							disabled={isResolvingPost}
						>
							{isResolvingPost ? "Resolving..." : "Resolve"}
						</Button>
					)}
				</div>
			)}

			{/* Start Chat Button (only for requests, not notes, and not author's own) */}
			{post.type === "request" && !isAuthor && !isResolved && (
				<Button
					variant="primary"
					icon="chat-bubble"
					onClick={handleStartChat}
					disabled={isCreatingConversation}
					className="self-start">
					{isCreatingConversation ? "Starting..." : "Start a chat"}
				</Button>
			)}

			{/* Tags for Notes */}
			{post.type === "note" && tagMetadata.length > 0 && (
				<div className="flex flex-col gap-2">
					<h3 className="text-sm font-semibold text-gray-500">Tags</h3>
					<div className="flex flex-wrap gap-2">
						{tagMetadata.map((meta) => (
							<Tags
								key={meta.id}
								hashTag
								text={meta.name}
								className="border-gray-300 text-gray-700"
							/>
						))}
					</div>
				</div>
			)}

			{/* Genre Tags for Requests - Styled like the image (black with white text) */}
			{post.type === "request" && genreTags.length > 0 && (
				<div className="flex flex-col gap-2">
					<h3 className="text-sm font-semibold text-gray-500">Genre</h3>
					<div className="flex flex-wrap gap-2">
						{genreTags.map((meta) => (
							<span
								key={meta.id}
								className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-medium">
								{meta.name}
							</span>
						))}
					</div>
				</div>
			)}
		</article>
	);
}

