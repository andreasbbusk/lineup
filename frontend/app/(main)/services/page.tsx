"use client";

import { usePosts } from "@/app/modules/hooks/queries/usePosts";
import { useServices } from "@/app/modules/hooks/queries/useServices";
import { useStartChat } from "@/app/modules/hooks";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import { ServicesList } from "@/app/modules/features/services/components/services-list";

export default function ServicesPage() {
  const { data: requestsData, isLoading: loadingRequests } = usePosts({
    type: "request",
    status: "active",
  });

  const { data: servicesData, isLoading: loadingServices } = useServices();

  const startChat = useStartChat();

  if (loadingRequests || loadingServices) {
    return <LoadingSpinner />;
  }

  const collaborationRequests = requestsData?.data || [];
  const services = servicesData?.data || [];

  return (
    <div className="bg-background pt-6">
      <ServicesList
        collaborationRequests={collaborationRequests}
        services={services}
        onChatClick={startChat}
      />
    </div>
  );
}
