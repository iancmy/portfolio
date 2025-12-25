import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function RepoSkeleton() {
  return (
    <Skeleton
      className={cn(
        "relative flex flex-col gap-2 bg-muted/40 rounded-md px-4 py-2 hover:shadow-md hover:bg-muted transition-all duration-400 w-1/4 not-lg:w-full h-50 not-lg:h-fit not-lg:min-h-40 outline-1 outline-muted shadow-md",
      )}
    />
  );
}
