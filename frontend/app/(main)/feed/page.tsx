"use client";

import { LoadingSpinner } from "@/app/components/loading-spinner";
import { usePosts } from "@/app/lib/features/posts";
import { PostCard } from "@/app/lib/features/posts/components/post-card";
import { RequestCarousel } from "@/app/lib/features/posts/components/request-carousel";

export default function FeedPage() {
	const { data, isLoading, error } = usePosts({ limit: 20, type: "note" });

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner size={40} />
			</div>
		);
	}

	if (error) {
		return (
			<main className="space-y-4">
				<h1 className="text-h1 font-bold">Feed</h1>
				<p className="text-body text-red-500">
					Fejl ved indlæsning af opslag: {error.message}
				</p>
			</main>
		);
	}

	const posts = (data?.data || []).filter((post) => post.type === "note");

	return (
		<main className="max-w-[100vw]">
			<div>Stories section</div>
			<RequestCarousel />

			{posts.length > 0 ? (
				<div>
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
					{data?.pagination.hasMore && (
						<div className="text-center">
							<p className="text-sm text-gray-500">Flere opslag indlæses...</p>
						</div>
					)}
				</div>
			) : (
				<div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
					<p className="text-gray-500">Ingen opslag endnu.</p>
					<p className="mt-2 text-sm text-gray-400">
						Vær den første til at oprette et opslag!
					</p>
				</div>
			)}
		</main>
	);
}
