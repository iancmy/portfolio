"use client";

import { VideoData } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber, parseISODuration } from "@/lib/utils";
import { Dot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VideoCardProps {
  video: VideoData;
}

export default function VideoCard(props: VideoCardProps) {
  const v = props.video;

  return (
    <div className="bg-background/40 rounded-md w-90 not-lg:w-75 h-75 not-lg:h-64 p-2 hover:shadow-md hover:bg-secondary/20 transition-all duration-500">
      <div className="w-full h-full">
        <Link
          href={`/api/videos/${v.id}`}
          className="block relative w-full rounded-md aspect-video overflow-hidden"
        >
          <p className="absolute z-10 bottom-2 right-2 text-xs p-1 px-2 bg-black/40 rounded-md">{v.duration || parseISODuration("0")}</p>
          <Image
            alt={`alt-${v.id}`}
            src={v.thumbnail}
            fill
            className="object-cover"
            sizes="aspect-ratio: var(--aspect-video)"
            loading="eager"
          />
        </Link>
        <div className="flex gap-2 p-2">
          <Avatar className="overflow-hidden rounded-2xl w-1/10 h-1/10 shrink-0">
            <AvatarImage
              src={v.client_avatar}
              className="w-full h-full object-cover"
            />
            <AvatarFallback>{v.client?.[0]}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-title font-bold truncate">{v.title}</p>
            <p className="text-muted-foreground text-sm">{v.client}</p>
            <p className="text-muted-foreground text-sm">
              {v.is_yt ? (
                <span>{formatNumber(v.views)} views</span>
              ) : (
                <span>Not published</span>
              )}
              <Dot className="inline-block" />
              <span>{formatDistanceToNow(v.date, { addSuffix: true })}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
