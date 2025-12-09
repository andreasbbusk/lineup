import { Conversation } from "../types";

export const getConversationDisplayInfo = (
  conversation: Conversation,
  userId: string
) => {
  if (conversation.type === "group") {
    if (!conversation.name) {
      throw new Error("Group conversation missing name");
    }
    return {
      name: conversation.name,
      avatarUrl: conversation.avatarUrl,
      otherUser: null,
    };
  }

  const otherUser = conversation.participants?.find(
    (participant) => participant.userId !== userId
  )?.user;

  if (!otherUser) {
    throw new Error("Direct conversation missing participant data");
  }

  return {
    name: `${otherUser.firstName} ${otherUser.lastName}`,
    avatarUrl: otherUser.avatarUrl,
    otherUser,
  };
};
