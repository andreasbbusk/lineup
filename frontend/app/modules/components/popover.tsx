import Image from "next/image";
import { Fragment } from "react";

type PopoverProps = {
  /** Popover variant */
  variant:
    | "my-profile"
    | "message"
    | "profile-actions"
    | "other-profile"
    | "note"
    | "post-options";
  /** Optional additional class names for styling, used for styling */
  className?: string;
  /** Optional callback for bookmark action (only used for "note" variant) */
  onBookmarkClick?: () => void;
  /** Optional callback for edit action (only used for "post-options" variant) */
  onEditClick?: () => void;
  /** Optional callback for delete action (only used for "post-options" variant) */
  onDeleteClick?: () => void;
  /** Optional bookmark state (only used for "note" variant) */
  isBookmarked?: boolean;
};

type PopoverItem = {
  icon: string;
  label: string;
  alt?: string;
  onClick?: () => void;
};

/**
 * Get popover configuration for each variant
 * 
 * Note: The bookmark-related props (onBookmarkClick, isBookmarked) are only
 * used for the "note" variant. All other variants ignore these props and
 * continue to work as before, ensuring backward compatibility.
 */
const getPopoverConfigs = (
  props?: {
    isBookmarked?: boolean;
    onBookmarkClick?: () => void;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
  }
): Record<PopoverProps["variant"], PopoverItem[]> => ({
  "post-options": [
    {
      icon: "/icons/edit-pencil.svg",
      label: "Edit Post",
      onClick: props?.onEditClick,
    },
    {
      icon: "/icons/delete-circle.svg",
      label: "Delete Post",
      onClick: props?.onDeleteClick,
    },
  ],
  "other-profile": [
    { icon: "/icons/share-ios.svg", label: "Share profile" },
    { icon: "/icons/remove-user.svg", label: "Disconnect" },
    { icon: "/icons/delete-circle.svg", label: "Block user" },
    { icon: "/icons/chat-bubble-warning.svg", label: "Report user" },
  ],
  message: [
    { icon: "/icons/camera.svg", label: "Attach a picture" },
    { icon: "/icons/attachment.svg", label: "Attach a file" },
    { icon: "/icons/pin-alt.svg", label: "Share location" },
    { icon: "/icons/stats-up-square.svg", label: "Survey" },
  ],
  "profile-actions": [
    { icon: "/icons/user-circle.svg", label: "Go to profile" },
    { icon: "/icons/delete-circle.svg", label: "Block user" },
    { icon: "/icons/chat-bubble-warning.svg", label: "Report user" },
  ],
  "my-profile": [
    { icon: "/icons/bookmark-empty.svg", label: "Saved" },
    { icon: "/icons/hourglass.svg", label: "Archived" },
  ],
  note: [
    {
      icon: "/icons/bookmark-empty.svg",
      label: props?.isBookmarked ? "Unsave note" : "Save note",
      onClick: props?.onBookmarkClick,
    },
    { icon: "/icons/share-ios.svg", label: "Share note" },
    { icon: "/icons/eye-empty.svg", label: "Hide notes from this user" },
    { icon: "/icons/chat-bubble-warning.svg", label: "Report note" },
  ],
});

function Popover(props: PopoverProps) {
  const items = getPopoverConfigs({
    isBookmarked: props.isBookmarked,
    onBookmarkClick: props.onBookmarkClick,
    onEditClick: props.onEditClick,
    onDeleteClick: props.onDeleteClick,
  })[props.variant];

  return (
    <ul
      className={`${props.className} w-fit text-white flex p-3 flex-col justify-center gap-2 rounded-[1.5625rem] bg-[rgba(108,108,108)] shadow-lg`}
    >
      {items.map((item, index) => (
        <Fragment key={item.label}>
          <li
            className={`flex gap-2 ${item.onClick ? "cursor-pointer hover:opacity-80" : ""}`}
            onClick={item.onClick}
          >
            <Image
              src={item.icon}
              alt={item.alt || item.label}
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>{item.label}</p>
          </li>
          {index < items.length - 1 && (
            <div className="w-full h-px bg-white"></div>
          )}
        </Fragment>
      ))}
    </ul>
  );
}

export { Popover };
