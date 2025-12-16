"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useUpload } from "@/app/modules/hooks/useUpload";
import { useUpdateProfile } from "../hooks/queries/useProfile";
import { Button } from "@/app/modules/components/buttons";
import type { UploadedMedia } from "@/app/modules/features/posts/types";

interface AvatarUploaderProps {
	currentAvatarUrl: string | null;
	username: string;
	onClose?: () => void;
	onSuccess?: (newAvatarUrl: string) => void;
}

export function AvatarUploader({
	currentAvatarUrl,
	username,
	onClose,
	onSuccess,
}: AvatarUploaderProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const {
		createPreviewMedia,
		uploadToSupabase,
		cleanupMedia,
		isUploading,
		isCompressing,
		compressionProgress,
	} = useUpload();

	const { mutate: updateProfile } = useUpdateProfile();
	const [previewMedia, setPreviewMedia] = useState<UploadedMedia | null>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadError(null);

		// Validate file size (max 5MB for avatar)
		if (file.size > 5 * 1024 * 1024) {
			setUploadError("File size must be less than 5MB");
			return;
		}

		// Validate file type (images only)
		if (!file.type.startsWith("image/")) {
			setUploadError("Only image files are allowed");
			return;
		}

		try {
			// Create preview with compression (using "avatar" upload type)
			const media = await createPreviewMedia(file, "avatar");
			setPreviewMedia(media);
		} catch (err) {
			setUploadError(
				err instanceof Error ? err.message : "Failed to process image"
			);
		}

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleUpload = async () => {
		if (!previewMedia) return;

		try {
			setUploadError(null);

			// Upload to Supabase using "avatar" upload type
			const uploadedMedia = await uploadToSupabase(previewMedia, "avatar");

			// Update profile with new avatar URL
			updateProfile(
				{
					username,
					data: {
						avatarUrl: uploadedMedia.url,
					},
				},
				{
					onSuccess: () => {
						// Clean up old preview
						if (previewMedia.url) {
							URL.revokeObjectURL(previewMedia.url);
						}
						setPreviewMedia(null);

						// Call success callback
						onSuccess?.(uploadedMedia.url);
						onClose?.();
					},
					onError: (error) => {
						setUploadError(
							error instanceof Error
								? error.message
								: "Failed to update profile picture"
						);
					},
				}
			);
		} catch (err) {
			setUploadError(
				err instanceof Error ? err.message : "Failed to upload image"
			);
		}
	};

	const handleCancel = () => {
		// Clean up preview
		if (previewMedia) {
			cleanupMedia([previewMedia], false);
			setPreviewMedia(null);
		}
		setUploadError(null);
		onClose?.();
	};

	return (
		<div className="flex flex-col justify-center items-center gap-6 p-6 bg-white rounded-3xl shadow-lg w-full min-w-75">
			<h3>Edit profile picture</h3>

			{/* Current/Preview Avatar */}
			<div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200">
				{previewMedia ? (
					<Image
						src={previewMedia.url}
						alt="Avatar preview"
						fill
						className="object-cover"
					/>
				) : (
					<Image
						src={currentAvatarUrl || "/avatars/boy1.webp"}
						alt="Current avatar"
						fill
						className="object-cover"
					/>
				)}
			</div>

			{/* Compression/Upload Progress */}
			{isCompressing && (
				<div className="w-full">
					<div className="flex justify-between text-sm text-gray-600 mb-1">
						<span>Compressing image...</span>
						<span>{Math.round(compressionProgress)}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-crocus-yellow h-2 rounded-full transition-all duration-300"
							style={{ width: `${compressionProgress}%` }}
						/>
					</div>
				</div>
			)}

			{isUploading && (
				<div className="w-full">
					<div className="flex justify-between text-sm text-gray-600 mb-1">
						<span>Uploading...</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div className="bg-crocus-yellow h-2 rounded-full animate-pulse w-full" />
					</div>
				</div>
			)}

			{/* Error Message */}
			{uploadError && (
				<div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
					{uploadError}
				</div>
			)}

			{/* File Input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
				disabled={isUploading || isCompressing}
			/>

			{/* Action Buttons */}
			<div className="flex gap-3 flex-col w-40">
				{previewMedia ? (
					<>
						<Button
							variant="secondary"
							onClick={handleCancel}
							disabled={isUploading}>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleUpload}
							disabled={isUploading || isCompressing}>
							{isUploading ? "Uploading..." : "Save"}
						</Button>
					</>
				) : (
					<>
						<Button variant="secondary" onClick={handleCancel}>
							Close
						</Button>
						<Button
							variant="primary"
							onClick={() => fileInputRef.current?.click()}
							disabled={isCompressing}>
							{isCompressing ? "Processing..." : "Choose Photo"}
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
