"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/app/components/tabs";
import { NoteForm } from "./note-form";
import { RequestForm } from "./request-form";
import { useCreatePost } from "../hooks/use-create-post";
import type { CreatePostBody, UploadedMedia } from "../types";

export function CreateForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"note" | "story" | "request">("note");
  const { mutate: createPost, isPending } = useCreatePost({
    onSuccess: () => {
      // Redirect to feed on success
      router.push("/");
    },
    onError: (error) => {
      alert(`Failed to create post: ${error.message}`);
    },
  });

  const handleNoteSubmit = (data: {
    title: string;
    description: string;
    tags?: string[];
    taggedUsers?: string[];
    media?: UploadedMedia[];
  }) => {
    const postData: CreatePostBody = {
      type: "note",
      title: data.title,
      description: data.description,
      tags: data.tags,
      taggedUsers: data.taggedUsers,
      media: data.media?.map((m) => ({
        url: m.url,
        type: m.type,
        thumbnailUrl: m.thumbnailUrl || undefined, // Convert null to undefined
      })),
    };

    createPost(postData);
  };

  const handleRequestSubmit = (data: {
    title: string;
    description: string;
    location?: string;
    genres?: string[];
    paidOpportunity?: boolean;
    taggedUsers?: string[];
    media?: UploadedMedia[];
  }) => {
    const postData: CreatePostBody = {
      type: "request",
      title: data.title,
      description: data.description,
      location: data.location,
      genres: data.genres,
      paidOpportunity: data.paidOpportunity,
      taggedUsers: data.taggedUsers,
      media: data.media?.map((m) => ({
        url: m.url,
        type: m.type,
        thumbnailUrl: m.thumbnailUrl || undefined, // Convert null to undefined
      })),
    };

    createPost(postData);
  };

  return (
    <div className="w-full">
      <Tabs variant="create" activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="note">
          <NoteForm onSubmit={handleNoteSubmit} isSubmitting={isPending} />
        </TabsContent>
        <TabsContent value="story">
          <div className="py-8 text-center text-gray-500">
            Story feature coming soon!
          </div>
        </TabsContent>
        <TabsContent value="request">
          <RequestForm onSubmit={handleRequestSubmit} isSubmitting={isPending} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
