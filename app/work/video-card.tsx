"use client";

import { VideoData } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatNumber, parseISODuration } from "@/lib/utils";
import { Dot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface VideoCardProps {
  video: VideoData;
  setSelected: Dispatch<SetStateAction<string[]>>
  selected: string[]
}

export default function VideoCard({video: v, setSelected, selected}: VideoCardProps) {
  const [isSelected, setIsSelected] = useState(selected.some(s => s === v.id));

  useEffect(() => {
    if (isSelected) setSelected((s) => ([...s, v.id]));
    else setSelected((s) => s.filter((id) => id !== v.id));
  }, [isSelected]);

  useEffect(() => {
    setIsSelected(selected.some(s => s === v.id))
  }, [selected])

  return (
    <div
      className={cn(
        "bg-background/40 rounded-md w-90 not-lg:w-75 h-75 not-lg:h-64 p-2 hover:shadow-md hover:bg-secondary/20 transition-all duration-400",
        isSelected && "bg-emerald-600/40",
      )}
    >
      <div className="w-full h-full">
        <Link
          href={`/api/videos/${v.id}`}
          className="block group relative w-full rounded-md aspect-video overflow-hidden"
        >
          <p className="absolute z-10 bottom-2 right-2 text-xs p-1 px-2 bg-black/40 rounded-md">
            {v.duration || parseISODuration("0")}
          </p>
          <Checkbox
            className="absolute z-50 top-2 right-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-400 w-5 h-5 shadow-sm shadow-black/30"
            checked={isSelected}
            onClick={(e) => {
              e.preventDefault();
              setIsSelected((p) => !p);
            }}
          />
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
