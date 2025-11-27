"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppStore } from "../../stores/app-store";
import { ProfileUpdateRequest } from "../../types/api-types";
import { supabase } from "../../supabase/client";

export function useUpdateProfileMutation() {
  const updateProfileStore = useAppStore((state) => state.updateProfile);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      username,
      data,
    }: {
      username: string;
      data: ProfileUpdateRequest;
    }) => {
      const { user } = useAppStore.getState();
      if (!user) throw new Error("No user found");

      // Map frontend fields to database columns (excluding looking_for)
      const updates = {
        id: user.id,
        username: username,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_country_code: data.phoneCountryCode,
        phone_number: data.phoneNumber,
        year_of_birth: data.yearOfBirth,
        location: data.location,
        onboarding_completed: data.onboardingCompleted,
        user_type: data.userType,
        updated_at: new Date().toISOString(),
      };

      // Upsert profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .upsert(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Handle looking_for separately if provided
      if (data.lookingFor && data.lookingFor.length > 0) {
        // Delete existing looking_for entries
        const { error: deleteError } = await supabase
          .from("user_looking_for")
          .delete()
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        // Insert new looking_for entries
        const lookingForEntries = data.lookingFor.map((value) => ({
          user_id: user.id,
          looking_for_value: value,
        }));

        const { error: insertError } = await supabase
          .from("user_looking_for")
          .insert(lookingForEntries);

        if (insertError) throw insertError;
      }

      return profile;
    },
    onSuccess: async (profile) => {
      const { user } = useAppStore.getState();

      // Fetch looking_for data from user_looking_for table
      const { data: lookingForData } = await supabase
        .from("user_looking_for")
        .select("looking_for_value")
        .eq("user_id", user!.id);

      const lookingFor =
        lookingForData?.map((item) => item.looking_for_value) || [];

      // Remove snake_case fields and use only camelCase
      const cleanProfile = {
        id: profile.id,
        username: profile.username,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phoneCountryCode: profile.phone_country_code,
        phoneNumber: profile.phone_number,
        yearOfBirth: profile.year_of_birth,
        location: profile.location,
        onboardingCompleted: profile.onboarding_completed,
        userType: profile.user_type,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        aboutMe: profile.about_me,
        spotifyPlaylistUrl: profile.spotify_playlist_url,
        themeColor: profile.theme_color,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        lookingFor,
      };

      updateProfileStore(cleanProfile);
      resetOnboarding(); // Clear onboarding data from localStorage
      router.push("/");
    },
  });
}
