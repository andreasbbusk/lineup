import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ErrorMessage } from "@/app/modules/components/error-message";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface MyMusicSectionProps {
	showMyMusicSection: boolean;
	setShowMyMusicSection: (show: boolean) => void;
	spotifyPlaylistUrlValue: string;
	registerSpotifyUrl: UseFormRegisterReturn;
	spotifyUrlError: FieldError | undefined;
}

export function MyMusicSection({
	showMyMusicSection,
	setShowMyMusicSection,
	spotifyPlaylistUrlValue,
	registerSpotifyUrl,
	spotifyUrlError,
}: MyMusicSectionProps) {
	const [isEditingSpotify, setIsEditingSpotify] = useState(false);

	if (!showMyMusicSection) return null;

	return (
		<div className="relative self-stretch rounded-[1.5625rem] border border-black/10 py-9 px-3.75 w-full max-w-200 mx-auto">
			<Image
				src={"/icons/close.svg"}
				width={24}
				height={24}
				alt="Close"
				className="absolute top-2 right-2 cursor-pointer"
				onClick={() => setShowMyMusicSection(false)}
			/>
			<div className="flex items-center">
				<h4 className="w-full max-w-24 font-semibold">My music</h4>
				{isEditingSpotify ? (
					<div className="flex flex-col gap-3 w-full">
						<input
							{...registerSpotifyUrl}
							type="url"
							placeholder="Link to your Spotify playlist"
							className="w-full px-3 py-2 rounded-lg border border-black/10"
						/>
						{spotifyUrlError && (
							<ErrorMessage message={spotifyUrlError.message || ""} />
						)}
					</div>
				) : (
					<Link href={spotifyPlaylistUrlValue}>
						{spotifyPlaylistUrlValue ? "Spotify linked" : "No Spotify linked"}
					</Link>
				)}
			</div>
			<p
				onClick={() => setIsEditingSpotify(!isEditingSpotify)}
				className="absolute bottom-3 right-3.5 cursor-pointer">
				{isEditingSpotify ? "Done" : "Edit"}
			</p>
		</div>
	);
}
