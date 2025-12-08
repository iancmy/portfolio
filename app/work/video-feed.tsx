import { VideoData } from "@/lib/types";
import VideoCard from "./video-card";
import VideoCardSkeleton from "./video-card-skeleton";
import { Dispatch, memo, SetStateAction, useEffect } from "react";
import { useVideoQueueStore } from "@/lib/store";

interface VideoFeedProps {
  feed: VideoData[];
  loading: boolean;
  setSelected: Dispatch<SetStateAction<string[]>>;
  selected: string[];
}

const PAGE_SIZE = 20;
const VideoFeed = memo(
  ({ feed, loading, setSelected, selected }: VideoFeedProps) => {
    const setQueue = useVideoQueueStore((state) => state.setQueue);

    useEffect(() => {
      if (feed && feed.length > 0) {
        setQueue(feed.map((v) => v.id));
      }
    }, [feed, setQueue]);

    return (
      <div className="flex flex-wrap items-center justify-around gap-4">
        {!loading
          ? feed.map((v, i) => {
              return (
                <VideoCard
                  key={`key-${v.id}`}
                  video={v}
                  setSelected={setSelected}
                  selected={selected}
                />
              );
            })
          : Array(PAGE_SIZE)
              .fill(null)
              .map((_, i) => {
                return <VideoCardSkeleton key={`skeleton-video-${i}`} />;
              })}
      </div>
    );
  },
);

export default VideoFeed;
