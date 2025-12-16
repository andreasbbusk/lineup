import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const socialMediaIcons: Record<string, string> = {
	instagram: "/icons/social-media/instagram.svg",
	twitter: "/icons/social-media/x.svg",
	facebook: "/icons/social-media/facebook.svg",
	youtube: "/icons/social-media/youtube.svg",
	tiktok: "/icons/social-media/tiktok.svg",
};

const socialMediaPlatforms = [
	"instagram",
	"twitter",
	"facebook",
	"youtube",
	"tiktok",
];

interface SocialMediaSectionProps {
	showSocialMediaSection: boolean;
	setShowSocialMediaSection: (show: boolean) => void;
	socialMediaLinks: Record<string, string>;
	setSocialMediaLinks: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
}

export function SocialMediaSection({
	showSocialMediaSection,
	setShowSocialMediaSection,
	socialMediaLinks,
	setSocialMediaLinks,
}: SocialMediaSectionProps) {
	const [isEditingSocials, setIsEditingSocials] = useState(false);

	const handleSocialMediaChange = (platform: string, value: string) => {
		setSocialMediaLinks((prev) => ({
			...prev,
			[platform]: value,
		}));
	};
	if (!showSocialMediaSection) return null;

	return (
		<div className="relative self-stretch rounded-[1.5625rem] border border-black/10 py-9 px-3.75 w-full max-w-200 mx-auto">
			<Image
				src={"/icons/close.svg"}
				width={24}
				height={24}
				alt="Close"
				className="absolute top-2 right-2 cursor-pointer"
				onClick={() => setShowSocialMediaSection(false)}
			/>
			<div className="flex items-center">
				<h4 className="w-full max-w-24 font-semibold">Social Media</h4>
				<div
					className={`flex ${
						isEditingSocials ? "flex-col" : "flex-row"
					} gap-4 w-full`}>
					{isEditingSocials
						? socialMediaPlatforms.map((platform) => (
								<div key={platform} className="flex gap-3">
									<Image
										src={socialMediaIcons[platform]}
										alt={platform}
										width={32}
										height={32}
									/>
									<input
										type="url"
										value={socialMediaLinks[platform]}
										onChange={(e) =>
											handleSocialMediaChange(platform, e.target.value)
										}
										placeholder={`${
											platform.charAt(0).toUpperCase() + platform.slice(1)
										} URL`}
										className="w-full px-3 py-2 rounded-lg border border-black/10"
									/>
								</div>
						  ))
						: socialMediaPlatforms.map((platform) => {
								const link = socialMediaLinks[platform];
								if (!link) return null;
								return (
									<div key={platform} className="flex gap-3">
										<Link href={link} target="_blank" rel="noopener noreferrer">
											<Image
												src={socialMediaIcons[platform]}
												alt={platform}
												width={32}
												height={32}
											/>
										</Link>
									</div>
								);
						  })}
				</div>
			</div>

			<p
				onClick={() => setIsEditingSocials(!isEditingSocials)}
				className="absolute bottom-3 right-3.5 cursor-pointer hover:underline">
				{isEditingSocials ? "Done" : "Edit"}
			</p>
		</div>
	);
}
