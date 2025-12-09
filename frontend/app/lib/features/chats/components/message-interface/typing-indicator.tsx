import { Avatar, getInitials } from "@/app/components/avatar";
import { STYLES } from "../../constants";
import { useTypingStore } from "../../stores/typingStore";
import { Participant } from "../../types";

type TypingIndicatorProps = {
  conversationId: string;
  currentUserId: string;
  participants: Participant[];
};

export function TypingIndicator({
  conversationId,
  currentUserId,
  participants,
}: TypingIndicatorProps) {
  const typingUsers = useTypingStore(
    (state) => state.typingUsers[conversationId]
  );

  if (!typingUsers || typingUsers.size === 0) return null;

  // Filter out self
  const otherTypingUsers = Array.from(typingUsers).filter(
    (id) => id !== currentUserId
  );

  if (otherTypingUsers.length === 0) return null;

  // Get the first typing user to show their avatar
  const firstTypingUserId = otherTypingUsers[0];
  const participant = participants.find(
    (p) => p.user?.id === firstTypingUserId
  );
  const user = participant?.user;

  return (
    <div className="flex gap-2 mb-4">
      <Avatar
        src={user?.avatarUrl}
        alt={user?.username || "User"}
        fallback={getInitials(user?.firstName, user?.lastName)}
        size="sm"
        className="mt-2"
      />

      <div className="flex flex-col items-start max-w-[70%]">
        <div
          className={`px-4 py-3 rounded-2xl ${STYLES.MESSAGE_BUBBLE.received}`}
        >
          <div className="flex gap-1 h-4 items-center">
            <span className="w-1.5 h-1.5 bg-grey opacity-60 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-grey opacity-60 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-grey opacity-60 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
