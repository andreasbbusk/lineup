"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/app/modules/components/tabs";
import { NoteForm } from "./note-form";
import { RequestForm } from "./request-form";
import { useCreatePost } from "@/app/modules/hooks/mutations";
import { useUpload } from "@/app/modules/hooks/useUpload";
import { useMyProfile } from "@/app/modules/features/profiles";
import type { CreatePostBody, UploadedMedia } from "../../types";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";

export function CreateForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"note" | "story" | "request">(
    "note"
  );

  // Fetch user profile once at parent level
  const {
    data: currentUser,
    isPending: isLoadingProfile,
    error: profileError,
  } = useMyProfile();

  const { mutate: createPost, isPending } = useCreatePost({
    onSuccess: () => {
      router.push("/");
    },
    onError: (error) => {
      alert(`Failed to create post: ${error.message}`);
    },
  });
  const { uploadMultipleToSupabase } = useUpload();

  const handleNoteSubmit = async (data: {
    title: string;
    description: string;
    tags?: string[];
    taggedUsers?: string[];
    media?: UploadedMedia[];
  }) => {
    try {
      // Upload media files to Supabase if they haven't been uploaded yet
      let uploadedMedia = data.media;
      if (data.media && data.media.length > 0) {
        const needsUpload = data.media.some((m) => m.file);
        console.log("Media upload check:", {
          mediaCount: data.media.length,
          needsUpload,
          mediaUrls: data.media.map((m) => m.url),
        });

        if (needsUpload) {
          console.log("Uploading media to Supabase...");
          uploadedMedia = await uploadMultipleToSupabase(data.media, "post");
          console.log(
            "Upload complete! URLs:",
            uploadedMedia.map((m) => m.url)
          );
        } else {
          console.log("Media already uploaded, using existing URLs");
        }
      }

      const postData: CreatePostBody = {
        type: "note",
        title: data.title,
        description: data.description,
        tags: data.tags,
        taggedUsers: data.taggedUsers,
        media: uploadedMedia?.map((m) => ({
          url: m.url,
          type: m.type,
          thumbnailUrl: m.thumbnailUrl || undefined, // Convert null to undefined
        })),
      };

      console.log(
        "Creating post with media URLs:",
        postData.media?.map((m) => m.url)
      );
      createPost(postData);
    } catch (error) {
      console.error("Error in handleNoteSubmit:", error);
      alert(
        `Failed to upload media: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleRequestSubmit = async (data: {
    title: string;
    description: string;
    location?: string;
    genres?: string[];
    paidOpportunity?: boolean;
    taggedUsers?: string[];
    media?: UploadedMedia[];
  }) => {
    try {
      // Upload media files to Supabase if they haven't been uploaded yet
      let uploadedMedia = data.media;
      if (data.media && data.media.some((m) => m.file)) {
        uploadedMedia = await uploadMultipleToSupabase(data.media, "post");
      }

      const postData: CreatePostBody = {
        type: "request",
        title: data.title,
        description: data.description,
        location: data.location,
        genres: data.genres,
        paidOpportunity: data.paidOpportunity,
        taggedUsers: data.taggedUsers,
        media: uploadedMedia?.map((m) => ({
          url: m.url,
          type: m.type,
          thumbnailUrl: m.thumbnailUrl || undefined, // Convert null to undefined
        })),
      };

      createPost(postData);
    } catch (error) {
      alert(
        `Failed to upload media: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Show error if profile fails to load
  if (profileError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Failed to load user profile</p>
        <p className="text-sm text-gray-500 mt-2">{profileError.message}</p>
      </div>
    );
  }

  // Show skeleton while loading profile
  if (isLoadingProfile || !currentUser) {
    return <LoadingSpinner />;
  }

  return (
    <Tabs
      className="bg-white min-h-full"
      variant="create"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <TabsContent value="note">
        <NoteForm
          onSubmit={handleNoteSubmit}
          isSubmitting={isPending}
          currentUser={currentUser}
        />
      </TabsContent>
      <TabsContent value="story">
        <div className="flex self-center m-5 pt-56 pr-20 pb-56.75 pl-23.25 flex-col items-center rounded-[1.4375rem] bg-[#878787] text-white text-center text-5 font-bold">
          Story feature coming soon!
        </div>
      </TabsContent>
      <TabsContent value="request">
        <RequestForm
          onSubmit={handleRequestSubmit}
          isSubmitting={isPending}
          currentUser={currentUser}
        />
      </TabsContent>
    </Tabs>
  );
}
