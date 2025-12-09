"use client";

import { useMemo, useState } from "react";
import { Button } from "@/app/components/buttons";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { usePosts } from "../hooks/use-posts";
import { PostCard } from "./post-card";

function RequestCarousel() {
	const { data, isLoading, error } = usePosts({ limit: 50, type: "request" });
	const [showAll, setShowAll] = useState(false);

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

	const featuredPosts = posts.slice(0, 3);
	const remainingPosts = posts.slice(3);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<LoadingSpinner size={24} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				Fejl ved indlæsning af forespørgsler.
			</div>
		);
	}

	return (
		<div className="flex flex-col items-start gap-2.5 p-3.75">
			<p className="text-gray font-normal text-base">Collaboration requests</p>

			{posts.length > 0 ? (
				<div>
					<div className="flex pr-3.75 items-start max-w-[calc(100vw-0.9375rem)] gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
						{featuredPosts.map((post) => (
							<div key={post.id} className=" snap-start md:min-w-0">
								<PostCard compact post={post} />
							</div>
						))}
					</div>
					{data?.pagination.hasMore &&
						!showAll &&
						remainingPosts.length > 0 && (
							<div className="text-center">
								<p className="text-sm text-gray-500">
									Flere opslag indlæses...
								</p>
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

			<Button variant="primary" onClick={() => setShowAll(true)}>
				See more collabs
			</Button>

			{showAll && remainingPosts.length > 0 && (
				<div className="grid gap-4 md:grid-cols-3">
					{remainingPosts.map((post) => (
						<PostCard compact key={post.id} post={post} />
					))}
				</div>
			)}
		</div>
	);
}
export { RequestCarousel };
