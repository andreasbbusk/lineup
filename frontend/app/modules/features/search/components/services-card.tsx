"use client";

import { memo } from "react";
import { Avatar, getInitials } from "@/app/modules/components/avatar";
import { Divider } from "@/app/modules/features/profiles/components/edit/divider";
import Link from "next/link";
import type { ServiceSearchResult } from "../types";
import Image from "next/image";
import { formatDate, formatServiceType, extractCity } from "../utils/helpers";

interface ServiceSearchResultCardProps {
	service: ServiceSearchResult;
}

function ServiceSearchResultCardComponent({
	service,
}: ServiceSearchResultCardProps) {
	const providerInitials = getInitials(service.providerName, null);

	return (
		<article className="max-w-md flex p-3.75 flex-col w-full justify-center gap-2.5 bg-white rounded-3xl border border-grey/10">
			<div className="flex justify-between items-center">
				<div className="flex gap-1.25 text-gray-500 items-center">
					<Link
						href={`/services/${service.id}`}
						className="flex flex-row items-center gap-1.25">
						<Avatar
							size="xs"
							fallback={providerInitials}
							src={service.providerAvatarUrl}
							alt={`${service.providerName}'s avatar`}
						/>
						<p className="text-gray-700 text-sm truncate">
							{service.providerName}
						</p>
					</Link>
					{service.serviceType && (
						<p className="text-sm font-medium truncate">
							offers #{formatServiceType(service.serviceType)}
						</p>
					)}
				</div>
				<Image width={20} height={20} src="/icons/home-sale.svg" alt="Sales" />
			</div>
			<Divider />
			<h3 className="px-2.5 text-base font-semibold">{service.title}</h3>

			<p className="px-2.5 line-clamp-4 text-gray-600">{service.description}</p>
			<div className="px-2.5 flex self-stretch gap-2.5 items-center justify-between">
				<Link
					href={`/services/${service.id}`}
					className="text-[#555] font-semibold text-sm hover:underline">
					Read more
				</Link>
				<div className="flex justify-end gap-1.25 text-gray-400">
					{extractCity(service.location) && (
						<p className="text-sm">{extractCity(service.location)}</p>
					)}
					{extractCity(service.location) && (
						<span className="text-sm"> - </span>
					)}
					<p className="text-sm">{formatDate(service.createdAt)}</p>
				</div>
			</div>
		</article>
	);
}

export const ServiceSearchResultCard = memo(ServiceSearchResultCardComponent);
