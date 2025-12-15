"use client";

import { useMemo } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Button } from "@/app/modules/components/buttons";
import { usePosts } from "@/app/modules/hooks/queries";
import { PostCard } from "./post-card";
import { useRouter } from "next/navigation";

function RequestCarousel() {
	const router = useRouter();
	const { data, error, isPending } = usePosts(
		{ limit: 20, type: "request" },
		{ placeholderData: keepPreviousData } // Prevent flash during refresh
	);

	const posts = useMemo(
		() =>
			(data?.data || [])
				.filter((post) => post.type === "request")
				.sort(
					(a, b) =>
						new Date(b.createdAt || 0).getTime() -
						new Date(a.createdAt || 0).getTime()
				),
		[data]
	);

	const featuredPosts = posts.slice(0, 2);

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				Error loading requests: {error.message}
			</div>
		);
	}

	// Show nothing while initial load (no placeholder data yet)
	if (isPending && !data) {
		return null; // Or return a skeleton
	}

	return (
		<div className="flex flex-col items-start gap-2.5 px-3.75 pt-3.75 pb-6 max-w-200 w-full mx-auto md:px-0">
			<p className="text-gray font-normal text-base">Collaboration requests</p>

			{posts.length > 0 ? (
				<>
					<div className="no-scrollbar flex pr-3.75 items-start max-w-[calc(100vw-0.9375rem)] gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory">
						{featuredPosts.map((post) => (
							<div key={post.id} className="snap-start index-10">
								<PostCard compact post={post} />
							</div>
						))}
					</div>

					<Button variant="primary" onClick={() => router.push("/services")}>
						See more requests
					</Button>
				</>
			) : (
				<div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
					<p className="text-gray-500">No requests yet.</p>
					<p className="mt-2 text-sm text-gray-400">
						Be the first to create a request!
					</p>
				</div>
			)}
		</div>
	);
}

export { RequestCarousel };
