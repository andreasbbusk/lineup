import { useState } from "react";
import { Tabs, TabsContent } from "@/app/components/tabs";
import { Tags } from "@/app/components/tags";
import Image from "next/image";
import Link from "next/link";

type ProfileBodyProps = {
  aboutMe?: string;
  lookingFor?: string[];
  genres?: string[];
  socialMedia?: {
    platform: string;
    link: string;
  }[];
  favoriteArtists?: {
    link: string;
    imgSrc: string;
  }[];
  myMusic?: string[];
  videos?: string[];
  pastCollaborations?: {
    link: string;
    imgSrc: string;
  }[];
  reviews?: {
    reviewer: string;
    rating: number;
    comment: string;
  }[];
  questions?: {
    question: string;
    answer: string;
  }[];

  theme?: "default" | "grey" | "green" | "blue" | "purple" | "red" | "orange";
};

function ProfileBody(props: ProfileBodyProps) {
  const [activeTab, setActiveTab] = useState<"about" | "notes">("about");
  const [showAllArtists, setShowAllArtists] = useState(false);
  const [showAllCollaborators, setShowAllCollaborators] = useState(false);

  const socialMediaIcons: Record<string, string> = {
    Instagram: "/icons/social-media/instagram.svg",
    X: "/icons/social-media/x.svg",
    Facebook: "/icons/social-media/facebook.svg",
    TikTok: "/icons/social-media/tiktok.svg",
    YouTube: "/icons/social-media/youtube.svg",
  };

  return (
    <>
      <Tabs variant="profile" activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="about">
          {/* About Me section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">About me</h4>
            {props.aboutMe ? (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                {props.aboutMe}
              </p>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No description yet.
              </p>
            )}
          </section>

          {/* What I am looking for section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">
              What I am looking for
            </h4>
            {props.lookingFor && props.lookingFor.length > 0 ? (
              <ul className="flex flex-wrap py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                {props.lookingFor.map((item, index) => (
                  <li key={index}>
                    <Tags color={props.theme} text={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                Not specified yet.
              </p>
            )}
          </section>

          {/* Genres section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">Genres</h4>
            {props.genres && props.genres.length > 0 ? (
              <ul className="flex flex-wrap py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                {props.genres.map((genre, index) => (
                  <li key={index}>
                    <Tags color={props.theme} text={genre} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No genres specified yet.
              </p>
            )}
          </section>

          {/* Reviews section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">Reviews</h4>
            {props.reviews && props.reviews.length > 0 ? (
              <div className="flex flex-col items-start gap-[0.625rem] self-stretch">
                {/* Average rating stars */}
                <div className="flex pl-[0.9375rem] justify-center items-center gap-[0.625rem]">
                  {Array(
                    Math.round(
                      props.reviews.reduce((sum, r) => sum + r.rating, 0) /
                        props.reviews.length
                    )
                  )
                    .fill(null)
                    .map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="17"
                        viewBox="0 0 18 17"
                        fill="none"
                      >
                        <path
                          d="M8.56088 13.7L4.41088 16.2C4.22754 16.3167 4.03588 16.3667 3.83588 16.35C3.63588 16.3333 3.46088 16.2667 3.31088 16.15C3.16088 16.0333 3.04421 15.8877 2.96088 15.713C2.87754 15.5383 2.86088 15.3423 2.91088 15.125L4.01088 10.4L0.335876 7.225C0.169209 7.075 0.0652091 6.904 0.0238758 6.712C-0.0174575 6.52 -0.00512426 6.33267 0.0608757 6.15C0.126876 5.96733 0.226876 5.81733 0.360876 5.7C0.494876 5.58267 0.678209 5.50767 0.910876 5.475L5.76088 5.05L7.63588 0.6C7.71921 0.4 7.84854 0.25 8.02388 0.15C8.19921 0.0499999 8.37821 0 8.56088 0C8.74354 0 8.92254 0.0499999 9.09788 0.15C9.27321 0.25 9.40254 0.4 9.48588 0.6L11.3609 5.05L16.2109 5.475C16.4442 5.50833 16.6275 5.58333 16.7609 5.7C16.8942 5.81667 16.9942 5.96667 17.0609 6.15C17.1275 6.33333 17.1402 6.521 17.0989 6.713C17.0575 6.905 16.9532 7.07567 16.7859 7.225L13.1109 10.4L14.2109 15.125C14.2609 15.3417 14.2442 15.5377 14.1609 15.713C14.0775 15.8883 13.9609 16.034 13.8109 16.15C13.6609 16.266 13.4859 16.3327 13.2859 16.35C13.0859 16.3673 12.8942 16.3173 12.7109 16.2L8.56088 13.7Z"
                          fill="#FFB751"
                        />
                      </svg>
                    ))}
                  {Array(
                    5 -
                      Math.round(
                        props.reviews.reduce((sum, r) => sum + r.rating, 0) /
                          props.reviews.length
                      )
                  )
                    .fill(null)
                    .map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="17"
                        viewBox="0 0 18 17"
                        fill="none"
                      >
                        <path
                          d="M8.56088 13.7L4.41088 16.2C4.22754 16.3167 4.03588 16.3667 3.83588 16.35C3.63588 16.3333 3.46088 16.2667 3.31088 16.15C3.16088 16.0333 3.04421 15.8877 2.96088 15.713C2.87754 15.5383 2.86088 15.3423 2.91088 15.125L4.01088 10.4L0.335876 7.225C0.169209 7.075 0.0652091 6.904 0.0238758 6.712C-0.0174575 6.52 -0.00512426 6.33267 0.0608757 6.15C0.126876 5.96733 0.226876 5.81733 0.360876 5.7C0.494876 5.58267 0.678209 5.50767 0.910876 5.475L5.76088 5.05L7.63588 0.6C7.71921 0.4 7.84854 0.25 8.02388 0.15C8.19921 0.0499999 8.37821 0 8.56088 0C8.74354 0 8.92254 0.0499999 9.09788 0.15C9.27321 0.25 9.40254 0.4 9.48588 0.6L11.3609 5.05L16.2109 5.475C16.4442 5.50833 16.6275 5.58333 16.7609 5.7C16.8942 5.81667 16.9942 5.96667 17.0609 6.15C17.1275 6.33333 17.1402 6.521 17.0989 6.713C17.0575 6.905 16.9532 7.07567 16.7859 7.225L13.1109 10.4L14.2109 15.125C14.2609 15.3417 14.2442 15.5377 14.1609 15.713C14.0775 15.8883 13.9609 16.034 13.8109 16.15C13.6609 16.266 13.4859 16.3327 13.2859 16.35C13.0859 16.3673 12.8942 16.3173 12.7109 16.2L8.56088 13.7Z"
                          fill="#DADADA"
                        />
                      </svg>
                    ))}
                  <p className="text-[var(--color-grey)] text-[0.875rem] font-medium leading-[135%] tracking-[0.03125rem]">
                    {props.reviews.length} reviews
                  </p>
                </div>
                {/* Latest review */}
                <div className="inline-flex  gap-[0.3125rem] pl-[0.9375rem]">
                  <p className="text-wrap">
                    <q className="text-wrap">
                      {props.reviews[props.reviews.length - 1].comment}
                    </q>{" "}
                    - {props.reviews[props.reviews.length - 1].reviewer}
                  </p>
                </div>
              </div>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No reviews yet.
              </p>
            )}
          </section>

          {/* Social Media section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">
              Social Media
            </h4>
            {props.socialMedia && props.socialMedia.length > 0 ? (
              <ul className="grid grid-cols-5 items-center py-0 px-[0.9375rem] gap-[0.625rem] self-stretch">
                {Array.from({ length: 5 }).map((_, i) => {
                  const social = props.socialMedia?.[i];
                  return (
                    <li key={i} className="flex items-center justify-center">
                      {social ? (
                        <Link
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={socialMediaIcons[social.platform]}
                            alt={social.platform}
                            width={40}
                            height={40}
                          />
                        </Link>
                      ) : (
                        <div aria-hidden className="w-10 h-10" />
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No social media added yet.
              </p>
            )}
          </section>

          {/* Artists I like section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">
              Artists I like
            </h4>
            {props.favoriteArtists && props.favoriteArtists.length > 0 ? (
              <div className="flex py-0 px-[var(--Spacing-S---spacing,_0.9375rem)] items-center gap-[1.0625rem] self-stretch">
                <ul className="flex py-0 items-center">
                  {props.favoriteArtists
                    ?.slice(0, showAllArtists ? undefined : 3)
                    .map((artist, index) => (
                      <li key={index} className="first:ml-0 -ml-[25px]">
                        <Link
                          href={artist.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={artist.imgSrc || "/default-avatar.png"}
                            alt="Sender image"
                            width={77}
                            height={77}
                            className="rounded-full border-3 border-[var(--color-white)] aspect-square object-cover drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
                          />
                        </Link>
                      </li>
                    ))}
                  {!showAllArtists &&
                    props.favoriteArtists &&
                    props.favoriteArtists.length > 3 && (
                      <li className="-ml-[25px]">
                        <div className="w-[77px] h-[77px] rounded-full bg-[var(--color-black)] border-3 border-[var(--color-white)] flex items-center justify-center drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]">
                          <span className="text-[var(--color-white)] font-semibold">
                            +{props.favoriteArtists.length - 3}
                          </span>
                        </div>
                      </li>
                    )}
                </ul>
                {!showAllArtists &&
                  props.favoriteArtists &&
                  props.favoriteArtists.length > 3 && (
                    <p
                      className="cursor-pointer tracking-[0.03125rem]"
                      onClick={() => setShowAllArtists(true)}
                    >
                      See all
                    </p>
                  )}
              </div>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No artists added yet.
              </p>
            )}
          </section>

          {/* My music section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">My music</h4>
            {props.myMusic && props.myMusic.length > 0 ? (
              <ul className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                {props.myMusic.map((music, index) => (
                  <li
                    key={index}
                    className="flex flex-col justify-center items-start w-[20.8125rem] h-[13.25rem] rounded-[1.5625rem] overflow-hidden"
                  >
                    <Image
                      src={music}
                      alt={`music-${index}`}
                      height={212}
                      width={333}
                      className="object-cover w-full h-full"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No music added yet.
              </p>
            )}
          </section>

          {/* Videos section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">Videos</h4>
            {props.videos && props.videos.length > 0 ? (
              <ul className="flex flex-col justify-center items-start gap-[0.625rem] py-0 px-[0.9375rem] self-stretch">
                {props.videos.map((video, index) => (
                  <li
                    key={index}
                    className="flex flex-col justify-center items-start w-[20.8125rem] h-[13.25rem] rounded-[1.5625rem] overflow-hidden"
                  >
                    <Image
                      src={video}
                      alt={`video-${index}`}
                      height={212}
                      width={333}
                      className="object-cover w-full h-full"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No videos added yet.
              </p>
            )}
          </section>

          {/* Past Collaborations section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">
              Past Collaborations
            </h4>
            {props.pastCollaborations && props.pastCollaborations.length > 0 ? (
              <div className="flex py-0 px-[var(--Spacing-S---spacing,_0.9375rem)] items-center gap-[1.0625rem] self-stretch">
                <ul className="flex py-0 items-center self-stretch">
                  {props.pastCollaborations
                    ?.slice(0, showAllCollaborators ? undefined : 3)
                    .map((collab, index) => (
                      <li key={index} className="first:ml-0 -ml-[25px]">
                        <Link
                          href={collab.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={collab.imgSrc || "/default-avatar.png"}
                            alt="Sender image"
                            width={77}
                            height={77}
                            className="rounded-full border-3 border-[var(--color-white)] aspect-square object-cover drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]"
                          />
                        </Link>
                      </li>
                    ))}
                  {!showAllCollaborators &&
                    props.pastCollaborations &&
                    props.pastCollaborations.length > 3 && (
                      <li className="-ml-[25px]">
                        <div className="w-[77px] h-[77px] rounded-full bg-[var(--color-black)] border-3 border-[var(--color-white)] flex items-center justify-center drop-shadow-[0_2px_8px_rgba(99,99,99,0.20)]">
                          <span className="text-[var(--color-white)] font-semibold">
                            +{props.pastCollaborations.length - 3}
                          </span>
                        </div>
                      </li>
                    )}
                </ul>
                {!showAllCollaborators &&
                  props.pastCollaborations &&
                  props.pastCollaborations.length > 3 && (
                    <p
                      className="cursor-pointer tracking-[0.03125rem]"
                      onClick={() => setShowAllCollaborators(true)}
                    >
                      See all
                    </p>
                  )}
              </div>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No collaborations yet.
              </p>
            )}
          </section>

          {/* Questions section */}
          <section className="flex flex-col items-start gap-[0.9375rem] self-stretch">
            <h4 className="font-normal text-[var(--color-grey)]">Questions</h4>
            {props.questions && props.questions.length > 0 ? (
              <ul className="flex flex-col items-start self-stretch py-0 px-[0.9375rem] gap-[0.625rem]">
                {props.questions.map((questionObj, index) => (
                  <li key={index}>
                    <h5 className="font-bold leading-normal tracking-[0.03125rem]">
                      {questionObj.question}
                    </h5>
                    <p className="pl-[1.375rem]">{questionObj.answer}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex py-0 px-[0.9375rem] items-center gap-[0.625rem] self-stretch">
                No questions yet.
              </p>
            )}
          </section>
        </TabsContent>
        <TabsContent value="notes">My notes</TabsContent>
      </Tabs>
      ;
    </>
  );
}

export { ProfileBody };

// example usage:

/* <ProfileBody
	aboutMe="I am a passionate musician with a love for creating unique sounds."
	lookingFor={["Guitarists", "Producers"]}
	genres={["Rock", "Jazz", "Electronic"]}
	socialMedia={[
		{ platform: "Instagram", handle: "@musician" },
		{ platform: "YouTube", handle: "MusicianChannel" },
	]}
	favoriteArtists={[
		{ link: "https://artist1.com", imgSrc: "/artist1.jpg" },
		{ link: "https://artist2.com", imgSrc: "/artist2.jpg" },
		{ link: "https://artist3.com", imgSrc: "/artist3.jpg" },
	]}
	myMusic={["/music1.jpg", "/music2.jpg"]}
	videos={["/video1.jpg", "/video2.jpg"]}
	pastCollaborations={[
		{ link: "https://collab1.com", imgSrc: "/collab1.jpg" },
		{ link: "https://collab2.com", imgSrc: "/collab2.jpg" },
		{ link: "https://collab3.com", imgSrc: "/collab3.jpg" },
	]}
	reviews={[
		{
			reviewer: "Alice Smith",
			rating: 5,
			comment: "Amazing musician! Truly talented and a pleasure to work with.",
		},
		{
			reviewer: "Bob Johnson",
			rating: 5,
			comment: "Great sound and very professional.",
		},
	]}
	questions={[
		{
			question: "What inspires your music?",
			answer: "I draw inspiration from everyday life experiences and emotions.",
		},
		{
			question: "How do you approach collaboration?",
			answer: "I believe in open communication and blending different styles.",
		},
	]}
	theme="blue"
/>; */
