import { cn } from "@/utils/cn";

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
        className
      )}
    >
      <div className="aspect-[4/3] w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
      <div className="flex flex-1 flex-col p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-3 h-6 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="p-4 pt-0">
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
