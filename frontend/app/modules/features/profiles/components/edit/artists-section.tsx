import { Avatar } from "@/app/modules/components/avatar";
import Image from "next/image";
import Link from "next/link";

interface Artist {
	id: string;
	username: string;
	avatarUrl: string | null;
}

interface ArtistsSectionProps {
	showArtistsSection: boolean;
	setShowArtistsSection: (show: boolean) => void;
	isEditingArtist: boolean;
	setIsEditingArtist: (editing: boolean) => void;
	removedCollaborations: Set<string>;
	setRemovedCollaborations: React.Dispatch<React.SetStateAction<Set<string>>>;
	deleteCollaboration: (id: string) => void;
	themeColorValue: string;
}

export function ArtistsSection({
	showArtistsSection,
	setShowArtistsSection,
	isEditingArtist,
	setIsEditingArtist,
	removedCollaborations,
	setRemovedCollaborations,
	themeColorValue,
}: ArtistsSectionProps) {
	if (!showArtistsSection) return null;

	// Hardcoded artists data
	const artistsData: Artist[] = [
		{
			id: "1",
			username: "medina",
			avatarUrl:
				"https://i.scdn.co/image/ab6761610000e5eb211afd577e27b6cbfb1e5064",
		},
		{
			id: "2",
			username: "burhang",
			avatarUrl:
				"https://cdn-p.smehost.net/sites/ef38b16bfa9341f8994dd4d1bbaa542a/wp-content/uploads/2022/10/0075f4ac75766b99fb91e30007eb4949390a7b5e.jpeg",
		},
		{
			id: "3",
			username: "kanyewest",
			avatarUrl:
				"https://upload.wikimedia.org/wikipedia/commons/5/5c/Kanye_West_at_the_2009_Tribeca_Film_Festival_%28crop_2%29.jpg",
		},
	];

	const filteredArtists = artistsData.filter(
		(artist) => !removedCollaborations.has(artist.id)
	);

	return (
		<div className="relative self-stretch rounded-[1.5625rem] border border-black/10 py-9 px-3.75">
			<Image
				src={"/icons/close.svg"}
				width={24}
				height={24}
				alt="Close"
				className="absolute top-2 right-2 cursor-pointer"
				onClick={() => setShowArtistsSection(false)}
			/>
			<div className={`flex items-center `}>
				<h4 className="w-full max-w-24 font-semibold">
					Artists
					<br />I like
				</h4>

				{isEditingArtist ? (
					// Grid layout when editing
					<div className="flex flex-col gap-6">
						<ul className="grid grid-cols-3 gap-4 w-full">
							{filteredArtists.map((artist) => (
								<li key={artist.id} className="flex flex-col items-center">
									<div className="relative">
										<Avatar
											size="xl"
											fallback={artist?.username?.charAt(0)?.toUpperCase()}
											src={artist?.avatarUrl}
											className="rounded-full border-3 border-white aspect-square object-cover drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
											alt={`${artist?.username}'s avatar`}></Avatar>

										<button
											type="button"
											onClick={() => {
												setRemovedCollaborations((prev: Set<string>) => {
													return new Set([...prev, artist.id]);
												});
											}}
											style={{ background: themeColorValue }}
											className={`absolute top-0 right-0 rounded-full p-0.5 transition`}>
											<Image
												src="/icons/close.svg"
												width={16}
												height={16}
												alt="Delete"
												className="invert brightens-0"
											/>
										</button>
									</div>
									<p className="text-sm font-medium text-center text-grey max-w-[90px] truncate">
										{artist.username}
									</p>
								</li>
							))}
						</ul>
					</div>
				) : (
					// Overlapping layout when not editing
					<div className="flex items-center gap-4">
						<ul className="flex">
							{filteredArtists.slice(0, 3).map((artist, index) => (
								<li key={index} className="first:ml-0 -ml-[25px]">
									<Link
										href={`/profile/${artist.username}`}
										target="_blank"
										rel="noopener noreferrer">
										<Avatar
											size="xl"
											fallback={
												artist?.username?.charAt(0)?.toUpperCase() || ""
											}
											src={artist?.avatarUrl}
											className="rounded-full border-3 border-white aspect-square object-cover drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
											alt={`${artist?.username}'s avatar`}></Avatar>
									</Link>
								</li>
							))}
							{filteredArtists.length > 3 && (
								<li className="-ml-[25px]">
									<div
										className="w-[72px] h-[72px] rounded-full border-3 border-white flex items-center justify-center drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
										style={{
											backgroundColor: themeColorValue || "#1E1E1E",
										}}>
										<span className="text-white font-semibold">
											+{filteredArtists.length - 3}
										</span>
									</div>
								</li>
							)}
						</ul>
					</div>
				)}
			</div>

			<p
				onClick={() => setIsEditingArtist(!isEditingArtist)}
				className="absolute bottom-3 right-3.5 cursor-pointer">
				{isEditingArtist ? "Done" : "Edit"}
			</p>
		</div>
	);
}
