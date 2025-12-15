import { useState } from "react";
import { Tabs, TabsContent } from "@/app/modules/components/tabs";
import { Tags } from "@/app/modules/components/tags";
import Image from "next/image";
import Link from "next/link";
import { usePostsByAuthor } from "@/app/modules/hooks/queries";
import { ProfilePostCard } from "@/app/modules/features/posts/components/profile-post-card";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";

// Helper components
const ProfileSection = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
	<section className="flex flex-col items-start gap-4 w-full max-w-93.25">
		<h4 className="font-normal text-[var(--color-grey)]">{title}</h4>
		{children}
	</section>
);

const EmptyState = ({ message }: { message: string }) => (
	<p className="flex py-0 px-4 items-center gap-2 max-w-sm">{message}</p>
);

const Star = ({ filled }: { filled: boolean }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="18"
		height="17"
		viewBox="0 0 18 17"
		fill="none">
		<path
			d="M8.56088 13.7L4.41088 16.2C4.22754 16.3167 4.03588 16.3667 3.83588 16.35C3.63588 16.3333 3.46088 16.2667 3.31088 16.15C3.16088 16.0333 3.04421 15.8877 2.96088 15.713C2.87754 15.5383 2.86088 15.3423 2.91088 15.125L4.01088 10.4L0.335876 7.225C0.169209 7.075 0.0652091 6.904 0.0238758 6.712C-0.0174575 6.52 -0.00512426 6.33267 0.0608757 6.15C0.126876 5.96733 0.226876 5.81733 0.360876 5.7C0.494876 5.58267 0.678209 5.50767 0.910876 5.475L5.76088 5.05L7.63588 0.6C7.71921 0.4 7.84854 0.25 8.02388 0.15C8.19921 0.0499999 8.37821 0 8.56088 0C8.74354 0 8.92254 0.0499999 9.09788 0.15C9.27321 0.25 9.40254 0.4 9.48588 0.6L11.3609 5.05L16.2109 5.475C16.4442 5.50833 16.6275 5.58333 16.7609 5.7C16.8942 5.81667 16.9942 5.96667 17.0609 6.15C17.1275 6.33333 17.1402 6.521 17.0989 6.713C17.0575 6.905 16.9532 7.07567 16.7859 7.225L13.1109 10.4L14.2109 15.125C14.2609 15.3417 14.2442 15.5377 14.1609 15.713C14.0775 15.8883 13.9609 16.034 13.8109 16.15C13.6609 16.266 13.4859 16.3327 13.2859 16.35C13.0859 16.3673 12.8942 16.3173 12.7109 16.2L8.56088 13.7Z"
			fill={filled ? "#FFB751" : "#DADADA"}
		/>
	</svg>
);

type ProfileBodyProps = {
	/** About me section */
	aboutMe?: string;
	/** What I am looking for section */
	lookingFor?: string[];
	/** Genres section */
	genres?: string[];
	/** Social media section */
	socialMedia?: {
		platform: string;
		link: string;
	}[];
	/** Artists I like section */
	favoriteArtists?: {
		link: string;
		imgSrc: string;
	}[];
	/** Past collaborations section */
	myMusic?: string;
	/** Videos section */
	videos?: string[];
	/** Past collaborations section */
	pastCollaborations?: {
		link: string;
		imgSrc: string;
		name?: string;
	}[];
	/** Reviews section */
	reviews?: {
		reviewer: string;
		rating: number;
		comment: string;
	}[];
	/** FAQ section */
	questions?: {
		question: string;
		answer: string;
	}[];
	/** Profile theme color */
	theme?: string;
	/** User ID for fetching posts */
	userId?: string;
};

function ProfileBody(props: ProfileBodyProps) {
	const [activeTab, setActiveTab] = useState<"about" | "notes">("about");
	const [showAllArtists, setShowAllArtists] = useState(false);
	const [showAllCollaborators, setShowAllCollaborators] = useState(false);

	// Fetch notes by this user
	const { data: postsData, isLoading: postsLoading } = usePostsByAuthor(
		props.userId || "",
		{
			type: "note",
			limit: 50,
			includeEngagement: true,
			includeMedia: true,
		}
	);

	const socialMediaIcons: Record<string, string> = {
		instagram: "/icons/social-media/instagram.svg",
		twitter: "/icons/social-media/x.svg",
		facebook: "/icons/social-media/facebook.svg",
		tiktok: "/icons/social-media/tiktok.svg",
		youtube: "/icons/social-media/youtube.svg",
	};

	return (
		<div className="max-w-93.25">
			<Tabs variant="profile" activeTab={activeTab} onTabChange={setActiveTab}>
				<TabsContent value="about">
					<ProfileSection title="About me">
						{props.aboutMe ? (
							<p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
								{props.aboutMe}
							</p>
						) : (
							<EmptyState message="No description yet." />
						)}
					</ProfileSection>

					<ProfileSection title="What I am looking for">
						{props.lookingFor && props.lookingFor.length > 0 ? (
							<ul className="flex flex-wrap py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
								{props.lookingFor.map((item, index) => (
									<li key={index}>
										<Tags color={props.theme} text={item} onClick={() => {}} />
									</li>
								))}
							</ul>
						) : (
							<EmptyState message="Not specified yet." />
						)}
					</ProfileSection>

					<ProfileSection title="Genres">
						{props.genres && props.genres.length > 0 ? (
							<ul className="flex flex-wrap py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
								{props.genres.map((genre, index) => (
									<li key={index}>
										<Tags color={props.theme} text={genre} onClick={() => {}} />
									</li>
								))}
							</ul>
						) : (
							<EmptyState message="No genres specified yet." />
						)}
					</ProfileSection>

					<ProfileSection title="Reviews">
						{props.reviews && props.reviews.length > 0 ? (
							<>
								<div className="flex pl-[0.9375rem] justify-center items-center gap-[0.625rem]">
									{Array.from({ length: 5 }).map((_, i) => {
										const avgRating = Math.round(
											props.reviews!.reduce((sum, r) => sum + r.rating, 0) /
												props.reviews!.length
										);
										return <Star key={i} filled={i < avgRating} />;
									})}
									<p className="text-[var(--color-grey)] text-[0.875rem] font-medium leading-[135%] tracking-[0.03125rem]">
										{props.reviews.length} reviews
									</p>
								</div>
								<div className="inline-flex gap-[0.3125rem] pl-[0.9375rem]">
									<p className="text-wrap">
										<q className="text-wrap">
											{props.reviews[props.reviews.length - 1].comment}
										</q>
										- {props.reviews[props.reviews.length - 1].reviewer}
									</p>
								</div>
							</>
						) : (
							<EmptyState message="No reviews yet." />
						)}
					</ProfileSection>

					<ProfileSection title="Social Media">
						{props.socialMedia && props.socialMedia.length > 0 ? (
							<ul className="grid grid-cols-5 items-center py-0 px-[0.9375rem] gap-[0.625rem] self-stretch">
								{Array.from({ length: 5 }).map((_, i) => {
									const social = props.socialMedia?.[i];
									return (
										<li key={i} className="flex items-center justify-center">
											{social ? (
												<Link
													href={social.link}
													target="_blank"
													rel="noopener noreferrer">
													<Image
														src={
															socialMediaIcons[social.platform.toLowerCase()]
														}
														alt={social.platform}
														width={40}
														height={40}
													/>
												</Link>
											) : (
												<div aria-hidden className="w-10 h-10" />
											)}
										</li>
									);
								})}
							</ul>
						) : (
							<EmptyState message="No social media added yet." />
						)}
					</ProfileSection>

					<ProfileSection title="Artists I like">
						{props.favoriteArtists && props.favoriteArtists.length > 0 ? (
							<div className="flex flex-col py-0 px-[var(--Spacing-S---spacing,_0.9375rem)] items-start gap-[1.0625rem] self-stretch">
								{showAllArtists ? (
									// Grid layout when showing all
									<ul className="grid grid-cols-3 gap-4 w-full">
										{props.favoriteArtists.map((artist, index) => (
											<li
												key={index}
												className="flex flex-col items-center gap-2">
												<Link
													href={artist.link}
													target="_blank"
													rel="noopener noreferrer"
													className="flex flex-col items-center gap-2">
													<Image
														src={artist.imgSrc || "/default-avatar.png"}
														alt="Artist"
														width={77}
														height={77}
														className="rounded-full border-3 border-white aspect-square object-cover drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
													/>
												</Link>
											</li>
										))}
									</ul>
								) : (
									// Overlapping layout when collapsed
									<div className="flex items-center gap-[1.0625rem]">
										<ul className="flex py-0 items-center">
											{props.favoriteArtists
												.slice(0, 3)
												.map((artist, index) => (
													<li key={index} className="first:ml-0 -ml-[25px]">
														<Link
															href={artist.link}
															target="_blank"
															rel="noopener noreferrer">
															<Image
																src={artist.imgSrc || "/default-avatar.png"}
																alt="Artist"
																width={77}
																height={77}
																className="rounded-full border-3 border-[var(--color-white)] aspect-square object-cover drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
															/>
														</Link>
													</li>
												))}
											{props.favoriteArtists.length > 3 && (
												<li className="-ml-[25px]">
													<div
														className="w-[77px] h-[77px] rounded-full border-3 border-[var(--color-white)] flex items-center justify-center drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
														style={{
															backgroundColor: `${props.theme}`,
														}}>
														<span className="text-[var(--color-white)] font-semibold">
															+{props.favoriteArtists.length - 3}
														</span>
													</div>
												</li>
											)}
										</ul>
										{props.favoriteArtists.length > 3 && (
											<p
												className="cursor-pointer tracking-[0.03125rem]"
												onClick={() => setShowAllArtists(true)}>
												See all
											</p>
										)}
									</div>
								)}
								{showAllArtists && props.favoriteArtists.length > 3 && (
									<p
										className="cursor-pointer tracking-[0.03125rem]"
										onClick={() => setShowAllArtists(false)}>
										Show less
									</p>
								)}
							</div>
						) : (
							<EmptyState message="No artists added yet." />
						)}
					</ProfileSection>

					<ProfileSection title="My music">
						{props.myMusic && props.myMusic.length > 0 ? (
							<Link
								href={props.myMusic}
								target="_blank"
								rel="noopener noreferrer"
								className="self-center w-[20.8125rem] h-[13.25rem] rounded-[1.5625rem] overflow-hidden">
								<Image
									src={"/images/spotify-embed.svg"}
									alt={`music-0`}
									height={212}
									width={333}
									className="object-cover w-full h-full"
								/>
							</Link>
						) : (
							<EmptyState message="No music added yet." />
						)}
					</ProfileSection>

					<ProfileSection title="Videos">
						{props.videos && props.videos.length > 0 ? (
							<ul className="flex flex-col justify-center items-start gap-[0.625rem] py-0 px-[0.9375rem] self-stretch">
								{props.videos.map((video, index) => (
									<li
										key={index}
										className="flex flex-col self-center justify-center items-start w-[20.8125rem] h-[13.25rem] rounded-[1.5625rem] overflow-hidden">
										<Image
											src={video}
											alt={`video-${index}`}
											height={212}
											width={333}
											className="object-cover w-full h-full"
										/>
									</li>
								))}
							</ul>
						) : (
							<EmptyState message="No videos added yet." />
						)}
					</ProfileSection>

					<ProfileSection title="Past Collaborations">
						{props.pastCollaborations && props.pastCollaborations.length > 0 ? (
							<div className="flex flex-col py-0 px-[var(--Spacing-S---spacing,_0.9375rem)] items-start gap-[1.0625rem] self-stretch">
								{showAllCollaborators ? (
									// Grid layout when showing all
									<>
										<ul className="grid grid-cols-4 gap-4 w-full">
											{props.pastCollaborations.map((collab, index) => (
												<li key={index} className="flex flex-col items-center ">
													<Link
														href={collab.link}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col items-center gap-2">
														<Image
															src={collab.imgSrc || "/default-avatar.png"}
															alt="Collaborator"
															width={77}
															height={77}
															className="rounded-full border-3 border-white aspect-square object-cover drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
														/>
													</Link>
													{collab.name && (
														<p className="text-center text-sm">{collab.name}</p>
													)}
												</li>
											))}
										</ul>
										{showAllCollaborators &&
											props.pastCollaborations.length > 3 && (
												<p
													className="cursor-pointer tracking-[0.03125rem]"
													onClick={() => setShowAllCollaborators(false)}>
													Show less
												</p>
											)}
									</>
								) : (
									// Overlapping layout when collapsed
									<div className="flex items-center gap-[1.0625rem]">
										<ul className="flex py-0 items-center">
											{props.pastCollaborations
												.slice(0, 3)
												.map((collab, index) => (
													<li key={index} className="first:ml-0 -ml-[25px]">
														<Link
															href={collab.link}
															target="_blank"
															rel="noopener noreferrer">
															<Image
																src={collab.imgSrc || "/default-avatar.png"}
																alt="Collaborator"
																width={77}
																height={77}
																className="rounded-full border-3 border-[var(--color-white)] aspect-square object-cover drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
															/>
														</Link>
													</li>
												))}
											{props.pastCollaborations.length > 3 && (
												<li className="-ml-[25px]">
													<div
														className="w-[77px] h-[77px] rounded-full border-3 border-[var(--color-white)] flex items-center justify-center drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
														style={{
															backgroundColor: `${props.theme}`,
														}}>
														<span className="text-[var(--color-white)] font-semibold">
															+{props.pastCollaborations.length - 3}
														</span>
													</div>
												</li>
											)}
										</ul>
										{props.pastCollaborations.length > 3 && (
											<p
												className="cursor-pointer tracking-[0.03125rem]"
												onClick={() => setShowAllCollaborators(true)}>
												See all
											</p>
										)}
									</div>
								)}
							</div>
						) : (
							<EmptyState message="No collaborations yet." />
						)}
					</ProfileSection>

					<ProfileSection title="Questions">
						{props.questions && props.questions.length > 0 ? (
							<ul className="flex flex-col items-start self-stretch py-0 px-[0.9375rem] gap-[0.625rem]">
								{props.questions.map((questionObj, index) => (
									<li key={index}>
										<h5 className="font-bold leading-normal tracking-[0.03125rem]">
											{questionObj.question}
										</h5>
										<p className="pl-[1.375rem]">{questionObj.answer}</p>
									</li>
								))}
							</ul>
						) : (
							<EmptyState message="No questions yet." />
						)}
					</ProfileSection>
				</TabsContent>
				<TabsContent value="notes">
					{postsLoading ? (
						<LoadingSpinner />
					) : postsData?.data && postsData.data.length > 0 ? (
						<div className="flex flex-col gap-4 w-full">
							{postsData.data.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
							{postsData.pagination.hasMore && (
								<div className="text-center py-4">
									<p className="text-sm text-gray-500">Loading posts...</p>
								</div>
							)}
						</div>
					) : (
						<div className="bg-white p-8 text-center w-full">
							<p className="text-gray-500">No posts yet.</p>
							<p className="mt-2 text-sm text-gray-400">
								This user has not created any posts yet.
							</p>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

export { ProfileBody };
