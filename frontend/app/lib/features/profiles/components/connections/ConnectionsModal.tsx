"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/buttons";
import GlassSurface from "@/app/components/glass-surface";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { useAppStore } from "@/app/lib/stores/app-store";
import type { Connection } from "../../types";
import {
	useAcceptConnection,
	useRejectConnection,
	useRemoveConnection,
	useMyConnections,
	useUserConnections,
} from "@/app/lib/features/profiles/hooks/queries/useConnection";
import { useMyProfile } from "@/app/lib/features/profiles/hooks/queries/useProfile";

interface ConnectionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	userId: string | null;
	username: string;
}

/**
 * ConnectionsModal component
 *
 * Displays connections in a modal:
 * - For own profile: Shows pending connections at top (with accept/reject buttons) + accepted connections
 * - For other profiles: Shows only accepted connections (no pending, no buttons)
 */
export function ConnectionsModal({
	isOpen,
	onClose,
	userId,
	username,
}: ConnectionsModalProps) {
	const currentUserId = useAppStore((state) => state.user?.id);
	const isOwnProfile = !userId || userId === currentUserId;
	const { data: currentUserProfile } = useMyProfile();

	const { data: myConnections, isLoading: isLoadingMyConnections } =
		useMyConnections({ enabled: isOwnProfile && isOpen });
	const { data: userConnections, isLoading: isLoadingUserConnections } =
		useUserConnections({ userId, enabled: !isOwnProfile && isOpen });

	const acceptConnection = useAcceptConnection();
	const rejectConnection = useRejectConnection();
	const removeConnection = useRemoveConnection();

	const connectionsToUse = isOwnProfile ? myConnections : userConnections;
	const isLoading = isOwnProfile
		? isLoadingMyConnections
		: isLoadingUserConnections;

	const pendingConnections =
		isOwnProfile && connectionsToUse
			? connectionsToUse.filter((conn) => {
					return (
						conn.status === "pending" && conn.recipientId === currentUserId
					);
			  })
			: [];

	const acceptedConnections = connectionsToUse
		? connectionsToUse.filter((conn) => conn.status === "accepted")
		: [];

	const handleAccept = (requestId: string) => {
		acceptConnection.mutate(requestId);
	};

	const handleReject = (requestId: string) => {
		rejectConnection.mutate(requestId);
	};

	const handleRemove = (connection: Connection) => {
		// Use the connection ID to delete it
		removeConnection.mutate(connection.id);
	};

	const getOtherUser = (connection: Connection) => {
		let otherUser;

		if (isOwnProfile) {
			otherUser =
				connection.recipientId === currentUserId
					? connection.requester
					: connection.recipient;
		} else {
			otherUser =
				connection.requesterId === userId
					? connection.recipient
					: connection.requester;
		}

		if (otherUser?.id === currentUserId && currentUserProfile) {
			return {
				id: currentUserProfile.id,
				username: currentUserProfile.username,
				firstName: currentUserProfile.firstName,
				lastName: currentUserProfile.lastName,
				avatarUrl: currentUserProfile.avatarUrl,
				bio: currentUserProfile.bio,
			};
		}

		return otherUser;
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-4"
			onClick={onClose}>
			<div
				onClick={(e) => e.stopPropagation()}
				className="max-w-lg w-full sm:w-[calc(100%-2rem)] mx-auto h-[calc(100vh-5rem)] sm:h-[500px] max-h-[80vh] sm:max-h-[500px] mb-4 sm:mb-0">
				<GlassSurface
					className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden h-full"
					borderRadius={16}
					width="100%"
					height="100%">
					<div
						className="flex flex-col w-full h-full"
						style={{
							width: "100%",
							minHeight: "400px",
						}}>
						{/* Header */}
						<div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/20 w-full shrink-0">
							<h2 className="text-lg sm:text-h2 font-semibold text-white truncate pr-2 sm:pr-4">
								{isOwnProfile ? "My Connections" : `${username}'s Connections`}
							</h2>
							<button
								onClick={onClose}
								className="text-white hover:opacity-70 transition-opacity shrink-0"
								aria-label="Close modal">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M18 6L6 18M6 6L18 18"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						</div>

						{/* Content */}
						<div
							className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 w-full custom-scrollbar"
							style={{
								minHeight: "200px",
								flex: "1 1 auto",
							}}>
							{isLoading ? (
								<div className="flex items-center justify-center py-12">
									<LoadingSpinner size={40} />
								</div>
							) : (
								<div className="space-y-0 w-full">
									{/* Pending Connections (only for own profile) */}
									{isOwnProfile && pendingConnections.length > 0 && (
										<div className="space-y-0">
											<div className="space-y-0">
												{pendingConnections.map((connection) => {
													const otherUser = getOtherUser(connection);
													if (!otherUser) return null;

													return (
														<ConnectionRow
															key={connection.id}
															user={otherUser}
															connection={connection}
															showActions={isOwnProfile}
															onAccept={() => handleAccept(connection.id)}
															onReject={() => handleReject(connection.id)}
															isAccepting={acceptConnection.isPending}
															isRejecting={rejectConnection.isPending}
														/>
													);
												})}
											</div>
										</div>
									)}

									{/* Separator line between pending and accepted */}
									{isOwnProfile &&
										pendingConnections.length > 0 &&
										acceptedConnections.length > 0 && (
											<div className="border-t border-white/10 my-4" />
										)}

									{/* Accepted Connections */}
									{acceptedConnections.length > 0 ? (
										<div className="space-y-0">
											<div className="space-y-0">
												{acceptedConnections.map((connection) => {
													const otherUser = getOtherUser(connection);
													if (!otherUser) return null;

													return (
														<ConnectionRow
															key={connection.id}
															user={otherUser}
															connection={connection}
															showActions={false}
															showRemove={isOwnProfile}
															onRemove={() => handleRemove(connection)}
															isRemoving={removeConnection.isPending}
														/>
													);
												})}
											</div>
										</div>
									) : (
										!isLoading &&
										pendingConnections.length === 0 && (
											<div className="text-center py-12">
												<p className="text-body text-grey">
													{isOwnProfile
														? "No connections yet"
														: "No connections to show"}
												</p>
											</div>
										)
									)}
								</div>
							)}
						</div>
					</div>
				</GlassSurface>
			</div>
		</div>
	);
}

interface ConnectionRowProps {
	user: {
		id: string;
		username: string;
		firstName?: string | null;
		lastName?: string | null;
		avatarUrl?: string | null;
		bio?: string | null;
	};
	connection: Connection;
	showActions: boolean;
	onAccept?: () => void;
	onReject?: () => void;
	isAccepting?: boolean;
	isRejecting?: boolean;
	showRemove?: boolean;
	onRemove?: () => void;
	isRemoving?: boolean;
}

function ConnectionRow({
	user,
	showActions,
	onAccept,
	onReject,
	isAccepting = false,
	isRejecting = false,
	showRemove = false,
	onRemove,
	isRemoving = false,
}: ConnectionRowProps) {
	const displayName =
		user.firstName && user.lastName
			? `${user.firstName} ${user.lastName}`
			: user.username;

	return (
		<div className="flex items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4">
			<Link
				href={`/profile/${user.username}`}
				className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
				<Image
					src={user.avatarUrl || "/avatars/default-avatar.png"}
					alt={`${displayName}'s avatar`}
					width={48}
					height={48}
					className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
				/>
				<div className="flex-1 min-w-0">
					<p className="text-sm sm:text-body font-medium text-white truncate">
						{displayName}
					</p>
					{user.bio && (
						<p className="text-xs sm:text-sm text-grey/80 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
							{user.bio}
						</p>
					)}
				</div>
			</Link>
			{showActions && onAccept && onReject && (
				<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
					<Button
						variant="secondary"
						glass
						onClick={onAccept}
						disabled={isAccepting || isRejecting}
						className="min-w-[70px] sm:min-w-[80px] text-xs sm:text-sm px-2 sm:px-4 text-center">
						{isAccepting ? "..." : "Accept"}
					</Button>
					<Button
						variant="secondary"
						onClick={onReject}
						disabled={isAccepting || isRejecting}
						className="bg-white/10 text-white border-white/30 hover:bg-white/20 min-w-[70px] sm:min-w-[80px] text-xs sm:text-sm px-2 sm:px-4">
						{isRejecting ? "..." : "Reject"}
					</Button>
				</div>
			)}
			{showRemove && onRemove && (
				<div className="flex items-center shrink-0">
					<Button
						variant="secondary"
						onClick={onRemove}
						disabled={isRemoving}
						className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-xs sm:text-sm px-2 sm:px-4 min-w-[70px] sm:min-w-[80px]">
						{isRemoving ? "..." : "Remove"}
					</Button>
				</div>
			)}
		</div>
	);
}
