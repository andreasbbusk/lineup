"use client";

import { usePost } from "@/app/modules/hooks/queries";
import { PostDetail } from "@/app/modules/features/posts/components/post-detail";

interface PostDetailsPageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PostDetailsPageProps) {
  const { data: post, isLoading, error } = usePost(params.id);

  if (isLoading) {
    return (
      <main className="space-y-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-4">
        <h1 className="text-h1 font-semibold">Opslag</h1>
        <p className="text-body text-red-500">
          Fejl ved indlæsning af opslag: {error.message}
        </p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="space-y-4">
        <h1 className="text-h1 font-semibold">Opslag</h1>
        <p className="text-body text-grey">Opslag ikke fundet.</p>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <PostDetail post={post} />
    </main>
  );
}
