"use client";

import { memo } from "react";
import { CollaborationRequestCard } from "./collaboration-request-card";
import { ServiceCard } from "./service-card";
import type { PostResponse } from "@/app/modules/api/postsApi";
import type { components } from "@/app/modules/types/api";
import { Button } from "@/app/modules/components/buttons";

type ServiceResponse = components["schemas"]["ServiceResponse"];

interface ServicesListProps {
	collaborationRequests: PostResponse[];
	services: ServiceResponse[];
	onChatClick: (userId: string) => void;
	hasActiveFilters?: boolean;
	onClearFilters?: () => void;
}

function ServicesListComponent({
	collaborationRequests,
	services,
	onChatClick,
	hasActiveFilters = false,
	onClearFilters,
}: ServicesListProps) {
	const hasNoData = collaborationRequests.length === 0 && services.length === 0;

	if (hasNoData) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
				<div className="max-w-md flex flex-col items-center justify-center">
					<h2 className="text-2xl font-semibold text-gray-700 mb-2">
						{hasActiveFilters
							? "No results match your filters"
							: "No services available"}
					</h2>
					<p className="text-gray-500 mb-4">
						{hasActiveFilters
							? "Try adjusting your search or clearing filters to see more results."
							: "Check back later for collaboration requests and services in your area."}
					</p>
					{hasActiveFilters && onClearFilters && (
						<Button
							variant="primary"
							onClick={onClearFilters}
							className="text-black">
							Clear filters
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8 pb-20 w-full max-w-200 mx-auto">
			{/* Results Count */}
			<div className="px-4">
				<p className="text-base text-gray-600">
					Showing{" "}
					{collaborationRequests.length > 0 && (
						<span className="font-semibold">
							{collaborationRequests.length} collaboration{" "}
							{collaborationRequests.length === 1 ? "request" : "requests"}
						</span>
					)}
					{collaborationRequests.length > 0 && services.length > 0 && (
						<span>, </span>
					)}
					{services.length > 0 && (
						<span className="font-semibold">
							{services.length} {services.length === 1 ? "service" : "services"}
						</span>
					)}
				</p>
			</div>

			{/* Collaboration Requests Section */}
			{collaborationRequests.length > 0 && (
				<section>
					<h2 className="text-xl font-semibold mb-4 px-4">Collaborations</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 px-4">
						{collaborationRequests.map((request) => (
							<CollaborationRequestCard
								key={request.id}
								post={request}
								onChatClick={onChatClick}
							/>
						))}
					</div>
				</section>
			)}

			{/* Services Section */}
			{services.length > 0 && (
				<section>
					<h2 className="text-xl font-semibold mb-4 px-4">Services</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 px-4">
						{services.map((service) => (
							<ServiceCard
								key={service.id}
								service={service}
								onChatClick={onChatClick}
							/>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

export const ServicesList = memo(ServicesListComponent);
