"use client";

import { useState } from "react";
import { Avatar, getInitials } from "@/app/modules/components/avatar";
import { Camera, Check, X } from "lucide-react";
import { useUpdateConversation } from "../../hooks/query/conversationMutations";
import type { Conversation } from "../../types";

interface GroupInfoSectionProps {
	conversation: Conversation;
	isCreator: boolean;
}

export function GroupInfoSection({
	conversation,
	isCreator,
}: GroupInfoSectionProps) {
	const [isEditingName, setIsEditingName] = useState(false);
	const [editedName, setEditedName] = useState(conversation.name || "");
	const { mutate: updateConversation, isPending } = useUpdateConversation();

	const handleSaveName = () => {
		if (!editedName.trim() || editedName === conversation.name) {
			setIsEditingName(false);
			setEditedName(conversation.name || "");
			return;
		}

		updateConversation(
			{
				conversationId: conversation.id,
				data: { name: editedName.trim() },
			},
			{
				onSuccess: () => {
					setIsEditingName(false);
				},
				onError: () => {
					// Revert on error
					setEditedName(conversation.name || "");
					setIsEditingName(false);
				},
			}
		);
	};

	const handleCancelEdit = () => {
		setEditedName(conversation.name || "");
		setIsEditingName(false);
	};

	const handleAvatarClick = () => {
		// TODO: Wire up upload logic when global upload config ready
		console.log("Avatar upload placeholder - not implemented yet");
	};

	return (
		<div className="flex flex-col items-center bg-[#1E1E1E] relative text-white w-93.25 py-6.25 justify-center gap-3.75 rounded-[2.8125rem] ">
			{/* Avatar */}
			<div className="relative ">
				<Avatar
					src={conversation.avatarUrl}
					alt={conversation.name || "Group"}
					fallback={getInitials(conversation.name?.split(" ")[0])}
					size="xl"
					className="border border-white rounded-full"
				/>
				{isCreator && (
					<button
						onClick={handleAvatarClick}
						className="absolute bottom-0 right-0 size-8 text-white rounded-full flex items-center justify-center active:scale-95 transition-transform"
						title="Change avatar (coming soon)">
						<Camera className="size-4" />
					</button>
				)}
			</div>

			{/* Group Name */}
			<div className="flex flex-col items-center gap-2 w-full max-w-xs">
				{isEditingName && isCreator ? (
					<div className="flex items-center gap-2 w-full">
						<input
							type="text"
							value={editedName}
							onChange={(e) => setEditedName(e.target.value)}
							maxLength={100}
							disabled={isPending}
							className="flex-1 text-xl font-semibold text-black text-center border-b border-grey-light focus:outline-none focus:border-dark-cyan-blue px-2 py-1"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSaveName();
								if (e.key === "Escape") handleCancelEdit();
							}}
						/>
						<button
							onClick={handleSaveName}
							disabled={isPending}
							className="size-8 bg-dark-cyan-blue text-white rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50">
							<Check className="size-4" />
						</button>
						<button
							onClick={handleCancelEdit}
							disabled={isPending}
							className="size-8 bg-grey-light text-black rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50">
							<X className="size-4" />
						</button>
					</div>
				) : (
					<button
						onClick={() => isCreator && setIsEditingName(true)}
						disabled={!isCreator}
						className={`text-xl font-semibold text-white ${
							isCreator ? "hover:text-dark-cyan-blue cursor-pointer" : ""
						}`}>
						{conversation.name || "Unnamed Group"}
					</button>
				)}
			</div>

			<div className="flex flex-col items-center gap-1">
				{/* Member Count */}
				<p className="text-sm text-white/60">
					{conversation.participants?.length || 0}
					<span> </span>
					{conversation.participants?.length === 1 ? "member" : "members"}
				</p>

				{/* Created Date */}
				{conversation.createdAt && (
					<p className="text-xs text-white/60">
						Created
						{new Date(conversation.createdAt).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</p>
				)}
			</div>
		</div>
	);
}
