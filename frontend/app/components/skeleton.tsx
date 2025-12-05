import { cn } from "@/app/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
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
      className={cn("flex gap-2 mb-3", isMe ? "flex-row-reverse" : "flex-row")}
    >
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div
        className={cn(
          "flex flex-col max-w-[70%] space-y-1",
          isMe ? "items-end" : "items-start"
        )}
      >
        <Skeleton className="h-3 w-20" />
        <Skeleton
          className={cn(
            "h-10 w-32 rounded-2xl",
            isMe ? "rounded-tr-sm" : "rounded-tl-sm"
          )}
        />
      </div>
    </div>
  );
}
