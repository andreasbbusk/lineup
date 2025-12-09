"use client";
import { use } from "react";
import { useAppStore } from "@/app/modules/stores/app-store";
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
  useMyConnections,
  useUserConnections,
} from "@/app/modules/features/profiles";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function Page({ params }: PublicProfilePageProps) {
  const { username } = use(params);
  const { user: currentUserProfile } = useAppStore();
  const router = useRouter();

  // Fetch the profile data for the username in the URL
  const { data: profileData, isLoading, error } = useProfile(username);

  // Check if viewing own profile or someone else's
  const isOwnProfile = currentUserProfile?.username === username;

  // Fetch collaborations using the user's ID from profileData
  const { data: collaborations = [] } = useCollaborations(profileData?.id);
  // Fetch reviews using the username
  const { data: reviews = [] } = useReviews(username);
  // Fetch social media links using username
  const { data: socialMediaData } = useSocialMedia(username);
  // Fetch looking for preferences using username
  const { data: lookingForData = [] } = useLookingFor(username);
  // Fetch FAQ answers using username
  const { data: faqs } = useFaq(username);

  // Fetch connection data
  const { data: myConnections } = useMyConnections({
    enabled: isOwnProfile,
  });
  const { data: userConnections } = useUserConnections({
    userId: profileData?.id || null,
    enabled: !isOwnProfile && !!profileData?.id,
  });
  const { data: connectionRequests } = useConnectionRequests();

  // Calculate connections count
  const acceptedConnectionsCount = isOwnProfile
    ? Array.isArray(myConnections)
      ? myConnections.filter((conn) => conn.status === "accepted").length
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
    return <LoadingSpinner size={40} />;
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

  const connect = () => {
    // Logic to send a connection request
    console.log("Connect clicked");
  };

  const message = () => {
    // Logic to send a message
    console.log("Message clicked");
  };

  return (
    <main className="flex flex-col items-center gap-3.75">
      {isOwnProfile ? (
        <>
          <ProfileHeader
            username={username}
            userId={profileData.id}
            imgSrc={userDetail.imgSrc}
            theme={userDetail.color}
            firstName={userDetail.firstName || "Undefined"}
            lastName={userDetail.lastName || "Undefined"}
            bio={userDetail.bio ?? undefined}
            isOwnProfile={isOwnProfile}
            connections={acceptedConnectionsCount}
            pendingConnectionsCount={pendingCount}
            onClickConnect={editProfile}
            onClickMessage={shareProfile}
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
          />
        </>
      ) : (
        <>
          <ProfileHeader
            username={username}
            userId={profileData.id}
            imgSrc={userDetail.imgSrc}
            theme={userDetail.color}
            firstName={userDetail.firstName || "Undefined"}
            lastName={userDetail.lastName || "Undefined"}
            isOwnProfile={isOwnProfile}
            connections={acceptedConnectionsCount}
            onClickConnect={connect}
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
          />
        </>
      )}
    </main>
  );
}
