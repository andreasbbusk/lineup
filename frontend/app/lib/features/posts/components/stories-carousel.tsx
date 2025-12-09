import { useEffect, useState } from "react";
import { Avatar } from "@/app/components/avatar";
import { getUserProfile } from "@/app/lib/features/profiles/api";
import type { UserProfile } from "@/app/lib/features/profiles/types";

const STORY_USERNAMES = [
	"ostehvl",
	"medina",
	"andreaskadhede",
	"Testmand",
	"androkles",
	"Testkvinde",
];

function StoriesCarousel() {
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSpecificUsers = async () => {
			try {
				setIsLoading(true);

				const uniqueUsernames = Array.from(new Set(STORY_USERNAMES));
				const profiles = await Promise.all(
					uniqueUsernames.map((username) => getUserProfile(username))
				);

				setUsers(profiles);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
				console.error("Error fetching users:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSpecificUsers();
	}, []);

	if (isLoading) {
		return <div className="my-custom-class">Loading stories...</div>;
	}

	if (error) {
		return <div className="my-custom-class">Error: {error}</div>;
	}

	return (
		<div className="flex px-4  items-start gap-3 bg-white overflow-x-auto pb-4 snap-mandatory md:grid md:grid-cols-3 md:overflow-visible border-b-2 border-gray-200">
			{users.map((user) => (
				<div
					key={user.id}
					className="flex flex-col items-center gap-1.5 snap-start md:min-w-0 ">
					<Avatar
						size="xl"
						src={user.avatarUrl}
						alt={`${user.firstName} ${user.lastName}`}
						fallback={user.firstName.charAt(0) + user.lastName.charAt(0)}
						className="border-2 border-crocus-yellow rounded-full"
					/>
					<div className="flex flex-col text-center text-sm">
						<p>{user.firstName}</p>
						<p>{user.lastName}</p>
					</div>
				</div>
			))}
		</div>
	);
}

export { StoriesCarousel };
