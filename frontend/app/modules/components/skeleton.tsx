import { cn } from "@/app/modules/utils/twUtil";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-shimmer before:bg-linear-to-r",
        "before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function ChatRowSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-3">
      <Skeleton className="w-13 h-13 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-10 mt-4" />
        </div>
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function MessageBubbleSkeleton({ isMe = false }: { isMe?: boolean }) {
  return (
    <div
      className={cn("flex gap-2 mb-4", isMe ? "flex-row-reverse" : "flex-row")}
    >
      <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-2" />
      <div
        className={cn(
          "flex flex-col max-w-[70%] space-y-1",
          isMe ? "items-end" : "items-start"
        )}
      >
        <Skeleton
          className={cn(
            "h-10 w-36 rounded-2xl",
            isMe ? "rounded-br-none" : "rounded-bl-none"
          )}
        />
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <article className="relative bg-white py-4 w-full max-w-200 self-center px-2">
      {/* Author Header */}
      <div className="mb-3 px-2.5 flex items-center gap-1.25">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Post Title */}
      <Skeleton className="px-2.5 mb-2 h-6 w-3/4" />

      {/* Media Placeholder */}
      <Skeleton className="mb-3 h-60 w-full" />

      {/* Description Lines */}
      <div className="mb-3 px-2.5 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Action Bar */}
      <div className="px-2.5 flex items-center gap-4">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-12" />
      </div>
    </article>
  );
}

export function StoryAvatarSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5 snap-start md:min-w-0">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="flex flex-col items-center gap-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function CompactPostCardSkeleton() {
  return (
    <article className="flex p-3.75 flex-col w-85 h-full justify-center gap-2.5 bg-white rounded-[1.5625rem] shadow-sm">
      {/* Author Header */}
      <div className="flex justify-between self-stretch">
        <div className="flex gap-1.25 items-center">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Divider */}
      <Skeleton className="h-px w-full" />

      {/* Title */}
      <Skeleton className="h-5 w-3/4 px-2.5" />

      {/* Description */}
      <div className="min-h-24 px-2.5 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>

      {/* Footer */}
      <div className="flex self-stretch gap-2.5 items-end">
        <Skeleton className="h-4 w-16" />
        <div className="flex-1 flex justify-end gap-1.25">
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </article>
  );
}
