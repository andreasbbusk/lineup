"use client";

import { memo } from "react";
import { CollaborationRequestCard } from "./collaboration-request-card";
import { ServiceCard } from "./service-card";
import type { PostResponse } from "@/app/modules/api/postsApi";
import type { components } from "@/app/modules/types/api";

type ServiceResponse = components["schemas"]["ServiceResponse"];

interface ServicesListProps {
  collaborationRequests: PostResponse[];
  services: ServiceResponse[];
  onChatClick: (userId: string) => void;
}

function ServicesListComponent({
  collaborationRequests,
  services,
  onChatClick,
}: ServicesListProps) {
  const hasNoData =
    collaborationRequests.length === 0 && services.length === 0;

  if (hasNoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No services available
          </h2>
          <p className="text-gray-500">
            Check back later for collaboration requests and services in your
            area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Collaboration Requests Section */}
      {collaborationRequests.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 px-4">
            Collaborations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
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
          <h2 className="text-xl font-semibold mb-4 px-4">
            Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
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
