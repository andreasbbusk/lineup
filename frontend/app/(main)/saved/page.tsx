"use client";

import { useBookmarks } from "@/app/modules/hooks/queries/useBookmarks";
import { PostCard } from "@/app/modules/features/posts/components/post-card";
import { getPostById } from "@/app/modules/api/postsApi";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { PostResponse } from "@/app/modules/api/postsApi";

export default function SavedPage() {
	const router = useRouter();
	const { data: bookmarks, error, isPending } = useBookmarks();

	// Fetch full post data for each bookmark (bookmarks only have basic post info)
	const { data: postsData } = useQuery({
		queryKey: ["bookmarked-posts", bookmarks?.map(b => b.postId)],
		queryFn: async () => {
			if (!bookmarks || bookmarks.length === 0) return [];
			const posts = await Promise.all(
				bookmarks
					.filter(b => b.post)
					.map(bookmark => getPostById(bookmark.postId, { includeComments: false }))
			);
			return posts;
		},
		enabled: !!bookmarks && bookmarks.length > 0,
	});

	const posts: (PostResponse & { hasBookmarked?: boolean })[] = (postsData || []).map(post => ({
		...post,
		hasBookmarked: true, // All posts here are bookmarked
	}));

	if (error) {
		return (
			<main className="min-h-screen bg-white">
				<header className="sticky top-0 z-40 w-full border-b border-light-grey bg-white px-4">
					<div className="flex h-12 items-center justify-between">
						<button
							onClick={() => router.back()}
							className="flex items-center justify-center text-foreground hover:opacity-70 transition-opacity"
							aria-label="Close">
							<X size={18} />
						</button>
						<h1 className="text-sm font-semibold text-foreground">Saved</h1>
						<div className="w-10" />
					</div>
				</header>
				<div className="p-4">
					<p className="text-red-500">Error loading bookmarks: {error.message}</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-white">
			<header className="sticky top-0 z-40 w-full border-b border-light-grey bg-white px-4">
				<div className="flex h-12 items-center justify-between">
					<button
						onClick={() => router.back()}
						className="flex items-center justify-center text-foreground hover:opacity-70 transition-opacity"
						aria-label="Close">
						<X size={18} />
					</button>
					<h1 className="text-sm font-semibold text-foreground">Saved</h1>
					<div className="w-10" />
				</div>
			</header>

			<div className="max-w-200 mx-auto pt-4 pb-24">
				{isPending ? (
					<div className="p-4 text-center text-gray-500">Loading saved posts...</div>
				) : posts.length > 0 ? (
					<div className="flex flex-col items-center gap-4">
						{posts.map((post) => (
							<PostCard 
								key={post.id} 
								post={post} 
							/>
						))}
					</div>
				) : (
					<div className="p-8 text-center">
						<p className="text-gray-500">No saved posts yet.</p>
						<p className="mt-2 text-sm text-gray-400">
							Bookmark posts to see them here.
						</p>
					</div>
				)}
			</div>
		</main>
	);
}

