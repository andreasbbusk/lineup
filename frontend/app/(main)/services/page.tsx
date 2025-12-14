"use client";

import { usePosts } from "@/app/modules/hooks/queries/usePosts";
import { useServices } from "@/app/modules/hooks/queries/useServices";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";

export default function TestPage() {
  const { data: requests, isLoading: loadingRequests } = usePosts({
    type: "request",
    status: "active",
  });

  const { data: services, isLoading: loadingServices } = useServices();

  if (loadingRequests || loadingServices) return <LoadingSpinner />;

  return (
    <div className="p-4">
      <h2>Collaboration Requests ({requests?.data?.length || 0})</h2>
      <pre>{JSON.stringify(requests, null, 2)}</pre>

      <h2>Services ({services?.data?.length || 0})</h2>
      <pre>{JSON.stringify(services, null, 2)}</pre>
    </div>
  );
}
