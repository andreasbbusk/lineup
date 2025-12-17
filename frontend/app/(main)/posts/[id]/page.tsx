"use client";

import { use } from "react";
import { usePost } from "@/app/modules/hooks/queries";
import { PostDetail } from "@/app/modules/features/posts/components/post-detail";
import { PageTransition } from "@/app/modules/components/page-transition";

interface PostDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PostDetailsPageProps) {
  const { id } = use(params);
  const { data: post, isLoading, error } = usePost(id || "");

  if (!id) {
    return (
      <main className="space-y-4">
        <h1 className="text-h1 font-semibold">Post</h1>
        <p className="text-body text-red-500">Missing post id.</p>
      </main>
    );
  }

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
        <h1 className="text-h1 font-semibold">Post</h1>
        <p className="text-body text-red-500">
          Error loading post: {error.message}
        </p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="space-y-4">
        <h1 className="text-h1 font-semibold">Post</h1>
        <p className="text-body text-grey">Post not found.</p>
      </main>
    );
  }

  return (
    <PageTransition>
      <PostDetail
        post={{ ...post, paidOpportunity: post.paidOpportunity ?? false }}
      />
    </PageTransition>
  );
}
