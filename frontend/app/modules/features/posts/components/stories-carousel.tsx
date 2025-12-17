import { Avatar } from "@/app/modules/components/avatar";
import type { UserProfile } from "@/app/modules/features/profiles/types";

interface StoriesCarouselProps {
  users: UserProfile[];
}

function StoriesCarousel({ users }: StoriesCarouselProps) {
  if (!users || users.length === 0) {
    return null;
  }

  return (
    <div className="no-scrollbar flex items-start gap-3 bg-white overflow-x-auto pb-4 snap-mandatory border-b-2 border-gray-200 px-4 md:justify-center min-h-[141px]">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col items-center gap-1.5 snap-start md:min-w-0"
        >
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
