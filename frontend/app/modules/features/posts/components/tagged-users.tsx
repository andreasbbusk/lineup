"use client";
import Link from "next/link";
import type { PostResponse } from "../types";
import { Avatar } from "@/app/modules/components/avatar";

interface TaggedUsersProps {
	taggedUsers?: PostResponse["taggedUsers"];
	className?: string;
}

export function TaggedUsers({ taggedUsers, className = "" }: TaggedUsersProps) {
	if (!taggedUsers || taggedUsers.length === 0) return null;

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<span className="text-sm text-gray-500">Tagged:</span>
			<div className="flex items-center gap-2">
				{taggedUsers.map((user) => (
					<Link
						key={user.id}
						href={`/profile/${user.username}`}
						className="flex items-center gap-1.5 rounded-full hover:bg-gray-100 px-2 py-1 transition-colors">
						<Avatar
							size="xs"
							fallback={
								(user?.firstName?.charAt(0)?.toUpperCase() || "") +
								(user?.lastName?.charAt(0)?.toUpperCase() || "")
							}
							src={user?.avatarUrl}
							alt={`${user?.username}'s avatar`}></Avatar>

						<span className="text-sm font-medium">
							{user.firstName || user.username}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
