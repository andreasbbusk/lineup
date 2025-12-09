import { Button } from "@/app/modules/components/buttons";

interface AddBlockModalProps {
  showAddBlockModal: boolean;
  setShowAddBlockModal: (show: boolean) => void;
  showQuestionsSection: boolean;
  setShowQuestionsSection: (show: boolean) => void;
  showSocialMediaSection: boolean;
  setShowSocialMediaSection: (show: boolean) => void;
  showMyMusicSection: boolean;
  setShowMyMusicSection: (show: boolean) => void;
  showArtistsSection: boolean;
  setShowArtistsSection: (show: boolean) => void;
  showPastCollaborationsSection: boolean;
  setShowPastCollaborationsSection: (show: boolean) => void;
  showVideosSection: boolean;
  setShowVideosSection: (show: boolean) => void;
}

export function AddBlockModal({
  showAddBlockModal,
  setShowAddBlockModal,
  showQuestionsSection,
  setShowQuestionsSection,
  showSocialMediaSection,
  setShowSocialMediaSection,
  showMyMusicSection,
  setShowMyMusicSection,
  showArtistsSection,
  setShowArtistsSection,
  showPastCollaborationsSection,
  setShowPastCollaborationsSection,
  showVideosSection,
  setShowVideosSection,
}: AddBlockModalProps) {
  if (!showAddBlockModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[var(--color-white)] rounded-xl p-6 min-w-[300px] shadow-lg flex flex-col gap-4">
        <h3 className="font-semibold text-lg mb-2 text-center">
          Add a block to your profile
        </h3>
        {/* List available blocks to add */}
        <div className="flex flex-col gap-2">
          {!showQuestionsSection && (
            <button
              className="px-4 py-2 rounded bg-primary  hover:bg-primary/80 transition"
              onClick={() => {
                setShowQuestionsSection(true);
                setShowAddBlockModal(false);
              }}
            >
              Questions
            </button>
          )}
          {!showSocialMediaSection && (
            <button
              className="px-4 py-2 rounded bg-primary hover:bg-primary/80 transition"
              onClick={() => {
                setShowSocialMediaSection(true);
                setShowAddBlockModal(false);
              }}
            >
              Social Media
            </button>
          )}
          {!showMyMusicSection && (
            <button
              className="px-4 py-2 rounded bg-primary hover:bg-primary/80 transition"
              onClick={() => {
                setShowMyMusicSection(true);
                setShowAddBlockModal(false);
              }}
            >
              My Music
            </button>
          )}
          {!showArtistsSection && (
            <button
              className="px-4 py-2 rounded bg-primary hover:bg-primary/80 transition"
              onClick={() => {
                setShowArtistsSection(true);
                setShowAddBlockModal(false);
              }}
            >
              Artists I Like
            </button>
          )}
          {!showPastCollaborationsSection && (
            <button
              className="px-4 py-2 rounded bg-primary hover:bg-primary/80 transition"
              onClick={() => {
                setShowPastCollaborationsSection(true);
                setShowAddBlockModal(false);
              }}
            >
              Past Collaborations
            </button>
          )}
          {!showVideosSection && (
            <button
              className="px-4 py-2 rounded bg-primary hover:bg-primary/80 transition"
              onClick={() => {
                setShowVideosSection(true);
                setShowAddBlockModal(false);
              }}
            >
              Videos
            </button>
          )}
        </div>
        <Button
          className="self-center"
          variant="primary"
          onClick={() => setShowAddBlockModal(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
