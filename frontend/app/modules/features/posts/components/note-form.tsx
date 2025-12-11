"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/modules/components/buttons";
// import { Tags } from "@/app/components/tags"; // Disabled - metadata not ready
import { MediaUploader } from "./media-uploader";
// import { TagSelector } from "./tag-selector"; // Disabled - metadata not ready
import { UserTagger } from "./user-tagger";
import { useNoteDraftAutoSave } from "../hooks/useDraftAutoSave";
import type { UploadedMedia } from "../types";
import { Avatar } from "@/app/modules/components/avatar";
import { useMyProfile } from "@/app/modules/features/profiles/hooks/queries/useProfile";
import Image from "next/image";

interface NoteFormProps {
	onSubmit: (data: {
		title: string;
		description: string;
		tags?: string[];
		taggedUsers?: string[];
		media?: UploadedMedia[];
	}) => void;
	isSubmitting?: boolean;
}

export function NoteForm({ onSubmit, isSubmitting = false }: NoteFormProps) {
	const { data: currentUser } = useMyProfile();
	const {
		title,
		description,
		tags,
		taggedUsers,
		taggedUserObjects,
		media,
		updateTitle,
		updateDescription,
		updateTaggedUsers,
		updateTaggedUserObjects,
		updateMedia,
		clearDraft,
		restoreDraft,
	} = useNoteDraftAutoSave();

	const [isUserTaggerOpen, setIsUserTaggerOpen] = useState(false);
	const [isRestoring, setIsRestoring] = useState(true);

	// Restore draft on mount
	useEffect(() => {
		const loadDraft = async () => {
			try {
				const draft = await restoreDraft();
				if (draft.title || draft.description || draft.media.length > 0) {
					// Draft exists, values are already in store from restoreDraft
					// The store will have the restored values
				}
			} catch (error) {
				console.error("Failed to restore draft:", error);
			} finally {
				setIsRestoring(false);
			}
		};

		loadDraft();
	}, [restoreDraft]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!title.trim()) {
			alert("Please enter a title");
			return;
		}

		if (description.trim().length < 10) {
			alert("Description must be at least 10 characters");
			return;
		}

		if (description.trim().length > 5000) {
			alert("Description must be less than 5000 characters");
			return;
		}

		onSubmit({
			title: title.trim(),
			description: description.trim(),
			tags: tags.length > 0 ? tags : undefined,
			taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
			media: media.length > 0 ? media : undefined,
		});

		// Clear draft after successful submission
		clearDraft();
	};

	const remainingChars = 5000 - description.length;

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-[1.5625rem] w-full min-h-full border-t border-gray-200 pt-6">
			<div
				className={
					isUserTaggerOpen
						? "rounded-[1.875rem] border border-[rgba(0,0,0,0.07)]"
						: "flex  justify-between items-center"
				}>
				<div className="w-full flex justify-between items-center p-[0.625rem]">
					<div className="flex items-center gap-2.5">
						<div className="flex">
							<Avatar
								size="sm"
								src={currentUser?.avatarUrl ?? undefined}
								fallback={
									(currentUser?.firstName?.charAt(0)?.toUpperCase() ?? "") +
										(currentUser?.lastName?.charAt(0)?.toUpperCase() ?? "") ||
									"UU"
								}
								alt={
									currentUser
										? `${currentUser.username}'s avatar`
										: "User avatar"
								}
							/>
							{taggedUserObjects.length > 0 && (
								<Avatar
									className="-ml-2"
									size="sm"
									fallback={(taggedUserObjects[0]?.firstName ||
										taggedUserObjects[0]?.username ||
										"U")[0].toUpperCase()}
									src={taggedUserObjects[0]?.avatarUrl ?? undefined}
									alt={taggedUserObjects[0]?.username || "User avatar"}
								/>
							)}
						</div>
						<p className="text-[#555] text-center font-['Helvetica_Now_Display'] text-lg font-normal leading-[1.1875rem] tracking-[0.03125rem]">
							{(() => {
								const names = [
									currentUser?.firstName || currentUser?.username || "User",
									...(taggedUserObjects.map(
										(u) => u.firstName || u.username || "User"
									) || []),
								];
								if (names.length === 1) return names[0];
								if (names.length === 2) return ` ${names[0]} and ${names[1]}`;
								return `${names.slice(0, -1).join(", ")} and ${
									names[names.length - 1]
								}`;
							})()}
						</p>
					</div>
					{/* Tag People - Show appropriate button based on state */}

					{!isUserTaggerOpen && taggedUsers.length === 0 ? (
						<Button
							type="button"
							variant="primary"
							onClick={() => setIsUserTaggerOpen(true)}
							icon="plus">
							Add people
						</Button>
					) : (
						<button
							className="pr-[0.1325rem] text-gray-500"
							type="button"
							onClick={() => {
								if (isUserTaggerOpen) {
									setIsUserTaggerOpen(false);
								} else {
									updateTaggedUsers([]);
									updateTaggedUserObjects([]);
								}
							}}>
							Cancel
						</button>
					)}
				</div>
				{isUserTaggerOpen && (
					<UserTagger
						selectedUsers={taggedUsers}
						selectedUserObjects={taggedUserObjects}
						onUsersChange={updateTaggedUsers}
						onUserObjectsChange={updateTaggedUserObjects}
						isOpen={true}
						onClose={() => setIsUserTaggerOpen(false)}
					/>
				)}
			</div>

			<button className="flex items-center gap-[0.2125rem]">
				<Image src="/icons/plus.svg" alt="Add tags" width={24} height={24} />
				Add tags
			</button>

			{/* Title */}
			<input
				type="text"
				value={title}
				onChange={(e) => updateTitle(e.target.value)}
				placeholder="Write a title..."
				maxLength={100}
				disabled={isRestoring}
				className="flex h-[3.75rem] p-[0.625rem] items-center gap-[0.625rem] flex-[1_0_0] rounded-[0.5rem] bg-[#F1F1F1]"
			/>

			{/* Media */}
			<MediaUploader media={media} onMediaChange={updateMedia} />

			{/* Description */}
			<textarea
				value={description}
				onChange={(e) => updateDescription(e.target.value)}
				placeholder="Write a description..."
				rows={6}
				maxLength={5000}
				disabled={isRestoring}
				className="flex p-[0.625rem] items-center gap-[0.625rem] rounded-[0.5rem] bg-[#F1F1F1]"
			/>

			{/* Submit */}
			<div className="flex justify-end pt-4">
				<Button
					type="submit"
					variant="primary"
					disabled={
						isSubmitting || !title.trim() || description.trim().length < 10
					}
					onClick={() => {}} // Required by Button component, form handles submit
					className="w-[6.85rem] items-center justify-center ">
					{isSubmitting ? "Posting..." : "Post"}
				</Button>
			</div>
		</form>
	);
}
