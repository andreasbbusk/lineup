"use client";

import { useState } from "react";
import { Avatar, getInitials } from "@/app/modules/components/avatar";
import { X } from "lucide-react";
import { useRemoveParticipant } from "../../hooks/query/conversationMutations";
import { ConfirmationDialog } from "../confirmation-dialog";
import type { Conversation } from "../../types";
import Link from "next/link";

interface MembersSectionProps {
	conversation: Conversation;
	isCreator: boolean;
	currentUserId: string;
}

export function MembersSection({
	conversation,
	isCreator,
	currentUserId,
}: MembersSectionProps) {
	const [memberToRemove, setMemberToRemove] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const { mutate: removeParticipant, isPending } = useRemoveParticipant();

	const participants = conversation.participants ?? [];

	const handleRemoveClick = (userId: string, displayName: string) => {
		setMemberToRemove({ id: userId, name: displayName });
	};

	const handleConfirmRemove = () => {
		if (!memberToRemove) return;

		removeParticipant(
			{
				conversationId: conversation.id,
				userId: memberToRemove.id,
			},
			{
				onSuccess: () => {
					setMemberToRemove(null);
				},
				onError: () => {
					setMemberToRemove(null);
				},
			}
		);
	};

	const handleCancelRemove = () => {
		setMemberToRemove(null);
	};

	return (
		<>
			<div className="flex flex-col gap-2">
				<h3 className="text-sm font-semibold">Members</h3>
				<div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
					{participants.map((participant) => {
						const isAdmin = participant.userId === conversation.createdBy;
						const fullName = [
							participant.user?.firstName,
							participant.user?.lastName,
						]
							.filter(Boolean)
							.join(" ");
						const displayName =
							fullName || participant.user?.username || "Unknown";
						const canRemove =
							isCreator && !isAdmin && participant.userId !== currentUserId;

						return (
							<div
								key={participant.userId}
								className="flex items-center gap-3 p-2 rounded-lg hover:bg-grey-light/20">
								<Link href={`/profile/${participant.user?.username}`}>
									<Avatar
										src={participant.user?.avatarUrl}
										alt={displayName}
										fallback={getInitials(
											participant.user?.firstName,
											participant.user?.lastName
										)}
										size="md"
										className="rounded-full"
									/>
								</Link>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-black truncate">
										{displayName}
										{participant.userId === currentUserId && " (You)"}
									</p>
									<p className="text-xs text-grey truncate">
										@{participant.user?.username}
									</p>
								</div>
								{canRemove && (
									<button
										onClick={() =>
											handleRemoveClick(participant.userId, displayName)
										}
										className="size-8 flex items-center justify-center text-grey hover:text-red-500 active:scale-95 transition-all"
										title={`Remove ${displayName}`}>
										<X className="size-5" />
									</button>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<ConfirmationDialog
				open={!!memberToRemove}
				title="Remove Member"
				description={`Are you sure you want to remove ${memberToRemove?.name} from this group?`}
				confirmText="Remove"
				cancelText="Cancel"
				isDestructive
				isLoading={isPending}
				onConfirm={handleConfirmRemove}
				onCancel={handleCancelRemove}
			/>
		</>
	);
}
