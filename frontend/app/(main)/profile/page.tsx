"use client";

import { useMyProfile } from "@/app/lib/features/profiles";
import { ProfileHeader } from "@/app/lib/features/profiles/components/profile-header";
import { LoadingSpinner } from "@/app/components/loading-spinner";

function MyProfileContent() {
  const { data: profile, isLoading, error } = useMyProfile();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error("Profile error:", error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-h3 font-semibold">Profile not found</p>
          <p className="text-body text-grey">
            Your profile could not be loaded.
          </p>
          <p className="text-sm text-grey mt-2">
            Error: {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    );
  }

  // Handle no profile data (but no error)
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-h3 font-semibold">Profile not found</p>
          <p className="text-body text-grey">
            Your profile could not be loaded. Please ensure you are logged in
            and have completed onboarding.
          </p>
        </div>
      </div>
    );
  }

  // Map theme color to ProfileHeader color prop
  const themeColorMap: Record<
    string,
    "default" | "grey" | "green" | "blue" | "purple" | "red" | "orange"
  > = {
    default: "default",
    grey: "grey",
    green: "green",
    blue: "blue",
    purple: "purple",
    red: "red",
    orange: "orange",
  };

  const color = profile.themeColor
    ? themeColorMap[profile.themeColor] || "default"
    : "default";

  return (
    <div className="space-y-6">
      <ProfileHeader
        username={profile.username}
        userId={profile.id}
        imgSrc={profile.avatarUrl || "/avatars/default-avatar.png"}
        bio={profile.bio || undefined}
        color={color}
        firstName={profile.firstName}
        lastName={profile.lastName}
        connections={0} // TODO: Get actual connection count
        notes={0} // TODO: Get actual notes count
      />
      <div className="space-y-4">
        <h2 className="text-h2 font-semibold">About</h2>
        <p className="text-body text-grey">
          {profile.aboutMe || "No description yet."}
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="space-y-4">
      <MyProfileContent />
    </main>
  );
}
