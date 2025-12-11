"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/modules/components/buttons";
import { Combobox } from "@/app/modules/components/combobox";
import { supabase } from "@/app/modules/supabase/client";
import { Avatar } from "@/app/modules/components/avatar";

interface User {
	id: string;
	username: string;
	firstName?: string | null;
	lastName?: string | null;
	avatarUrl?: string | null;
}

interface UserTaggerProps {
	selectedUsers: string[]; // Array of user IDs
	selectedUserObjects: User[]; // Array of full user objects
	onUsersChange: (userIds: string[]) => void;
	onUserObjectsChange: (users: User[]) => void;
	isOpen: boolean;
	onClose: () => void;
	maxUsers?: number;
}

// Fetch followed users API - accept token and userId as parameters
async function fetchFollowedUsers(
	userId: string,
	search?: string
): Promise<User[]> {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

	const response = await fetch(`${baseUrl}/connections/accepted/${userId}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) throw new Error("Failed to fetch users");
	const data = await response.json();

	// Map connections to users and filter by search if provided
	const connections = data as Array<{
		id: string;
		requester?: {
			id: string;
			username: string;
			firstName?: string | null;
			lastName?: string | null;
			avatarUrl?: string | null;
		};
		recipient?: {
			id: string;
			username: string;
			firstName?: string | null;
			lastName?: string | null;
			avatarUrl?: string | null;
		};
	}>;

	const users: User[] = connections.map((conn) => {
		// Get the other user in the connection (not the current user)
		const user =
			conn.requester?.id === userId ? conn.recipient : conn.requester;
		return {
			id: user!.id,
			username: user!.username,
			firstName: user!.firstName,
			lastName: user!.lastName,
			avatarUrl: user!.avatarUrl,
		};
	});

	// Filter by search query if provided
	if (search && search.trim()) {
		const searchLower = search.toLowerCase();
		const filtered = users.filter(
			(user) =>
				user.username.toLowerCase().includes(searchLower) ||
				user.firstName?.toLowerCase().includes(searchLower) ||
				user.lastName?.toLowerCase().includes(searchLower)
		);
		const sorted = filtered.sort((a, b) => {
			const aFields = [
				a.username?.toLowerCase(),
				a.firstName?.toLowerCase(),
				a.lastName?.toLowerCase(),
			];
			const bFields = [
				b.username?.toLowerCase(),
				b.firstName?.toLowerCase(),
				b.lastName?.toLowerCase(),
			];

			const aStarts = aFields.some((field) => field?.startsWith(searchLower));
			const bStarts = bFields.some((field) => field?.startsWith(searchLower));

			if (aStarts && !bStarts) return -1;
			if (!aStarts && bStarts) return 1;
			return 0;
		});

		return sorted.slice(0, 5);
	}

	// Return only 5 users when no search query
	return users.slice(0, 5);
}

export function UserTagger({
	selectedUsers,
	selectedUserObjects,
	onUsersChange,
	onUserObjectsChange,
	isOpen,
	onClose,
	maxUsers = 1,
}: UserTaggerProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch users when search changes (debounced)
	useEffect(() => {
		if (!isOpen) return;

		const timeoutId = setTimeout(async () => {
			setIsLoading(true);
			try {
				// Get user ID from Supabase session
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (!session?.user?.id) {
					console.error("No user session found");
					setIsLoading(false);
					return;
				}

				const fetchedUsers = await fetchFollowedUsers(
					session.user.id,
					searchQuery
				);
				setUsers(fetchedUsers);
			} catch (error) {
				console.error("Failed to fetch users:", error);
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, isOpen]);

	const handleToggleUser = (userId: string) => {
		const user = users.find((u) => u.id === userId);

		if (selectedUsers.includes(userId)) {
			// Remove user
			onUsersChange(selectedUsers.filter((id) => id !== userId));
			onUserObjectsChange(selectedUserObjects.filter((u) => u.id !== userId));
		} else {
			// Add user (check limit)
			if (selectedUsers.length >= maxUsers) {
				alert(`You can only tag up to ${maxUsers} users`);
				return;
			}

			if (user) {
				onUsersChange([...selectedUsers, userId]);
				onUserObjectsChange([...selectedUserObjects, user]);
			}
			// Auto-close after adding a user
			onClose();
		}
	};

	return (
		isOpen && (
			<div>
				<div>
					{/* Search input */}
					<div className="flex px-[0.9375rem] py-[0.625rem] my-[0.3125rem] mx-[0.625rem] justify-between items-center flex-[1_0_0] rounded-[18.75rem] border border-[rgba(0,0,0,0.05)]">
						<Combobox
							dropdownDisabled
							blank
							className="border-none"
							value={searchQuery}
							onAction={setSearchQuery}
							options={users.map((user) => ({
								value: user.username,
								label:
									`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
									user.username,
							}))}
							placeholder="Search people..."
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="17"
							viewBox="0 0 16 17"
							fill="none">
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M7.11717 1.74681C5.67372 1.74681 4.28939 2.34515 3.26871 3.4102C2.24804 4.47525 1.67463 5.91977 1.67463 7.42598C1.67463 8.93219 2.24804 10.3767 3.26871 11.4418C4.28939 12.5068 5.67372 13.1052 7.11717 13.1052C8.56063 13.1052 9.94496 12.5068 10.9656 11.4418C11.9863 10.3767 12.5597 8.93219 12.5597 7.42598C12.5597 5.91977 11.9863 4.47525 10.9656 3.4102C9.94496 2.34515 8.56063 1.74681 7.11717 1.74681ZM1.60502e-08 7.42598C9.67028e-05 6.24174 0.271595 5.07469 0.791843 4.0222C1.31209 2.96971 2.066 2.0623 2.99068 1.37568C3.91536 0.689064 4.98399 0.243145 6.10741 0.075127C7.23083 -0.0928906 8.37647 0.0218659 9.44874 0.409823C10.521 0.797779 11.4888 1.44769 12.2715 2.30532C13.0541 3.16296 13.6288 4.20345 13.9476 5.33999C14.2665 6.47653 14.3203 7.67616 14.1045 8.8388C13.8887 10.0014 13.4096 11.0934 12.7071 12.0235L15.765 15.2143C15.9175 15.3791 16.0019 15.5998 16 15.8289C15.9981 16.058 15.91 16.2771 15.7548 16.4391C15.5995 16.6011 15.3895 16.693 15.17 16.695C14.9504 16.697 14.7389 16.6089 14.581 16.4498L11.5231 13.2589C10.4736 14.1222 9.21247 14.6596 7.88392 14.8099C6.55538 14.9601 5.21314 14.717 4.01081 14.1084C2.80849 13.4998 1.79466 12.5502 1.08535 11.3685C0.376043 10.1867 -8.97127e-05 8.82041 1.60502e-08 7.42598ZM6.27986 4.36797C6.27986 4.13624 6.36808 3.91401 6.5251 3.75015C6.68213 3.5863 6.8951 3.49425 7.11717 3.49425C8.11649 3.49425 9.07487 3.90848 9.78149 4.64582C10.4881 5.38317 10.8851 6.38322 10.8851 7.42598C10.8851 7.65771 10.7969 7.87994 10.6398 8.04379C10.4828 8.20765 10.2698 8.2997 10.0478 8.2997C9.8257 8.2997 9.61273 8.20765 9.4557 8.04379C9.29868 7.87994 9.21046 7.65771 9.21046 7.42598C9.21046 6.84667 8.98992 6.29109 8.59735 5.88145C8.20478 5.47182 7.67235 5.24168 7.11717 5.24168C6.8951 5.24168 6.68213 5.14963 6.5251 4.98578C6.36808 4.82192 6.27986 4.59969 6.27986 4.36797Z"
								fill="#8A8A8A"
							/>
						</svg>
					</div>

					{/* Available users */}
					{users.length > 0 && (
						<div className="flex flex-col ">
							{users
								.filter((user) => !selectedUsers.includes(user.id))
								.map((user) => (
									<div
										key={user.id}
										onClick={() => handleToggleUser(user.id)}
										className="flex px-[0.9375rem] py-[0.625rem] pl-[0.625rem] justify-between items-center">
										<div className="flex items-center gap-[0.625rem]">
											<Avatar
												size="sm"
												fallback={
													(user?.firstName?.charAt(0)?.toUpperCase() || "") +
													(user?.lastName?.charAt(0)?.toUpperCase() || "")
												}
												src={user?.avatarUrl}
												alt={`${user?.username}'s avatar`}></Avatar>

											<p className="text-gray-500 text-[0.875rem] font-medium">
												{user.firstName ? `${user.firstName}` : user.username}
											</p>
										</div>
										<Button
											className="bg-crocus-yellow border-none w-[1.5625rem] h-[1.5625rem]"
											blank
											variant="icon"
											icon="plus"
											key={user.id}
											onClick={() => handleToggleUser(user.id)}></Button>
									</div>
								))}
						</div>
					)}
				</div>
			</div>
		)
	);
}
