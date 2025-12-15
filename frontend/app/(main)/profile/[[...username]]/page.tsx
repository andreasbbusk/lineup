"use client";
import { use } from "react";
import { useAppStore } from "@/app/modules/stores/Store";
import { ProfileHeader } from "@/app/modules/features/profiles/components/profile-header";
import { ProfileBody } from "@/app/modules/features/profiles/components/profile-body";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import {
	useProfile,
	useCollaborations,
	useReviews,
	useSocialMedia,
	useLookingFor,
	useFaq,
	useConnectionRequests,
	useUserConnections,
} from "@/app/modules/features/profiles";
import { usePostsByAuthor } from "@/app/modules/hooks/queries";

interface ProfilePageProps {
	params: Promise<{
		username?: string[];
	}>;
}

export default function Page({ params }: ProfilePageProps) {
	const unwrappedParams = use(params);
	const currentUserProfile = useAppStore((state) => state.user);
	const router = useRouter();

	// Extract username from params array, or use current user's username
	// /profile -> username is undefined/empty, use current user
	// /profile/someuser -> username is ['someuser']
	const targetUsername =
		unwrappedParams.username?.[0] || currentUserProfile?.username || "";

	// Fetch the profile data for the target username
	const {
		data: profileData,
		isLoading,
		error,
		isSuccess,
	} = useProfile(targetUsername);

	// Check if viewing own profile or someone else's
	const isOwnProfile = currentUserProfile?.username === targetUsername;

	// Only fetch additional data if profile loaded successfully AND matches target username
	// This prevents race conditions when navigating between profiles
	const profileExists =
		isSuccess && !!profileData && profileData.username === targetUsername;

	// Fetch collaborations using the user's ID from profileData
	const { data: collaborations = [] } = useCollaborations(
		profileExists ? profileData.id : undefined
	);
	// Fetch reviews using the username
	const { data: reviews = [] } = useReviews(
		profileExists ? targetUsername : undefined
	);
	// Fetch social media links using username
	const { data: socialMediaData } = useSocialMedia(
		profileExists ? targetUsername : undefined
	);
	// Fetch looking for preferences using username
	const { data: lookingForData = [] } = useLookingFor(
		profileExists ? targetUsername : undefined
	);
	// Fetch FAQ answers using username
	const { data: faqs } = useFaq(profileExists ? targetUsername : undefined);

	// Fetch posts to get count for header (fetch more for accurate count)
	const { data: postsData } = usePostsByAuthor(
		profileExists && profileData?.id ? profileData.id : "",
		{
			limit: 100, // Fetch more to get a better count
			includeEngagement: false,
			includeMedia: false,
		}
	);

	// Calculate posts count (shows up to 100, which is reasonable for display)
	const postsCount = postsData?.data?.length ?? 0;

  // Fetch connection data
  // For own profile: use connectionRequests (includes both sent and received)
  // For other profiles: use userConnections (only accepted connections)
  const { data: connectionRequests } = useConnectionRequests();
  const { data: userConnections } = useUserConnections({
    userId: profileData?.id || null,
    enabled: !isOwnProfile && !!profileData?.id,
  });

  // Calculate accepted connections count from single data source
  const acceptedConnectionsCount = isOwnProfile
    ? Array.isArray(connectionRequests)
      ? connectionRequests.filter((conn) => conn.status === "accepted").length
      : 0
    : userConnections?.length ?? 0;

	// Calculate pending connections count for own profile
	const pendingCount =
		isOwnProfile && Array.isArray(connectionRequests)
			? connectionRequests.filter(
					(conn) =>
						conn.status === "pending" &&
						conn.recipientId === currentUserProfile?.id
			  ).length
			: 0;

	const favoriteArtists = [
		{
			link: "/profile/medina",
			imgSrc:
				"https://i.scdn.co/image/ab6761610000e5eb211afd577e27b6cbfb1e5064",
		},
		{
			link: "/profile/burhang",
			imgSrc:
				"https://cdn-p.smehost.net/sites/ef38b16bfa9341f8994dd4d1bbaa542a/wp-content/uploads/2022/10/0075f4ac75766b99fb91e30007eb4949390a7b5e.jpeg",
		},
		{
			link: "/profile/kanyewest",
			imgSrc:
				"https://upload.wikimedia.org/wikipedia/commons/5/5c/Kanye_West_at_the_2009_Tribeca_Film_Festival_%28crop_2%29.jpg",
		},
	]; // Hardcoded artists data - matches edit page

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (error || !profileData) {
		return (
			<main className="flex flex-col items-center gap-3.75">
				<p>Profile not found</p>
			</main>
		);
	}

	// Transform collaborations data to match component expectations
	const user_collaborations = collaborations
		.filter((collab) => collab.collaborator)
		.map((collab) => ({
			link: `/profile/${collab.collaborator?.username}`,
			imgSrc: collab.collaborator?.avatarUrl || "/avatars/boy1.webp",
			name: collab.collaborator?.username,
		}));

	// Transform reviews data to match component expectations
	const user_reviews = reviews.map((review) => ({
		reviewer: review.reviewer?.username ?? "Unknown",
		rating: review.rating,
		comment: review.description || "",
	}));

	// Transform social media data to match component expectations
	const user_social_media = socialMediaData
		? Object.entries(socialMediaData)
				.filter(([key, value]) => key !== "userId" && value)
				.map(([platform, link]) => ({
					platform,
					link: link as string,
				}))
		: [];

	// Transform looking for data to readable format
	const user_looking_for = lookingForData.map((lf) => {
		// Map database values to display values
		const displayMap: Record<string, string> = {
			connect: "Connect",
			promote: "Promote",
			"find-band": "Find Band",
			"find-services": "Find Services",
		};
		return displayMap[lf.lookingForValue] || lf.lookingForValue;
	});

	// Transform FAQ data to match component expectations
	const user_faq = (faqs || []).map((faq) => ({
		question: faq.question,
		answer: faq.answer,
	}));

	const userDetail = {
		username: profileData.username,
		firstName: profileData.firstName,
		lastName: profileData.lastName,
		imgSrc: profileData.avatarUrl || "/avatars/boy1.webp",
		color: profileData.themeColor || "#1E1E1E",
		lookingFor: user_looking_for,
		aboutMe: profileData.aboutMe,
		bio: profileData.bio,
		genres: "Elektronisk, Ambient, Techno",
		socialMedia: user_social_media,
		favoriteArtists: favoriteArtists,
		myMusic: profileData.spotifyPlaylistUrl,
		videos: "/images/video-1.svg",
		pastCollaborations: user_collaborations,
		reviews: user_reviews,
		questions: user_faq,
	};

	const editProfile = () => {
		router.push("/profile/edit");
	};

	const shareProfile = () => {
		// Logic to share profile
		console.log("Share profile clicked");
	};

	const message = () => {
		// Logic to send a message
		console.log("Message clicked");
	};

	return (
		<div className="flex flex-col items-center gap-3.75 max-w-300 mx-auto md:flex-row md:items-start md:mt-4">
			{isOwnProfile ? (
				<>
					<ProfileHeader
						username={targetUsername}
						userId={profileData.id}
						imgSrc={userDetail.imgSrc}
						theme={userDetail.color}
						firstName={userDetail.firstName || "Undefined"}
						lastName={userDetail.lastName || "Undefined"}
						bio={userDetail.bio ?? undefined}
						isOwnProfile={isOwnProfile}
						connections={acceptedConnectionsCount}
						pendingConnectionsCount={pendingCount}
						posts={postsCount}
						onClickConnect={editProfile}
						onClickMessage={shareProfile}
						className="md:sticky md:top-20"
					/>
					<ProfileBody
						theme={userDetail.color}
						aboutMe={userDetail.aboutMe ?? undefined}
						genres={userDetail.genres.split(", ")}
						lookingFor={user_looking_for}
						socialMedia={user_social_media}
						favoriteArtists={userDetail.favoriteArtists}
						myMusic={userDetail.myMusic ?? undefined}
						videos={[userDetail.videos]}
						pastCollaborations={userDetail.pastCollaborations}
						reviews={userDetail.reviews}
						questions={userDetail.questions}
						userId={profileData.id}
						className="md:m-auto md:flex md:justify-end"
					/>
				</>
			) : (
				<>
					<ProfileHeader
						username={targetUsername}
						userId={profileData.id}
						imgSrc={userDetail.imgSrc}
						theme={userDetail.color}
						firstName={userDetail.firstName || "Undefined"}
						lastName={userDetail.lastName || "Undefined"}
						isOwnProfile={isOwnProfile}
						connections={acceptedConnectionsCount}
						posts={postsCount}
						onClickMessage={message}
					/>
					<ProfileBody
						theme={userDetail.color}
						aboutMe={userDetail.aboutMe ?? undefined}
						genres={userDetail.genres.split(", ")}
						lookingFor={user_looking_for}
						socialMedia={user_social_media}
						favoriteArtists={userDetail.favoriteArtists}
						myMusic={userDetail.myMusic ?? undefined}
						videos={[userDetail.videos]}
						pastCollaborations={userDetail.pastCollaborations}
						reviews={userDetail.reviews}
						questions={userDetail.questions}
						userId={profileData.id}
					/>
				</>
			)}
		</div>
	);
}
