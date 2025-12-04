"use client";

import { use } from "react";
import { useProfile } from "@/app/lib/features/profiles";
import { ProfileHeader } from "@/app/lib/features/profiles/components/profile-header";
import { LoadingSpinner } from "@/app/components/loading-spinner";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

function ProfilePageContent({ username }: { username: string }) {
  const { data: profile, isLoading, error } = useProfile(username);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  // Handle error state
  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-h3 font-semibold">User not found</p>
          <p className="text-body text-grey">
            The user &quot;{username}&quot; doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  // Validate profile has a valid ID
  if (!profile.id) {
    console.error("Profile missing ID:", profile);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-body text-grey">Profile data is invalid</p>
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

export default function Page({ params }: PublicProfilePageProps) {
  const { username } = use(params);

  return (
    <main className="space-y-4">
      <ProfilePageContent username={username} />
    </main>
  );
}
