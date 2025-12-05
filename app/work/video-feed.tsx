import { VideoData } from "@/lib/types";
import VideoCard from "./video-card";
import VideoCardSkeleton from "./video-card-skeleton";
import { memo } from "react";

interface VideoFeedProps {
  feed: VideoData[];
  loading: boolean;
}

const PAGE_SIZE = 20;
const VideoFeed = memo(({ feed, loading }: VideoFeedProps) => {
  return (
    <div className="flex flex-wrap items-center justify-around gap-4">
      {!loading
        ? feed.map((v) => {
            return <VideoCard key={`key-${v.id}`} video={v} />;
          })
        : Array(PAGE_SIZE)
            .fill(null)
            .map((_, i) => {
              return <VideoCardSkeleton key={`skeleton-video-${i}`} />;
            })}
    </div>
  );
})

export default VideoFeed
