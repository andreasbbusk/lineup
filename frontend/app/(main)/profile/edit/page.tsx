"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
	useMyProfile,
	useUpdateProfile,
	useLookingFor,
	useSocialMedia,
	useUpdateSocialMedia,
	useFaq,
	useAllFaqQuestions,
	useUpsertFaq,
	useDeleteFaq,
	useDeleteCollaboration,
} from "@/app/modules/features/profiles";
import { Button } from "@/app/modules/components/buttons";
import { ErrorMessage } from "@/app/modules/components/error-message";
import { useAppStore } from "@/app/modules/stores/Store";
import { Tags } from "@/app/modules/components/tags";

import { Divider } from "@/app/modules/features/profiles/components/edit/divider";
import { AddBlockModal } from "../../../modules/features/profiles/components/edit/add-block-modal";
import { QuestionsSection } from "@/app/modules/features/profiles/components/edit/questions-section";
import { MyMusicSection } from "@/app/modules/features/profiles/components/edit/my-music-section";
import { ArtistsSection } from "@/app/modules/features/profiles/components/edit/artists-section";
import { SocialMediaSection } from "@/app/modules/features/profiles/components/edit/social-media-section";
import { Avatar } from "@/app/modules/components/avatar";

// Edit Profile Schema - all fields are optional
const editProfileSchema = z.object({
	firstName: z
		.string()
		.min(1, "First name is required")
		.max(50, "First name is too long"),
	lastName: z
		.string()
		.min(1, "Last name is required")
		.max(50, "Last name is too long"),
	bio: z.string().max(100, "Bio is too long (max 100 characters)").optional(),
	aboutMe: z
		.string()
		.max(500, "About me is too long (max 500 characters)")
		.optional(),
	location: z
		.string()
		.min(1, "Location is required")
		.max(100, "Location is too long"),
	phoneCountryCode: z
		.number()
		.min(1, "Country code is required")
		.max(999, "Invalid country code"),
	phoneNumber: z
		.number()
		.min(1000, "Phone number must be at least 4 digits")
		.max(999999999999999, "Phone number must be at most 15 digits"),
	yearOfBirth: z
		.number()
		.min(1900, "Invalid year")
		.max(new Date().getFullYear() - 13, "You must be at least 13 years old"),
	userType: z.enum(["musician", "service_provider", "other"]),
	spotifyPlaylistUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	themeColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Invalid color")
		.optional(),
	lookingFor: z
		.array(z.enum(["connect", "promote", "find-band", "find-services"]))
		.optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

const LOOKING_FOR_OPTIONS = [
	{ value: "connect", label: "Connect" },
	{ value: "promote", label: "Promote" },
	{ value: "find-band", label: "Find Band" },
	{ value: "find-services", label: "Find Services" },
];

const THEME_COLORS = [
	{ value: "#1E1E1E", label: "Default" },
	{ value: "#575252", label: "Grey" },
	{ value: "#3F4D54", label: "Green" },
	{ value: "#3F4254", label: "Blue" },
	{ value: "#4D3F54", label: "Purple" },
	{ value: "#543F40", label: "Red" },
	{ value: "#5D4C43", label: "Orange" },
];

export default function EditProfilePage() {
	const router = useRouter();
	const username = useAppStore((state) => state.user?.username);
	const { data: profileData } = useMyProfile();
	const { data: lookingForData } = useLookingFor(username);
	const { data: socialMediaData } = useSocialMedia(username);
	const { data: faqData } = useFaq(username);
	const { data: allFaqQuestions } = useAllFaqQuestions();
	const { mutate: updateProfile } = useUpdateProfile();
	const { mutate: updateSocialMedia } = useUpdateSocialMedia();
	const { mutate: upsertFaq } = useUpsertFaq(username || "");
	const { mutate: deleteFaq } = useDeleteFaq(username || "");
	const { mutate: deleteCollaboration } = useDeleteCollaboration(
		profileData?.id
	);

	const [selectedLookingFor, setSelectedLookingFor] = useState<
		("connect" | "promote" | "find-band" | "find-services")[]
	>([]);
	const [showQuestionsSection, setShowQuestionsSection] = useState(true);
	const [showSocialMediaSection, setShowSocialMediaSection] = useState(true);
	const [showMyMusicSection, setShowMyMusicSection] = useState(true);
	const [showArtistsSection, setShowArtistsSection] = useState(true);
	const [showPastCollaborationsSection, setShowPastCollaborationsSection] =
		useState(true);
	const [showVideosSection, setShowVideosSection] = useState(true);
	const [showAddBlockModal, setShowAddBlockModal] = useState(false);
	const [isEditingTheme, setIsEditingTheme] = useState(false);
	const [isEditingLookingFor, setIsEditingLookingFor] = useState(false);

	const [isEditingVideos, setIsEditingVideos] = useState(false);
	const [isEditingArtist, setIsEditingArtist] = useState(false);
	const [removedCollaborations, setRemovedCollaborations] = useState<
		Set<string>
	>(new Set());
	const [pendingAction, setPendingAction] = useState<
		"save" | "addBlock" | null
	>(null);

	const [socialMediaLinks, setSocialMediaLinks] = useState<
		Record<string, string>
	>({
		instagram: "",
		twitter: "",
		facebook: "",
		youtube: "",
		tiktok: "",
	});
	const aboutMeRef = useRef<HTMLTextAreaElement | null>(null);
	const bioRef = useRef<HTMLTextAreaElement | null>(null);

	const {
		register,
		handleSubmit,
		control,
		setValue,
		reset,
		watch,
		formState: { errors },
	} = useForm<EditProfileFormData>({
		resolver: zodResolver(editProfileSchema),
		mode: "onChange",
	});
	const aboutMeValue = watch("aboutMe");
	const bioValue = watch("bio");
	const firstName = watch("firstName") || "";
	const lastName = watch("lastName") || "";
	const themeColorValue = watch("themeColor");
	const spotifyPlaylistUrlValue = watch("spotifyPlaylistUrl") || "";

	// Derive full name from firstName and lastName
	const fullNameValue = useMemo(() => {
		return [firstName, lastName].filter(Boolean).join(" ");
	}, [firstName, lastName]);

	// Initialize all form data when profile data loads
	useEffect(() => {
		if (profileData) {
			reset({
				firstName: profileData.firstName || "",
				lastName: profileData.lastName || "",
				bio: profileData.bio || "",
				aboutMe: profileData.aboutMe || "",
				location: profileData.location || "",
				phoneCountryCode: profileData.phoneCountryCode || 45,
				phoneNumber: profileData.phoneNumber || undefined,
				yearOfBirth: profileData.yearOfBirth || undefined,
				userType:
					(profileData.userType as "musician" | "service_provider" | "other") ||
					"musician",
				spotifyPlaylistUrl: profileData.spotifyPlaylistUrl || "",
				themeColor: profileData.themeColor || "#1E1E1E",
			});
		}

		if (lookingForData && Array.isArray(lookingForData)) {
			const values = lookingForData
				.map((item) => item.lookingForValue)
				.filter(
					(
						value
					): value is "connect" | "promote" | "find-band" | "find-services" =>
						["connect", "promote", "find-band", "find-services"].includes(value)
				);
			setSelectedLookingFor(values);
		}

		if (socialMediaData) {
			setSocialMediaLinks({
				instagram: socialMediaData.instagram || "",
				twitter: socialMediaData.twitter || "",
				facebook: socialMediaData.facebook || "",
				youtube: socialMediaData.youtube || "",
				tiktok: socialMediaData.tiktok || "",
			});
		}
	}, [profileData, lookingForData, socialMediaData, reset]);

	// Auto-resize textarea based on content
	useEffect(() => {
		if (aboutMeRef.current) {
			aboutMeRef.current.style.height = "auto";
			aboutMeRef.current.style.height = aboutMeRef.current.scrollHeight + "px";
		}
	}, [aboutMeValue]);

	useEffect(() => {
		if (bioRef.current) {
			bioRef.current.style.height = "auto";
			bioRef.current.style.height = bioRef.current.scrollHeight + "px";
		}
	}, [bioValue]);

	const onSubmit = useCallback(
		async (formData: EditProfileFormData) => {
			if (!username) return;

			setPendingAction("save");

			try {
				// Execute both mutations in parallel
				await Promise.all([
					new Promise((resolve, reject) => {
						updateProfile(
							{
								username,
								data: {
									firstName: formData.firstName,
									lastName: formData.lastName,
									bio: formData.bio || undefined,
									aboutMe: formData.aboutMe || undefined,
									location: formData.location,
									phoneCountryCode: formData.phoneCountryCode,
									phoneNumber: formData.phoneNumber,
									yearOfBirth: formData.yearOfBirth,
									userType: formData.userType,
									spotifyPlaylistUrl: formData.spotifyPlaylistUrl || undefined,
									themeColor: formData.themeColor || undefined,
									lookingFor: selectedLookingFor,
								},
							},
							{ onSuccess: resolve, onError: reject }
						);
					}),
					new Promise((resolve, reject) => {
						updateSocialMedia(
							{ username, data: socialMediaLinks },
							{ onSuccess: resolve, onError: reject }
						);
					}),
				]);

				// Navigate after successful save
				setTimeout(() => {
					setPendingAction(null);
					router.push(`/profile/${username}`);
				}, 100);
			} catch (error) {
				setPendingAction(null);
			}
		},
		[
			username,
			selectedLookingFor,
			socialMediaLinks,
			updateProfile,
			updateSocialMedia,
			router,
		]
	);

	const handleNameChange = useCallback(
		(value: string) => {
			const nameParts = value.trim().split(/\s+/);

			if (nameParts.length >= 2) {
				setValue("firstName", nameParts[0], { shouldValidate: true });
				setValue("lastName", nameParts.slice(1).join(" "), {
					shouldValidate: true,
				});
			} else {
				setValue("firstName", value.trim(), { shouldValidate: true });
				setValue("lastName", "", { shouldValidate: true });
			}
		},
		[setValue]
	);

	const toggleLookingFor = useCallback(
		(value: "connect" | "promote" | "find-band" | "find-services") => {
			setSelectedLookingFor((prev) =>
				prev.includes(value)
					? prev.filter((v) => v !== value)
					: [...prev, value]
			);
		},
		[]
	);

	return (
		<main className="flex flex-col gap-5.5 px-3.75 pb-35 tracking-[0.03125rem] text-grey">
			{/* Edit profile form */}
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col items-center gap-5.5">
				{/* Profile Picture */}
				<div className="flex flex-col items-center gap-4">
					<Avatar
						size="xxl"
						fallback={
							(profileData?.firstName?.charAt(0)?.toUpperCase() || "") +
							(profileData?.lastName?.charAt(0)?.toUpperCase() || "")
						}
						src={profileData?.avatarUrl}
						alt={`${profileData?.username}'s avatar`}></Avatar>
					<p onClick={() => {}} className="text-grey font-semibold">
						Edit picture
					</p>
				</div>

				<div className="text-grey flex flex-col gap-2.5 rounded-[1.5625rem] border border-melting-glacier bg-white py-9 px-3.75">
					{/* Full Name */}
					<div className="flex flex-col items-center gap-2.5 self-stretch">
						<div className="flex items-center self-stretch">
							<h4 className="flex w-full max-w-24 items-center font-semibold">
								Name
							</h4>
							<input
								type="text"
								value={fullNameValue}
								placeholder="Enter your full name"
								className={`w-full`}
								onChange={(e) => handleNameChange(e.target.value)}
							/>
						</div>
						{(errors.firstName || errors.lastName) && (
							<ErrorMessage
								message={
									errors.firstName?.message || errors.lastName?.message || ""
								}
							/>
						)}
						<Divider />
					</div>

					{/* Bio */}
					<div className="flex flex-col items-center gap-2.5 self-stretch">
						<div className="flex items-center self-stretch">
							<h4 className="flex w-full max-w-24 items-center font-semibold">
								Bio
							</h4>
							<textarea
								{...register("bio")}
								ref={(e) => {
									register("bio").ref(e);
									bioRef.current = e;
									if (e) {
										e.style.height = "auto";
										e.style.height = e.scrollHeight + "px";
									}
								}}
								placeholder="A short bio about yourself"
								className={`w-full`}
								rows={1}
							/>
						</div>
						{errors.bio && <ErrorMessage message={errors.bio.message || ""} />}
						<Divider />
					</div>

					{/* About Me */}
					<div className="flex flex-col items-center gap-2.5 self-stretch">
						<div className="flex items-center self-stretch">
							<h4 className="flex w-full max-w-24 items-center font-semibold">
								About Me
							</h4>
							<textarea
								{...register("aboutMe")}
								ref={(e) => {
									register("aboutMe").ref(e);
									aboutMeRef.current = e;
									if (e) {
										e.style.height = "auto";
										e.style.height = e.scrollHeight + "px";
									}
								}}
								placeholder={
									"Tell us more about yourself, your music, your experience..."
								}
								className={`w-full`}
								rows={1}
							/>
						</div>
						{errors.aboutMe && (
							<ErrorMessage message={errors.aboutMe.message || ""} />
						)}
						<Divider />
					</div>

					{/* Looking For */}
					<div className="flex flex-col items-center gap-2.5 self-stretch">
						<div className="flex items-center self-stretch">
							<h4 className="flex w-full max-w-24 items-center font-semibold">
								What I am looking for
							</h4>
							<div className="flex w-full flex-wrap items-center gap-2">
								{LOOKING_FOR_OPTIONS.filter((option) =>
									isEditingLookingFor
										? true
										: selectedLookingFor.includes(
												option.value as
													| "connect"
													| "promote"
													| "find-band"
													| "find-services"
										  )
								).map((option) => (
									<Tags
										key={option.value}
										text={option.label}
										onClick={
											isEditingLookingFor
												? () =>
														toggleLookingFor(
															option.value as
																| "connect"
																| "promote"
																| "find-band"
																| "find-services"
														)
												: undefined
										}
										color={
											selectedLookingFor.includes(
												option.value as
													| "connect"
													| "promote"
													| "find-band"
													| "find-services"
											)
												? themeColorValue || "#1E1E1E"
												: undefined
										}></Tags>
								))}
								<p
									onClick={() => setIsEditingLookingFor(!isEditingLookingFor)}
									className="cursor-pointer">
									{isEditingLookingFor ? "Done" : "Edit"}
								</p>
							</div>
						</div>
						<Divider />
					</div>

					{/* Genres - NOT YET FINISHED - Still dummy data */}
					<div className="flex flex-col items-center gap-2.5 self-stretch">
						<div className="flex items-center self-stretch">
							<h4 className="flex w-full max-w-24 items-center self-stretch font-helvetica text-body font-semibold tracking-[0.03125rem] text--grey">
								Genres
							</h4>
							<div className="flex w-full flex-wrap content-center items-center gap-2">
								{["Death Metal", "Rock", "Jazz", "Rap"].map((genre) => (
									<Tags
										key={genre}
										text={genre}
										color={themeColorValue || "#1E1E1E"}></Tags>
								))}
								<p className="font-helvetica text-body font-normal leading-[100%] tracking-[0.03125rem] text-center text--grey">
									Edit
								</p>
							</div>
						</div>
						<Divider />
					</div>

					{/* Theme Color */}
					<div className="flex flex-col items-center gap-2.5 self-stretch">
						<div className="flex items-center self-stretch">
							<h4 className="flex w-full max-w-24 items-center font-semibold">
								Theme
							</h4>
							<Controller
								name="themeColor"
								control={control}
								render={({ field }) => (
									<div className="flex w-full gap-2 items-center flex-wrap">
										{isEditingTheme ? (
											<>
												{THEME_COLORS.map((color) => (
													<button
														key={color.value}
														type="button"
														onClick={() => {
															field.onChange(color.value);
														}}
														className={`h-10 w-10 rounded-full`}
														style={{ backgroundColor: color.value }}
														title={color.label}
													/>
												))}
											</>
										) : (
											<button
												type="button"
												className="h-10 w-10 rounded-full"
												style={{ backgroundColor: field.value || "#1E1E1E" }}
												title={
													THEME_COLORS.find((c) => c.value === field.value)
														?.label
												}
											/>
										)}
										<p
											onClick={() => setIsEditingTheme(!isEditingTheme)}
											className="cursor-pointer">
											{isEditingTheme ? "Done" : "Edit"}
										</p>
									</div>
								)}
							/>
							{errors.themeColor && (
								<ErrorMessage message={errors.themeColor.message || ""} />
							)}
						</div>
					</div>
				</div>

				{/* Social Media Section */}
				<SocialMediaSection
					showSocialMediaSection={showSocialMediaSection}
					setShowSocialMediaSection={setShowSocialMediaSection}
					socialMediaLinks={socialMediaLinks}
					setSocialMediaLinks={setSocialMediaLinks}
				/>

				{/* Artists i like - NOT YET FINISHED - CURRENTLY COLLABORATIONS DATA */}
				<ArtistsSection
					showArtistsSection={showArtistsSection}
					setShowArtistsSection={setShowArtistsSection}
					deleteCollaboration={deleteCollaboration}
					themeColorValue={themeColorValue || "#1E1E1E"}
					isEditingArtist={isEditingArtist}
					setIsEditingArtist={setIsEditingArtist}
					removedCollaborations={removedCollaborations}
					setRemovedCollaborations={setRemovedCollaborations}
				/>

				{/* My Music Section - MISSING CORRECT IMPLEMENTATION OF THE SPOTIFY LINKED TEXT */}
				<MyMusicSection
					showMyMusicSection={showMyMusicSection}
					setShowMyMusicSection={setShowMyMusicSection}
					spotifyPlaylistUrlValue={spotifyPlaylistUrlValue}
					registerSpotifyUrl={register("spotifyPlaylistUrl")}
					spotifyUrlError={errors.spotifyPlaylistUrl}
				/>

				{/* Videos - NOT YET IMPLEMENTED - styled to look like figma */}
				{showVideosSection && (
					<div className="relative self-stretch rounded-[1.5625rem] border border-black/10 py-9 px-3.75">
						<Image
							src={"/icons/close.svg"}
							width={24}
							height={24}
							alt="Close"
							className="absolute top-2 right-2 cursor-pointer"
							onClick={() => setShowMyMusicSection(false)}
						/>
						<div className="flex items-center self-stretch">
							<h4 className="w-full max-w-24 font-semibold">Videos</h4>
							{isEditingVideos ? (
								<div className="flex gap-2 flex-wrap">
									<Tags text="Video 1" color={themeColorValue} />
									<Tags text="Video 2" color={themeColorValue} />
								</div>
							) : (
								<div className="flex gap-2 flex-wrap">
									<Tags text="Video 1" color={themeColorValue} />
									<Tags text="Video 2" color={themeColorValue} />
								</div>
							)}
						</div>
						<p
							onClick={() => setIsEditingVideos(!isEditingVideos)}
							className="absolute bottom-3 right-3.5 cursor-pointer">
							{isEditingVideos ? "Done" : "Edit"}
						</p>
					</div>
				)}

				{/* Past collaborations - UNCLEAR HOW THIS WOULD WORK - styled to look like figma */}
				{showPastCollaborationsSection && (
					<div className="relative self-stretch rounded-[1.5625rem] border border-black/10 py-9 px-3.75">
						<Image
							src={"/icons/close.svg"}
							width={24}
							height={24}
							alt="Close"
							className="absolute top-2 right-2 cursor-pointer"
							onClick={() => setShowPastCollaborationsSection(false)}
						/>
						<h4 className="w-full font-semibold">Past collaborations</h4>
					</div>
				)}

				{/* Questions Section */}
				<QuestionsSection
					showQuestionsSection={showQuestionsSection}
					setShowQuestionsSection={setShowQuestionsSection}
					allFaqQuestions={allFaqQuestions}
					faqData={faqData}
					username={username}
					upsertFaq={upsertFaq}
					deleteFaq={deleteFaq}
				/>
			</form>
			<Button
				icon="add-circle"
				type="button"
				variant="primary"
				disabled={pendingAction === "addBlock"}
				onClick={() => setShowAddBlockModal(true)}
				className="self-center">
				{pendingAction === "addBlock" ? "Saving..." : "Add block"}
			</Button>
			{/* Action Buttons */}
			<div className="flex justify-center gap-4 pt-4">
				<Button type="button" variant="secondary" onClick={() => router.back()}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="primary"
					disabled={pendingAction === "save"}
					onClick={handleSubmit(onSubmit)}>
					{pendingAction === "save" ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			{/* Modal for adding blocks */}
			<AddBlockModal
				showAddBlockModal={showAddBlockModal}
				setShowAddBlockModal={setShowAddBlockModal}
				showQuestionsSection={showQuestionsSection}
				setShowQuestionsSection={setShowQuestionsSection}
				showSocialMediaSection={showSocialMediaSection}
				setShowSocialMediaSection={setShowSocialMediaSection}
				showMyMusicSection={showMyMusicSection}
				setShowMyMusicSection={setShowMyMusicSection}
				showArtistsSection={showArtistsSection}
				setShowArtistsSection={setShowArtistsSection}
				showPastCollaborationsSection={showPastCollaborationsSection}
				setShowPastCollaborationsSection={setShowPastCollaborationsSection}
				showVideosSection={showVideosSection}
				setShowVideosSection={setShowVideosSection}
			/>
		</main>
	);
}
