"use client";

import { memo, useState } from "react";
import { Avatar } from "@/app/modules/components/avatar";
import { Separator } from "@/app/modules/components/separator";
import {
  formatTimeAgo,
  formatServiceType,
  extractCity,
} from "@/app/modules/utils/date";
import Link from "next/link";
import Image from "next/image";
import type { components } from "@/app/modules/types/api";

type ServiceResponse = components["schemas"]["ServiceResponse"];

interface ServiceCardProps {
  service: ServiceResponse;
  onChatClick: (userId: string) => void;
}

function ServiceCardComponent({ service, onChatClick }: ServiceCardProps) {
  const [imageError, setImageError] = useState(false);
  const providerName = service.providerName || "Provider";
  const providerInitial = providerName[0]?.toUpperCase() || "P";

  return (
    <article className="flex p-3.75 flex-col w-full min-h-112 justify-center gap-2.5 bg-white rounded-xl border border-grey/10 hover:shadow-md transition-shadow cursor-pointer">
      <Link
        href={`/services/${service.id}`}
        className="flex flex-col flex-1 min-h-0 gap-2.5"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1.25 items-center flex-1 min-w-0">
            <Avatar
              size="xs"
              fallback={providerInitial}
              src={null}
              alt={`${providerName}'s avatar`}
            />
            <p className="text-black text-base truncate">{providerName}</p>
            {service.serviceType && (
              <>
                <p className="text-base text-gray-500">offers</p>
                <p className="text-base text-gray-500 truncate">
                  #{formatServiceType(service.serviceType)}
                </p>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Title */}
        <h3 className="px-2.5 text-lg font-bold text-foreground">
          {service.title}
        </h3>

        {/* Content area - grows to fill space */}
        <div className="flex flex-col flex-1 min-h-0 gap-2.5">
          {/* Media */}
          {service.mediaUrl && !imageError && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <Image
                src={service.mediaUrl}
                alt={service.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Description */}
          <p className="px-2.5 line-clamp-3 text-gray-600 text-base">
            {service.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-2.5 flex self-stretch gap-2.5 items-center justify-between">
          <span className="text-[#555] font-semibold text-base">Read more</span>
          <div className="flex gap-1.25 text-gray-400 text-base items-center">
            {extractCity(service.location) && (
              <>
                <p className="text-base">{extractCity(service.location)}</p>
                <span className="text-base"> - </span>
              </>
            )}
            <p className="text-base">{formatTimeAgo(service.createdAt)}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export const ServiceCard = memo(ServiceCardComponent);
