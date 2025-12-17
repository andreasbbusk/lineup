// Hooks - queries
export {
  useProfile,
  useMyProfile,
  useUpdateProfile,
  useProfiles,
} from "./hooks/queries/useProfile";
export { useCollaborations } from "./hooks/queries/useCollaborations";
export {
  useFavoriteArtists,
  type Artist,
} from "./hooks/queries/useFavoriteArtists";
export { useReviews } from "./hooks/queries/useReviews";
export { useSocialMedia } from "./hooks/queries/useSocialMedia";
export { useUpdateSocialMedia } from "./hooks/queries/useUpdateSocialMedia";
export { useLookingFor } from "./hooks/queries/useLookingFor";
export { useFaq } from "./hooks/queries/useFaq";
export { useAllFaqQuestions } from "./hooks/queries/useAllFaqQuestions";

// Hooks - mutations
export { useUpsertFaq, useDeleteFaq } from "./hooks/mutations/useFaqMutations";
export { useDeleteCollaboration, useCreateCollaboration } from "./hooks/mutations/useCollaborationMutations";

// Hooks - onboarding
export { useOnboardingNavigation } from "./hooks/onboarding/useOnboardingNavigation";
export { useOnboardingSubmission } from "./hooks/onboarding/useOnboardingSubmission";

// Hooks - connections
export { useConnectionButton } from "./hooks/useConnectionButton";

export {
  useSendConnection,
  useAcceptConnection,
  useRejectConnection,
  useCancelConnection,
  useRemoveConnection,
} from "@/app/modules/hooks/mutations";

export {
  useConnectionRequests,
  useUserConnections,
} from "@/app/modules/hooks/queries";

export { ConnectionsModal } from "./components/connections/ConnectionsModal";
export { AvatarUploader } from "./components/avatar-uploader";

// Onboarding Components
export { OnboardingSignupStep } from "./components/onboarding/signup";
export { OnboardingUserTypeStep } from "./components/onboarding/user-type";
export { OnboardingProfileInfoStep } from "./components/onboarding/profile-info";
export { OnboardingLookingForStep } from "./components/onboarding/looking-for";
export { OnboardingProgress } from "./components/onboarding/progress-bar";
export { OnboardingConceptSlider } from "./components/onboarding/concept-slider";
export { OnboardingSplash } from "./components/onboarding/splash-screen";

// Connection Components
export { ConnectionButton } from "./components/connections/ConnectionButton";

// API
export * from "./api";

// Schemas
export * from "./schemas";

// Types
export * from "./types";
