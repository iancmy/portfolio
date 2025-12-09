"use client";
import { fetchPortfolio, fetchVideo } from "@/lib/api";
import { VideoData } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import ReactPlayer from "react-player";
import {
  ComponentRef,
  MouseEvent,
  TouchEvent,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn, formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useVideoQueueStore } from "@/lib/store";
import { Portfolio } from "@/lib/portfolio";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { Spinner } from "@/components/ui/spinner";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronsRight,
  Eye,
  Heart,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SquareArrowOutUpRight,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { ButtonGroup } from "@/components/ui/button-group";
import { useVideoPlayerStore } from "./store";

interface VideoProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const CONTROLS_DURATION = 2000;
const DOUBLE_TAP_THRESHOLD = 300;
const HOLD_THRESHOLD = 500;
export default function Video({ params, searchParams }: VideoProps) {
  const queryClient = useQueryClient();

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

    const cachedPortfolio = queryClient.getQueryData<Portfolio>(["portfolio"]);
    const cachedVideo = cachedPortfolio?.videos?.find((v) => v.id === id);
    if (cachedVideo) return cachedVideo.type.includes("short-form");

    return false;
  }, [videoQ.data, queryClient, id]);

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

  const playerRef = useRef<ComponentRef<typeof ReactPlayer>>(null);

  const [duration, setDuration] = useState(0);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  const {
    playing,
    playRate,
    muted,
    volume,
    isFullscreen,
    setPlaying,
    setPlayRate,
    setMuted,
    setVolume,
    setIsFullscreen,
  } = useVideoPlayerStore();

  const [showControls, setShowControls] = useState(true);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [tapControls, setTapControls] = useState(true);
  const [lastTap, setLastTap] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [indicator, setIndicator] = useState<{
    icon: React.ReactNode;
    id: number;
  } | null>(null);

  useEffect(() => {
    if (isMobile) setShowVolumeControl(true);
  }, [isMobile]);

  useEffect(() => {
    if (!indicator) return;
    const timer = setTimeout(() => {
      setIndicator(null);
    }, 400);
    return () => clearTimeout(timer);
  }, [indicator]);

  const triggerIndicator = (icon: React.ReactNode) => {
    setIndicator({ icon, id: Date.now() });
  };

  const handleControlRelease = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (playRate !== 1) {
      setPlayRate(1);
      return;
    }

    // single tap
    if (!isMobile) {
      const newPlayingState = !playing;
      setPlaying((p) => !p);
      triggerIndicator(
        newPlayingState ? (
          <Play className="fill-white text-white size-10" />
        ) : (
          <Pause className="fill-white text-white size-10" />
        ),
      );
    }
    if (!showControls) setShowControls(true);
    if (showControls) setShowControls(false);
  };

  const handleControlTouches = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => {
    if (!e.currentTarget) return;
    if ("button" in e && e.button !== 0) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    setLastTap(now);

    // double tap
    if (timeSinceLastTap < DOUBLE_TAP_THRESHOLD) {
      if (!isMobile) {
        toggleFullscreen();
        return;
      }

      setLastTap(0);

      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

      if (playerRef.current) {
        const currentTarget = e.currentTarget;
        const rect = currentTarget.getBoundingClientRect();

        const clientX =
          "touches" in e && e.touches.length > 0
            ? e.touches[0].clientX
            : "clientX" in e
              ? (e as React.MouseEvent).clientX
              : 0;

        const x = clientX - rect.left;
        const halfWidth = rect.width / 2;
        const currentTime = playerRef.current.currentTime;

        if (x < halfWidth) {
          playerRef.current.currentTime = currentTime - 5;
          triggerIndicator(
            <div className="relative flex flex-col items-center">
              <RotateCcw className="text-white size-8" />
              <span className="text-xs font-bold text-white">-5s</span>
            </div>,
          );
        } else {
          playerRef.current.currentTime = currentTime + 5;
          triggerIndicator(
            <div className="flex flex-col items-center">
              <RotateCw className="text-white size-8" />
              <span className="text-xs font-bold text-white">+5s</span>
            </div>,
          );
        }
      }
      return;
    }

    // hold
    if (!playing) return;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      setPlayRate(2);
    }, HOLD_THRESHOLD);
  };

  useEffect(() => {
    if (!playing || tapControls) {
      setShowControls(true);
      const timer = setTimeout(() => {
        setShowControls(false);
        setTapControls(false);
      }, CONTROLS_DURATION);
      return () => clearTimeout(timer);
    } else {
      setShowControls(false);
      setTapControls(false);
    }
  }, [playing, tapControls]);

  async function toggleFullscreen() {
    if (!scope.current) return;

    const isFullscreenActive = document.fullscreenElement;

    if (!isFullscreenActive) {
      try {
        if (scope.current.requestFullscreen) {
          await scope.current.requestFullscreen();
        } else if ((scope.current as any).webkitRequestFullscreen) {
          await (scope.current as any).webkitRequestFullscreen();
        }

        if (
          isMobile &&
          !isVertical &&
          screen.orientation &&
          screen.orientation.lock
        ) {
          await screen.orientation.lock("landscape").catch((err) => {
            console.log("Orientation lock not supported/allowed:", err);
          });
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    }
  }

  // start up
  useEffect(() => {
    // default playing
    setPlaying(true);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange); // Safari

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

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
            if (isMobile || isFullscreen) return;
            const direction = e.deltaY < 0 ? -1 : 1;
            handleExit(direction);
          }}
          drag={isFullscreen ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.5}
          dragTransition={{
            bounceStiffness: 600,
            bounceDamping: 15,
          }}
          onDragEnd={(_, info) => {
            if (!isMobile || isFullscreen) return;
            const offset = info.offset.y;
            const velocity = info.velocity.y;
            if (offset < -100 || velocity < -500) handleExit(1);
            else if (offset > 100 || velocity > 500) handleExit(-1);
          }}
          className={cn(
            "relative gap-2 rounded-md shadow-md lg:w-full lg:max-w-7/10 aspect-16/9",
            (isVertical || isMobile) && "lg:w-sm aspect-9/16",
            isFullscreen && "rounded-none w-full h-full max-w-none aspect-auto",
          )}
        >
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
            <AnimatePresence>
              {indicator && (
                <motion.div
                  key={indicator.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-black/40 backdrop-blur-sm p-4 rounded-full flex items-center justify-center text-white"
                >
                  {indicator.icon}
                </motion.div>
              )}
              {playRate === 2 && (
                <motion.div
                  key="speed-indicator"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-8 flex flex-col items-center justify-center bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-sm">2x</span>
                    <ChevronsRight className="text-white size-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.div
            animate={{ opacity: showControls ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="size-full absolute z-20 touch-none p-2 mb-4 text-sm font-title bg-[radial-gradient(circle,transparent_10%,#101010_100%)] rounded-md flex flex-col gap-2 justify-end overflow-none"
            onMouseOver={() => !isMobile && setTapControls(true)}
            onMouseMove={() => !isMobile && setTapControls(true)}
            onMouseDown={(e) => !isMobile && handleControlTouches(e)}
            onMouseUp={() => !isMobile && handleControlRelease()}
            onTouchStart={(e) => isMobile && handleControlTouches(e)}
            onTouchEnd={() => isMobile && handleControlRelease()}
          >
            <div
              className={cn(
                "absolute inset-0 -inset-x-12 ml-auto w-12 h-auto z-50 cursor-pointer flex flex-col items-center justify-between self-end gap-4 mb-4",
                isMobile && "inset-2",
              )}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-xs gap-2">
                <Eye className="text-primary" />
                {videoQ.data?.is_yt && videoQ.data.views ? (
                  <span>{formatNumber(videoQ.data.views)}</span>
                ) : (
                  <span>0</span>
                )}
              </div>
              <div className="flex flex-col items-center text-xs gap-2">
                <Heart className="text-red-700 fill-red-700" />
                {videoQ.data?.is_yt && videoQ.data.likes ? (
                  <span>{formatNumber(videoQ.data.likes)}</span>
                ) : (
                  <span>0</span>
                )}
              </div>
              {videoQ.data?.ext_src && (
                <Link
                  href={videoQ.data.ext_src}
                  target="_blank"
                  className="flex flex-col items-center text-xs gap-2"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                >
                  <SquareArrowOutUpRight className="text-muted-foreground" />
                </Link>
              )}
            </div>
            <div
              className="absolute top-4 right-4 cursor-pointer flex items-center justify-center gap-4"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              {isFullscreen ? (
                <Minimize size="1.5em" />
              ) : (
                <Maximize size="1.5em" />
              )}
            </div>
            <div
              className="absolute top-4 left-4 cursor-pointer flex items-center justify-center gap-4"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              {!playing && (
                <Play
                  size="1.5em"
                  className="text-white fill-white"
                  onClick={() => setPlaying(true)}
                />
              )}
              {playing && (
                <Pause
                  size="1.5em"
                  className="text-white fill-white"
                  onClick={() => setPlaying(false)}
                />
              )}
              <ButtonGroup
                className="flex gap-2 items-center"
                onMouseEnter={() => !isMobile && setShowVolumeControl(true)}
                onMouseLeave={() =>
                  !isMobile &&
                  setTimeout(() => setShowVolumeControl(false), 1000)
                }
              >
                {muted || volume === 0 ? (
                  <VolumeX
                    className=""
                    onClick={() => {
                      setMuted(false);
                    }}
                  />
                ) : volume >= 0.8 ? (
                  <Volume2
                    className=""
                    onClick={() => {
                      setMuted(true);
                    }}
                  />
                ) : volume >= 0.3 ? (
                  <Volume1
                    className=""
                    onClick={() => {
                      setMuted(true);
                    }}
                  />
                ) : (
                  <Volume
                    className=""
                    onClick={() => {
                      setMuted(true);
                    }}
                  />
                )}
                <AnimatePresence>
                  {showVolumeControl && (
                    <motion.div
                      key="volume-control"
                      initial={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      exit={{ opacity: 0, translateX: -20 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="min-w-40"
                    >
                      <Slider
                        max={1}
                        step={0.01}
                        value={[muted ? 0 : volume]}
                        className="w-full"
                        onValueChange={(v) => setVolume(v[0])}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </ButtonGroup>
            </div>
            {videoQ.data?.src ? (
              <Link
                href={videoQ.data?.src}
                target="_blank"
                className=""
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                {videoQ.data?.title}
              </Link>
            ) : (
              <p className="">{videoQ.data?.title}</p>
            )}
            <div
              className="flex gap-2 items-center"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <Avatar className="overflow-hidden rounded-full h-full bg-none">
                {videoQ.data?.is_yt && videoQ.data?.channel_src ? (
                  <Link href={videoQ.data.channel_src} target="_blank">
                    <AvatarImage
                      src={videoQ.data.client_avatar}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ) : (
                  <AvatarImage
                    src={videoQ.data?.client_avatar}
                    className="w-full h-full object-cover"
                  />
                )}
                <AvatarFallback>
                  {videoQ.data?.client?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden font-bold">
                {videoQ.data?.is_yt && videoQ.data?.channel_src ? (
                  <Link
                    href={videoQ.data.channel_src}
                    className="block text-muted-foreground text-sm"
                    target="_blank"
                  >
                    {videoQ.data.client}
                  </Link>
                ) : (
                  <p className="block text-muted-foreground text-sm">
                    {videoQ.data?.client}
                  </p>
                )}
              </div>
            </div>
            <Slider
              onClick={(e) => e.stopPropagation()}
              autohide
              value={[currentPlayTime]}
              max={duration}
              className="absolute bottom-0 left-0 w-full cursor-pointer z-50"
              onValueChange={(v) => {
                if (playerRef.current) playerRef.current.currentTime = v[0];
              }}
            />
          </motion.div>
          <div className="size-full overflow-hidden rounded-md relative z-10 pointer-events-none">
            {videoQ.data ? (
              <ReactPlayer
                ref={playerRef}
                src={videoQ.data.src}
                playing={playing}
                playbackRate={playRate}
                muted={muted}
                volume={volume}
                loop
                config={{
                  youtube: {
                    iv_load_policy: 3,
                    rel: 0,
                  },
                }}
                fallback={
                  <Skeleton className="w-full h-full bg-muted flex items-center justify-center">
                    <Spinner className="text-muted-foreground size-6" />
                  </Skeleton>
                }
                className="!w-full !h-full"
                onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                onTimeUpdate={(e) =>
                  setCurrentPlayTime(e.currentTarget.currentTime)
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
      {/* {!!prev() && ( */}
      {/*   <Skeleton className="size-full absolute bottom-full z-50 touch-none p-2 mb-4 text-sm font-title bg-muted rounded-md flex flex-col gap-2 justify-end overflow-none pointer-events-none" /> */}
      {/* )} */}
      {/* {!!next() && ( */}
      {/*   <Skeleton className="size-full absolute top-full z-50 touch-none p-2 mt-4 text-sm font-title bg-muted rounded-md flex flex-col gap-2 justify-end overflow-none pointer-events-none" /> */}
      {/* )} */}
    </div>
  );
}
