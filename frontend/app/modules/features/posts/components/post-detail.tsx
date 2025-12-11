"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import type { PostResponse } from "../types";
import { MediaGrid } from "./media-grid";
import { TaggedUsers } from "./tagged-users";
import { Avatar } from "@/app/modules/components/avatar";

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

export function PostDetail({ post, className = "" }: PostDetailProps) {
	const router = useRouter();
	const author = post.author;

	return (
		<article className={`space-y-6 ${className}`}>
			{/* Back Button */}
			<button
				onClick={() => router.back()}
				className="flex h-10 w-10 items-center justify-center transition-all active:scale-90"
				aria-label="Go back">
				<ArrowLeftIcon size={24} className="text-gray-600" />
			</button>

			{/* Author Header */}
			<div className="flex items-center gap-4">
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
					<Link
						href={`/profile/${author?.username || post.authorId}`}
						className="block text-xl font-semibold hover:underline">
						{author?.firstName && author?.lastName
							? `${author.firstName} ${author.lastName}`
							: author?.username || "Unknown User"}
					</Link>
					<div className="text-sm text-gray-500">
						<span>{formatDate(post.createdAt)}</span>
						{post.location && <span> · {post.location}</span>}
						{post.type === "request" && post.paidOpportunity && (
							<span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
								Paid Opportunity
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Post Title */}
			<h1 className="text-3xl font-bold">{post.title}</h1>

			{/* Post Description */}
			<div className="prose max-w-none">
				<p className="whitespace-pre-wrap text-gray-700">{post.description}</p>
			</div>

			{/* Media Grid */}
			{post.media && post.media.length > 0 && (
				<div>
					<MediaGrid media={post.media} showLightbox={true} />
				</div>
			)}

			{/* Tags/Genres */}
			{post.metadata && post.metadata.length > 0 && (
				<div>
					<h3 className="mb-2 text-sm font-semibold text-gray-500">
						{post.type === "request" ? "Genres" : "Tags"}
					</h3>
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
			<div className="border-t border-gray-200 pt-4">
				<div className="flex items-center gap-4 text-sm text-gray-500">
					<span className="font-medium uppercase">{post.type}</span>
					{post.expiresAt && <span>Expires: {formatDate(post.expiresAt)}</span>}
					{post.updatedAt && post.updatedAt !== post.createdAt && (
						<span>Updated: {formatDate(post.updatedAt)}</span>
					)}
				</div>
			</div>
		</article>
	);
}
