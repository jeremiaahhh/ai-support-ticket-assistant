import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[length:200%_100%] [background-image:linear-gradient(90deg,hsl(var(--muted))_0%,hsl(var(--muted)/0.5)_50%,hsl(var(--muted))_100%)]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
