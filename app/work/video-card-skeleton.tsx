"use client"

import { Dot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function VideoCardSkeleton() {
  return (
    <div className="bg-background/40 drop-shadow-md rounded-md w-90 not-lg:w-75 h-75 not-lg:h-64">
      <Skeleton className="block relative w-full rounded-md aspect-video overflow-hidden bg-muted" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="rounded-2xl w-10 h-10 bg-muted" />
        <div className="flex-1 flex flex-col gap-2 mt-0.5">
          <Skeleton className="w-5/6 h-4 bg-muted" />
          <Skeleton className="w-2/3 h-4 bg-muted" />
          <div className="flex items-center">
            <Skeleton className="w-1/5 h-4 bg-muted" />
            <Dot className="inline-block text-muted" />
            <Skeleton className="w-1/3 h-4 bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
