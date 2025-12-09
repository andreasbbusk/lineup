"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ChevronLeft } from "lucide-react";
import {
  useConversation,
  useLeaveConversation,
} from "@/app/lib/features/chats";
import { useAppStore } from "@/app/lib/stores/app-store";
import { GroupInfoSection } from "@/app/lib/features/chats/components/settings-interface/group-info-section";
import { MembersSection } from "@/app/lib/features/chats/components/settings-interface/members-section";
import { AddMembersSection } from "@/app/lib/features/chats/components/settings-interface/add-members-section";

interface GroupSettingsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function GroupSettingsPage({ params }: GroupSettingsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const { data: conversation } = useConversation(id);
  const { mutate: leaveConversation, isPending: isLeaving } =
    useLeaveConversation();

  const isCreator = conversation?.createdBy === user?.id;

  const handleLeaveGroup = () => {
    if (isLeaving) return;

    leaveConversation(id, {
      onSuccess: () => {
        router.push("/chats?tab=groups");
      },
    });
  };

  if (!conversation) return null;

  return (
    <main className="h-dvh bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push(`/chats/${id}`)}
            className="active:scale-95 transition-transform"
          >
            <ChevronLeft className="size-6 text-black" />
          </button>
          <h1 className="text-lg font-semibold text-black">Group Settings</h1>
        </div>
      </header>

      {conversation.type === "group" && (
        <div className="px-4 py-6 flex flex-col gap-6">
          {/* Group Info Section */}
          <GroupInfoSection conversation={conversation} isCreator={isCreator} />

          {/* Members Section */}
          <MembersSection
            conversation={conversation}
            isCreator={isCreator}
            currentUserId={user?.id ?? ""}
          />

          {/* Add Members Section (creator only) */}
          {isCreator && (
            <AddMembersSection
              conversationId={id}
              currentParticipantIds={
                conversation?.participants?.map((p) => p.userId) || []
              }
            />
          )}

          {/* Leave Group (non-creators only) */}
          {!isCreator && (
            <div className="flex flex-col gap-2 mt-4 border-t border-grey-light pt-6">
              <button
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="py-2 px-4 bg-red-500 text-white rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLeaving ? "Leaving..." : "Leave Group"}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
