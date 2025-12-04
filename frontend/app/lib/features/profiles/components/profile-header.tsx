import { useState } from "react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Button } from "@/app/components/buttons";
import { Popover } from "@/app/components/popover";
import { ConnectionButton } from "./connections/ConnectionButton";
import { ConnectionsModal } from "./connections/ConnectionsModal";

type ProfileHeaderProps = {
  /** Username of the profile */
  username: string;
  /** User ID of the profile (for connection functionality) */
  userId?: string | null;
  /** Image source URL */
  imgSrc: string;
  /** Short biography */
  bio?: string;
  /** Profile color theme:
   * "default" | "grey" | "green" | "blue" | "purple" | "red" | "orange"
   */
  color: "default" | "grey" | "green" | "blue" | "purple" | "red" | "orange";
  /** Is the profile verified */
  verified?: boolean;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Number of connections */
  connections?: number;
  /** Number of notes */
  notes?: number;
  /** Callback when Message button is clicked */
  onClickMessage?: () => void;
};
function ProfileHeader(props: ProfileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

  const colorClass = {
    default: "1E1E1E",
    grey: "575252",
    green: "3F4D54",
    blue: "3F4254",
    purple: "4D3F54",
    red: "543F40",
    orange: "5D4C43",
  }[props.color];

  return (
    <div
      className={
        "relative text-[var(--color-white)] flex w-[23.3125rem] py-[1.5625rem] flex-col justify-center items-center gap-[0.9375rem] rounded-[2.8125rem] bg-[var(--profile-theme)]"
      }
      style={{ "--profile-theme": `#${colorClass}` } as CSSProperties}
    >
      <span
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="absolute top-[2.25rem] right-[1.75rem] flex w-[1.3125rem] items-center gap-[0.25rem] cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="3"
          height="3"
          viewBox="0 0 3 3"
          fill="none"
        >
          <circle
            cx="1"
            cy="1"
            r="1"
            transform="matrix(-1 0 0 1 2.5 0.5)"
            fill="white"
            stroke="white"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="3"
          height="3"
          viewBox="0 0 3 3"
          fill="none"
        >
          <circle
            cx="1"
            cy="1"
            r="1"
            transform="matrix(-1 0 0 1 2.5 0.5)"
            fill="white"
            stroke="white"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="3"
          height="3"
          viewBox="0 0 3 3"
          fill="none"
        >
          <circle
            cx="1"
            cy="1"
            r="1"
            transform="matrix(-1 0 0 1 2.5 0.5)"
            fill="white"
            stroke="white"
          />
        </svg>
      </span>
      {isMenuOpen && (
        <Popover
          variant="my-profile"
          className="absolute top-[3rem] right-[1.75rem]"
        />
      )}
      <div className="flex justify-center items-center self-stretch">
        <button
          onClick={() => setIsConnectionsModalOpen(true)}
          className="flex flex-col items-center flex-[1_0_0] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p>{props.connections ?? 0}</p>
          <p>Connections</p>
        </button>
        <Image
          src={props.imgSrc}
          alt={`${props.username}'s avatar`}
          width={146}
          height={146}
          className="w-[9.11988rem] h-[9.11988rem] rounded-full border border-[var(--color-white)] object-cover "
        />
        <div className="flex flex-col items-center flex-[1_0_0]">
          <p>{props.notes ?? 0}</p>
          <p>Notes</p>
        </div>
      </div>
      <div>
        <div className="flex justify-center items-start gap-1.5 self-stretch">
          <h3 className=" text-center [font-family:var(--font-family-helvetica)] text-[1.125rem] not-italic font-normal leading-[1.1875rem] tracking-[0.03125rem]">
            {props.firstName} {props.lastName}
          </h3>
          {props.verified && (
            <Image
              src="/icons/twitter-verified-badge.svg"
              alt="Verified"
              width={18}
              height={18}
              className="invert brightness-0"
            />
          )}
        </div>
        <p className="text-[var(--color-melting-glacier)] text-center text-xs not-italic font-normal leading-none tracking-[0.03125rem] self-stretch [font-family:var(--font-family-helvetica)]">
          {props.bio}
        </p>
      </div>
      <div className="flex items-center gap-[var(--Spacing-XS---spacing,0.625rem)]">
        <ConnectionButton targetUserId={props.userId || null} />
        <Button
          variant="primary"
          glass
          onClick={props.onClickMessage ?? (() => {})}
        >
          Message
        </Button>
      </div>
      <ConnectionsModal
        isOpen={isConnectionsModalOpen}
        onClose={() => setIsConnectionsModalOpen(false)}
        userId={props.userId || null}
        username={props.username}
      />
    </div>
  );
}

export { ProfileHeader };

// example usage:
// <ProfileHeader
//     username="testuser"
//     imgSrc="/avatars/cd5ba1b2b51aa23578ec39ca57088f729c806336.webp"
//     color="blue"
//     verified={true}
//     bio="Singer-songwriter, guitarist"
//     firstName="John"
//     lastName="Doe"
//     connections={150}
//     notes={45}
//     onClickConnect={() => console.log("Connect clicked")}
//     onClickMessage={() => console.log("Message clicked")}
// />
