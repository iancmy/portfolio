"use client";
import { fetchPortfolio, fetchVideo } from "@/lib/api";
import { VideoData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

import ReactPlayer from "react-player";
import { use, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useVideoQueueStore } from "@/lib/store";
import { Portfolio } from "@/lib/portfolio";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { Spinner } from "@/components/ui/spinner";

interface VideoProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default function Video({ params, searchParams }: VideoProps) {
  const { id } = use(params);
  const { viewport } = use(searchParams);
  const router = useRouter();
  const isMobile = viewport !== "desktop";

  const { queue, setCurrent, setQueue, prev, next, history, peekHistory } =
    useVideoQueueStore();
  const defaultQueueQuery = useQuery<Portfolio, Error, string[]>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    select: (p) => p.sort.views.desc().videos.map((v) => v.id),
  });

  const defaultQueue = useMemo(() => {
    if (defaultQueueQuery.data && defaultQueueQuery.data.length > 1)
      return defaultQueueQuery.data;
    return [];
  }, [defaultQueueQuery.data]);

  useEffect(() => {
    if (queue.length < 1 && defaultQueue.length > 0) setQueue(defaultQueue);
  }, [defaultQueue, queue.length, setQueue, id]);

  useEffect(() => {
    if (queue && id) setCurrent(id);
  }, [queue, id, setCurrent]);

  const videoQ = useQuery<VideoData>({
    queryKey: ["video", id],
    queryFn: () => fetchVideo(id),
  });

  const isVertical = useMemo(() => {
    if (videoQ.data) return videoQ.data.type.includes("short-form");
  }, [videoQ.data]);

  const [scope, animate] = useAnimate();
  const initialAnimation = useMemo(() => {
    const lastId = peekHistory();
    if (history.length === 0 || !lastId) return { y: 0, opacity: 0 };

    const currentIndex = queue.indexOf(id);
    const lastIndex = queue.indexOf(lastId);
    const direction = currentIndex >= lastIndex ? 1 : -1;
    return {
      y: direction * 500,
      opacity: 0,
    };
  }, [id, queue, peekHistory, history.length]);

  const handleExit = async (direction: number) => {
    const newId = direction < 0 ? prev() : next();
    if (!newId) {
      await animate(
        scope.current,
        {
          y: [0, -direction * 50, 0, -direction * 50, 0],
        },
        { duration: 1, ease: "easeInOut" },
      );
      return;
    }

    await animate(
      scope.current,
      { y: -direction * 500, opacity: 0 },
      { type: "spring", duration: 0.4, ease: "linear" },
    );

    router.replace(`/work/${newId}`);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-12 px-4 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={id}
          ref={scope}
          initial={initialAnimation}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          onWheel={(e) => {
            const direction = e.deltaY < 0 ? -1 : 1;
            handleExit(direction);
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.5}
          dragTransition={{
            bounceStiffness: 600,
            bounceDamping: 15,
          }}
          onDragEnd={(_, info) => {
            const offset = info.offset.y;
            const velocity = info.velocity.y;
            if (offset < -100 || velocity < -500) handleExit(1);
            else if (offset > 100 || velocity > 500) handleExit(-1);
          }}
          className={cn(
            "relative rounded-md shadow-md lg:w-full lg:max-w-7/10 aspect-16/9",
            (isVertical || isMobile) && "lg:w-sm aspect-9/16",
          )}
        >
          <div className="absolute -inset-12 z-20 cursor-pointer touch-none"></div>
          <div className="size-full overflow-hidden rounded-md relative z-10 pointer-events-none">
            {videoQ.data ? (
              <ReactPlayer
                src={videoQ.data.src}
                playing={true}
                muted
                loop
                config={{
                  youtube: {
                    iv_load_policy: 3,
                    rel: 0,
                  },
                }}
                className="!w-full !h-full"
                fallback={
                  <Skeleton className="w-full h-full bg-muted flex items-center justify-center">
                    <Spinner className="text-muted-foreground size-6" />
                  </Skeleton>
                }
              />
            ) : (
              <Skeleton className="w-full h-full bg-muted flex items-center justify-center">
                <Spinner className="text-muted-foreground size-6" />
              </Skeleton>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
