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
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-10" />
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
