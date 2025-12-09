"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostResponse } from "../types";
import { MediaGrid } from "./media-grid";
import { Avatar } from "@/app/components/avatar";
import { Tags } from "@/app/components/tags";
import { ActionBar } from "./action-bar";

interface PostCardProps {
	post: PostResponse;
}

export function PostCard({ post }: PostCardProps) {
	const author = post.author;

	const [isLiked, setIsLiked] = useState(false);
	const [isCommentOpen, setIsCommentOpen] = useState(false);

	return (
		<article className="relative bg-white p-4">
			<Image
				src="/icons/more.svg"
				alt="More options"
				width={24}
				height={24}
				className="absolute right-2 top-2"
			/>
			{/* Author Header */}
			<div className="mb-3 px-2.5 flex items-center gap-3">
				<div className="flex flex-row items-center gap-1.25">
					<div className="flex -space-x-2">
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
				<Tags hashTag text="dummy" />
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
				/>
			</div>
		</article>
	);
}
