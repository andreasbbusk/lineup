"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/modules/components/buttons";
import { MediaUploader } from "./media-uploader";
import { UserTagger } from "./user-tagger";
import { useRequestDraftAutoSave } from "../hooks/useDraftAutoSave";
import type { UploadedMedia } from "../types";
import { Avatar } from "@/app/modules/components/avatar";
import { useMyProfile } from "@/app/modules/features/profiles/hooks/queries/useProfile";
import Image from "next/image";
import { Tags } from "@/app/modules/components/tags";
import { Toggle } from "@/app/modules/components/toggle";
import { GenreSelector } from "./genre-selector";
import { Combobox } from "@/app/modules/components/combobox";

interface RequestFormProps {
	onSubmit: (data: {
		title: string;
		description: string;
		location?: string;
		genres?: string[];
		paidOpportunity?: boolean;
		taggedUsers?: string[];
		media?: UploadedMedia[];
	}) => void;
	isSubmitting?: boolean;
}

// Fetch metadata for genres - DISABLED: Metadata endpoint not ready
// async function fetchGenres() {
// 	const baseUrl =
// 		process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
// 	const response = await fetch(`${baseUrl}/api/metadata`);
// 	if (!response.ok) throw new Error("Failed to fetch metadata");
// 	const data = await response.json();
// 	return data.genres || [];
// }

export function RequestForm({
	onSubmit,
	isSubmitting = false,
}: RequestFormProps) {
	const { data: currentUser } = useMyProfile();
	const {
		title,
		description,
		location,
		genres,
		paidOpportunity,
		taggedUsers,
		taggedUserObjects,
		media,
		updateTitle,
		updateDescription,
		updatePaidOpportunity,
		updateTaggedUsers,
		updateLocation,
		// updateGenres,
		updateTaggedUserObjects,
		updateMedia,
		clearDraft,
		restoreDraft,
	} = useRequestDraftAutoSave();

	const [isUserTaggerOpen, setIsUserTaggerOpen] = useState(false);
	const [isRestoring, setIsRestoring] = useState(true);
	const [isGenreSelectorOpen, setIsGenreSelectorOpen] = useState(false);
	// const [availableGenres, setAvailableGenres] = useState<{ name: string }[]>(
	// 	[]
	// ); // Disabled
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	const updateSelectedGenres = (newGenres: string[]) => {
		// Only allow one genre to be selected at a time
		if (newGenres.length > 0) {
			setSelectedGenres([newGenres[newGenres.length - 1]]);
			setIsGenreSelectorOpen(false);
		} else {
			setSelectedGenres([]);
		}
	};

	const removeGenre = (genreToRemove: string) => {
		setSelectedGenres([]);
	};

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
			location: location.trim() || undefined,
			genres: genres.length > 0 ? genres : undefined,
			paidOpportunity: paidOpportunity || undefined,
			taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
			media: media.length > 0 ? media : undefined,
		});

		// Clear draft after successful submission
		clearDraft();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-6.25 w-full min-h-full border-t border-gray-200 pt-6">
			<div
				className={
					isUserTaggerOpen
						? "rounded-[1.875rem] border border-[rgba(0,0,0,0.07)]"
						: "flex  justify-between items-center"
				}>
				<div className="w-full flex justify-between items-center p-2.5">
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
						<p className="text-[#555] text-center text-lg">
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

			{/* Title */}
			<input
				type="text"
				value={title}
				onChange={(e) => updateTitle(e.target.value)}
				placeholder="Write a title..."
				maxLength={100}
				disabled={isRestoring}
				className="flex h-15 p-2.5 items-center gap-2.5 flex-[1_0_0] rounded-lg bg-[#F1F1F1]"
			/>

			{/* Media */}
			<MediaUploader media={media} onMediaChange={updateMedia} />

			{/* Description */}
			<textarea
				value={description}
				onChange={(e) => updateDescription(e.target.value)}
				placeholder="Write a description..."
				rows={5}
				maxLength={5000}
				disabled={isRestoring}
				className="flex p-2.5 items-center gap-2.5 rounded-lg bg-[#F1F1F1]"
			/>

			<div
				className={
					isGenreSelectorOpen
						? "rounded-[1.875rem] border flex flex-col gap-[0.62rem] w-full min-h-full border-t border-gray-200 px-3.75 py-2.5"
						: "flex justify-between items-center"
				}>
				{!isGenreSelectorOpen ? (
					<div className="flex justify-between w-full px-2.5">
						{selectedGenres.map((tag) => (
							<div key={tag} className="flex gap-2.5">
								<Tags text={tag} hashTag onClick={() => {}} />
								<button
									type="button"
									onClick={() => removeGenre(tag)}
									aria-label={`Remove ${tag} tag`}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="10"
										height="10"
										viewBox="0 0 10 10"
										fill="none">
										<path
											d="M0.30029 8.04125C0.107819 8.23373 -0.000310721 8.49477 -0.000310383 8.76697C-0.000310383 9.03916 0.107819 9.30021 0.30029 9.49268C0.492762 9.68516 0.75381 9.79328 1.02601 9.79328C1.2982 9.79328 1.55925 9.68516 1.75172 9.49268L4.89648 6.34792L8.04125 9.49268C8.23372 9.68516 8.49477 9.79328 8.76696 9.79328C9.03916 9.79328 9.30021 9.68516 9.49268 9.49268C9.68515 9.30021 9.79328 9.03916 9.79328 8.76697C9.79328 8.49477 9.68515 8.23373 9.49268 8.04125L6.34791 4.89649L9.49268 1.75173C9.68515 1.55925 9.79328 1.29821 9.79328 1.02601C9.79328 0.753815 9.68515 0.492767 9.49268 0.300296C9.30021 0.107824 9.03916 -0.00030525 8.76696 -0.000305219C8.49477 -0.000305535 8.23372 0.107824 8.04125 0.300296L4.89648 3.44506L1.75172 0.300296C1.55925 0.107824 1.2982 -0.000305535 1.02601 -0.000305219C0.753809 -0.00030525 0.492762 0.107824 0.30029 0.300296C0.107819 0.492767 -0.000310773 0.753815 -0.000310742 1.02601C-0.000310721 1.29821 0.107819 1.55925 0.30029 1.75173L3.44505 4.89649L0.30029 8.04125Z"
											fill="#BABABA"
										/>
									</svg>
								</button>
							</div>
						))}
						<button
							type="button"
							className="flex items-center gap-[0.2125rem]"
							onClick={() => setIsGenreSelectorOpen(true)}>
							<Image
								src="/icons/plus.svg"
								alt="Add genres"
								width={24}
								height={24}
							/>
							Add genres
						</button>
					</div>
				) : selectedGenres.length === 1 ? (
					<div className="flex justify-between">
						<div className="flex gap-2.5 flex-wrap">
							{selectedGenres.map((genre) => (
								<div key={genre} className="flex gap-2.5">
									<Tags text={genre} hashTag onClick={() => {}} />
									<button
										type="button"
										onClick={() => removeGenre(genre)}
										aria-label={`Remove ${genre} tag`}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="10"
											height="10"
											viewBox="0 0 10 10"
											fill="none">
											<path
												d="M0.30029 8.04125C0.107819 8.23373 -0.000310721 8.49477 -0.000310383 8.76697C-0.000310383 9.03916 0.107819 9.30021 0.30029 9.49268C0.492762 9.68516 0.75381 9.79328 1.02601 9.79328C1.2982 9.79328 1.55925 9.68516 1.75172 9.49268L4.89648 6.34792L8.04125 9.49268C8.23372 9.68516 8.49477 9.79328 8.76696 9.79328C9.03916 9.79328 9.30021 9.68516 9.49268 9.49268C9.68515 9.30021 9.79328 9.03916 9.79328 8.76697C9.79328 8.49477 9.68515 8.23373 9.49268 8.04125L6.34791 4.89649L9.49268 1.75173C9.68515 1.55925 9.79328 1.29821 9.79328 1.02601C9.79328 0.753815 9.68515 0.492767 9.49268 0.300296C9.30021 0.107824 9.03916 -0.00030525 8.76696 -0.000305219C8.49477 -0.000305535 8.23372 0.107824 8.04125 0.300296L4.89648 3.44506L1.75172 0.300296C1.55925 0.107824 1.2982 -0.000305535 1.02601 -0.000305219C0.753809 -0.00030525 0.492762 0.107824 0.30029 0.300296C0.107819 0.492767 -0.000310773 0.753815 -0.000310742 1.02601C-0.000310721 1.29821 0.107819 1.55925 0.30029 1.75173L3.44505 4.89649L0.30029 8.04125Z"
												fill="#BABABA"
											/>
										</svg>
									</button>
								</div>
							))}
						</div>
						<button type="button" onClick={() => setIsGenreSelectorOpen(false)}>
							Done
						</button>
					</div>
				) : (
					<div className="flex self-end justify-between ">
						<button type="button" onClick={() => setIsGenreSelectorOpen(false)}>
							Cancel
						</button>
					</div>
				)}
				{isGenreSelectorOpen && (
					<GenreSelector
						selectedGenres={selectedGenres}
						onGenresChange={updateSelectedGenres}
						isOpen={true}
						onClose={() => setIsGenreSelectorOpen(false)}
					/>
				)}
			</div>

			{/* Location */}
			<div className="flex flex-col gap-2">
				<div
					className={`${
						!isOpen && location
							? "flex h-15 p-2.5 items-center gap-2.5 flex-[1_0_0] rounded-lg"
							: "flex h-15 p-2.5 items-center gap-2.5 flex-[1_0_0] rounded-lg bg-[#F1F1F1]"
					}`}>
					<Combobox
						blank
						value={location}
						onAction={updateLocation}
						options={[
							{ label: "Aarhus, Denmark", value: "Aarhus, Denmark" },
							{ label: "Copenhagen, Denmark", value: "Copenhagen, Denmark" },
							{ label: "Odense, Denmark", value: "Odense, Denmark" },
							{ label: "Aalborg, Denmark", value: "Aalborg, Denmark" },
						]} // TODO: Add location autocomplete
						placeholder="Add location"
						isOpen={isOpen}
					/>
					{isOpen && location ? (
						<button type="button" onClick={() => setIsOpen(false)}>
							Done
						</button>
					) : location ? (
						<button type="button" onClick={() => setIsOpen(true)}>
							Edit
						</button>
					) : null}
				</div>
				<div className="flex items-start gap-2.5">
					<Toggle onToggle={() => console.log("Remote toggled")} />
					<p>Remote</p>
				</div>
			</div>

			{/* Paid Opportunity */}
			<div className="flex items-start gap-2.5">
				<Toggle
					isOn={paidOpportunity}
					onToggle={() => updatePaidOpportunity(!paidOpportunity)}
				/>
				<p>Paid Opportunity</p>
			</div>

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
