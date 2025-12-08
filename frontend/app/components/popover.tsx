import Image from "next/image";

type PopoverProps = {
  /** Popover variant */
  variant: "my-profile" | "message" | "profile-actions" | "other-profile";
  /** Optional additional class names for styling, used for placement */
  className?: string;
};
function Popover(props: PopoverProps) {
  return (
    <>
      {props.variant === "other-profile" ? (
        <ul
          className={`${props.className} w-fit text-[var(--color-white)] flex p-[0.75rem] flex-col justify-center gap-[0.625rem]  rounded-[1.5625rem] bg-[rgba(108,108,108,0.65)]`}
        >
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/share-ios.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Share profile</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/remove-user.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Disconnect</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/delete-circle.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Block user</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/chat-bubble-warning.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Report user</p>
          </li>
        </ul>
      ) : props.variant === "message" ? (
        <ul
          className={`${props.className} w-fit text-[var(--color-white)] flex p-[0.75rem] flex-col justify-center gap-[0.625rem] rounded-[1.5625rem] bg-[rgba(108,108,108,0.65)]`}
        >
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/camera.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Attach a picture</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/attachment.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Attach a file</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/pin-alt.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Share location</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/stats-up-square.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Survey</p>
          </li>
        </ul>
      ) : props.variant === "profile-actions" ? (
        <ul
          className={`${props.className} w-fit text-[var(--color-white)] flex p-[0.75rem] flex-col justify-center gap-[0.625rem] rounded-[1.5625rem] bg-[rgba(108,108,108,0.65)]`}
        >
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/user-circle.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Go to profile</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/delete-circle.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Block user</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/chat-bubble-warning.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Report user</p>
          </li>
        </ul>
      ) : props.variant === "my-profile" ? (
        <ul
          className={`${props.className} w-fit text-[var(--color-white)] flex p-[0.75rem] flex-col justify-center gap-[0.625rem]  rounded-[1.5625rem] bg-[rgba(108,108,108,0.65)]`}
        >
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/bookmark-empty.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Saved</p>
          </li>
          <div className="w-full h-[0.0625rem] bg-[var(--color-white)]"></div>
          <li className="flex gap-[0.5rem]">
            <Image
              src="/icons/hourglass.svg"
              alt="Edit Profile"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            <p>Archived</p>
          </li>
        </ul>
      ) : null}
    </>
  );
}

export { Popover };

// example usage:
// <Popover variant="my-profile" className="absolute top-12 right-7" />
