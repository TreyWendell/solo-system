import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#0d1528] border border-[#1e2d4a]/50",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
