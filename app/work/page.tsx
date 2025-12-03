"use client";

import { useQuery } from "@tanstack/react-query";
import { VideoData } from "../types";
import { fetchVideos } from "@/lib/apiCalls";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import Image from "next/image";

export default function Work() {
  const videosQuery = useQuery<VideoData[]>({
    queryKey: ["videos"],
    queryFn: () => fetchVideos(),
    initialData: [],
  });

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4 p-4">
      <ItemGroup className="w-full flex gap-4 max-w-7xl">
        {!videosQuery.isLoading &&
          !videosQuery.isError &&
          videosQuery.data.map((video, i) => {
            return (
              <Item key={video.id} className="shadow-lg border rounded-lg h-56">
                <ItemMedia className={"h-full aspect-video"}>
                  {video.yt_thumb ? (
                    <Image
                      fill={true}
                      alt={`alt-${video.id}`}
                      src={video.yt_thumb}
                      className={"object-cover"}
                    />
                  ) : (
                    <div>No thumbnail</div>
                  )}
                </ItemMedia>
                <ItemHeader>
                  <ItemTitle>{video.title || video.yt_title}</ItemTitle>
                </ItemHeader>
                <ItemContent>
                  <ItemDescription>{video.description}</ItemDescription>
                </ItemContent>
                <ItemFooter className="text-sm text-gray-500">
                  Video ID: {video.id}
                </ItemFooter>
              </Item>
            );
          })}
      </ItemGroup>
    </div>
  );
}
