"use client";

import { useMemo } from "react";
import { Button } from "@/app/modules/components/buttons";
import { PostCard } from "./post-card";
import { useRouter } from "next/navigation";
import type { PaginatedResponse, PostResponse } from "@/app/modules/api/postsApi";

interface RequestCarouselProps {
	data?: PaginatedResponse<PostResponse>;
}

function RequestCarousel({ data }: RequestCarouselProps) {
	const router = useRouter();

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

	return (
		<div className="flex flex-col items-start gap-2.5 px-3.75 pt-3.75 pb-6 max-w-200 w-full mx-auto md:px-0">
			<p className="text-gray font-normal text-base">Collaboration requests</p>

			{posts.length > 0 ? (
				<div className="flex flex-col items-start gap-2.5 w-full">
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
				</div>
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
