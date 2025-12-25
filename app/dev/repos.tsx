"use client";
import RepoSkeleton from "./repo-skeleton";
import { useRepositories } from "./queries";
import RepoCard from "./repo-card";

export default function Repos() {
  const { data, isLoading: loading } = useRepositories();

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 w-4xl not-lg:w-full">
      {!loading && !!data
        ? data.repos.map((r, i) => {
            return <RepoCard key={`key-${i}-${r.name}`} data={r} />;
          })
        : Array(12)
            .fill(null)
            .map((_, i) => {
              return <RepoSkeleton key={`skeleton-video-${i}`} />;
            })}
    </div>
  );
}
