import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@/app/modules/components/buttons";
import { Popover } from "@/app/modules/components/popover";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import { ConnectionButton } from "./connections/ConnectionButton";

// Lazy load ConnectionsModal to reduce initial bundle size
const ConnectionsModal = dynamic(
	() =>
		import("./connections/ConnectionsModal").then((mod) => ({
			default: mod.ConnectionsModal,
		})),
	{
		loading: () => (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
				<div className="flex items-center justify-center">
					<LoadingSpinner />
				</div>
			</div>
		),
		ssr: false,
	}
);

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
	 * default: "#1E1E1E",
		grey: "#575252",
		green: "#3F4D54",
		blue: "#3F4254",
		purple: "#4D3F54",
		red: "#543F40",
		orange: "#5D4C43",
	 */
	theme: string;
	/** Is the profile verified */
	verified?: boolean;
	/** First name */
	firstName: string;
	/** Last name */
	lastName: string;
	/** Number of connections */
	connections?: number;
	/** Number of pending connection requests (for own profile only) */
	pendingConnectionsCount?: number;
	/** Number of posts (notes + requests) */
	notes?: number;
	/** Alias for notes - kept for backward compatibility */
	posts?: number;
	/** Callback when Connect button is clicked */
	onClickConnect?: () => void;
	/** Callback when Message button is clicked */
	onClickMessage?: () => void;
	/** Is the profile the current user's profile */
	isOwnProfile?: boolean;
};

function ProfileHeader(props: ProfileHeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

	const displayConnectionsCount = props.connections ?? 0;
	const pendingCount = props.pendingConnectionsCount ?? 0;

	return (
		<div
			className={
				"relative text-white flex w-93.25 py-6.25 flex-col justify-center items-center gap-3.75 rounded-[2.8125rem] bg-(--profile-theme)"
			}
			style={{ "--profile-theme": `${props.theme}` } as CSSProperties}>
			<span
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				className="absolute top-9 right-7 flex w-5.25 items-center gap-1 cursor-pointer">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="3"
					height="3"
					viewBox="0 0 3 3"
					fill="none">
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
					fill="none">
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
					fill="none">
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
				<Popover variant="my-profile" className="absolute top-12 right-7" />
			)}
			<div className="flex justify-center items-center self-stretch">
				<button
					onClick={() => setIsConnectionsModalOpen(true)}
					className="flex flex-col items-center flex-[1_0_0] cursor-pointer hover:opacity-80 transition-opacity">
					<div className="relative">
						<p>{displayConnectionsCount}</p>
						{pendingCount > 0 && (
							<span className="absolute top-0 -right-2.5 flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full aspect-square bg-crocus-yellow text-black text-xs font-semibold transform translate-x-1/2 -translate-y-1/2">
								{pendingCount > 99 ? "99+" : pendingCount}
							</span>
						)}
					</div>
					<p>Connections</p>
				</button>
				<Image
					src={props.imgSrc}
					alt={`${props.username}'s avatar`}
					width={146}
					height={146}
					className="w-[9.11988rem] h-[9.11988rem] rounded-full border border-white object-cover "
				/>
				<div className="flex flex-col items-center flex-[1_0_0]">
					<p>{props.posts ?? props.notes ?? 0}</p>
					<p>Posts</p>
				</div>
			</div>
			<div>
				<div className="flex justify-center items-start gap-1.5 self-stretch">
					<h3 className="text-center text-[1.125rem]">
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
				<p className="text-melting-glacier text-center text-xs leading-none self-stretch">
					{props.bio}
				</p>
			</div>
			<div className="flex items-center gap-(--Spacing-XS---spacing,0.625rem)">
				{props.isOwnProfile ? (
					<>
						<Link href="/profile/edit">
							<Button variant="primary" glass onClick={() => {}}>
								Edit Profile
							</Button>
						</Link>
						<Button
							variant="primary"
							glass
							onClick={() => {
								// TODO: Implement share profile functionality
							}}>
							Share Profile
						</Button>
					</>
				) : (
					<>
						<ConnectionButton targetUserId={props.userId || null} />
						<Button
							variant="primary"
							glass
							onClick={props.onClickMessage ?? (() => {})}>
							Message
						</Button>
					</>
				)}
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
//     theme="blue"
//     verified={true}
//     bio="Singer-songwriter, guitarist"
//     firstName="John"
//     lastName="Doe"
//     connections={150}
//     notes={45}
//     onClickConnect={() => console.log("Connect clicked")}
//     onClickMessage={() => console.log("Message clicked")}
//     isOwnProfile={true}
// />
