"use client";
import { cn, formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio } from "@/lib/api";
import { Portfolio } from "@/lib/portfolio";
import {
  Activity,
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownZA,
  CalendarArrowDown,
  CalendarArrowUp,
  CheckCheck,
  Copy,
  Funnel,
  FunnelPlus,
  FunnelX,
  Heart,
  HeartOff,
  SearchIcon,
  Star,
  StarOff,
} from "lucide-react";
import VideoFeed from "./video-feed";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import useDebouncedQState from "@/lib/hooks/useDebouncedQState";
import { AnimatePresence, useInView } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SortItem from "./sort-item";
import { useQueryState, parseAsString } from "nuqs";
import { FilterDefaults, useVideoFilters } from "@/lib/hooks/useVideoFilters";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "motion/react";
import { Slider } from "@/components/ui/slider";
import { VideoCategories, VideoRoles, VideoTypes } from "@/lib/types";

const PAGE_SIZE = 20;
export default function Work() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLast, setIsLast] = useState(false);

  const btmRef = useRef(null);
  const btmInView = useInView(btmRef, { amount: 0.5 });

  const {
    value: searchInput,
    setValue: setSearch,
    debouncedQValue: search,
  } = useDebouncedQState("q", "");
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("date:latest"),
  );

  const portfQ = useQuery<Portfolio>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
  });
  const dummyPortf = new Portfolio();

  const maxViews = useMemo(
    () => portfQ.data?.max.views || dummyPortf.max.views,
    [portfQ.data?.max.views],
  );
  const maxLikes = useMemo(
    () => portfQ.data?.max.likes || dummyPortf.max.likes,
    [portfQ.data?.max.likes],
  );
  const minDate = useMemo(
    () => portfQ.data?.min.date.getTime() || dummyPortf.min.date.getTime(),
    [portfQ.data?.min.date.getTime()],
  );
  const maxDate = useMemo(() => Date.now(), []);

  const defaultFilters = useMemo(
    () => ({
      views: [0, maxViews ?? 200_000_000],
      likes: [0, maxLikes ?? 20_000_000],
      date: [minDate || new Date("1/1/2010").getTime(), maxDate || Date.now()],
    }),
    [maxViews, maxLikes, minDate, maxDate],
  );

  const [filter, setFilter] = useVideoFilters(defaultFilters);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, sort, filter]);

  const query = useMemo(() => {
    if (portfQ.isLoading || !portfQ?.data) return new Portfolio();
    let query = portfQ.data;

    // search
    if (search) query = query.search(search);

    // filter
    if (filter.roles.length) query = query.filter.roles(...filter.roles as VideoRoles[])
    if (filter.types.length) query = query.filter.types(...filter.types as VideoTypes[])
    if (filter.categories.length) query = query.filter.categories(...filter.categories as VideoCategories[])
    if (filter.ids.length) query = query.filter.id(...filter.ids);
    if (filter.date.length)
      query = query.filter.date(
        `${new Date(filter.date[0])}..${new Date(filter.date[1])}`,
      );
    if (filter.views.length)
      query = query.filter.views(`${filter.views[0]}..${filter.views[1]}`);
    if (filter.likes.length)
      query = query.filter.likes(`${filter.likes[0]}..${filter.likes[1]}`);

    // sort
    if (sort) query = query.search(`[sort:${sort}]`);

    return query;
  }, [portfQ?.data, portfQ.isLoading, search, sort, filter]);

  useEffect(() => {
    if (visibleCount >= query.count) setIsLast(true);
    else setIsLast(false);
  }, [visibleCount, query.count]);

  useEffect(() => {
    if (btmInView) {
      setVisibleCount((prev) => {
        if (prev >= query.count) return prev;
        return Math.min(prev + PAGE_SIZE, query.count);
      });
    }
  }, [btmInView, query.count]);

  const videoFeedData = useMemo(() => {
    return query.head(visibleCount).videos;
  }, [query, visibleCount]);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showQueryCopied, setShowQueryCopied] = useState(false);

  async function copyQuery() {
    setShowQueryCopied(true);
    const currentUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(currentUrl);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }

    setTimeout(() => {
      setShowQueryCopied(false);
    }, 1500);
  }

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('#filter-panel-toggle')) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (target.closest('[data-slot="command-list"]')) return;
      if (target.nodeName === "HTML") return;
      setShowFilterPanel(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowFilterPanel]);

  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-12 px-4">
      <ButtonGroup className="flex w-full text-sm px-4">
        <InputGroup className="rounded-lg w-full 2xl:max-w-3/10 lg:max-w-1/2 max-w-full">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search..."
            value={searchInput}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </InputGroup>
        <Button
          id="filter-panel-toggle"
          variant="outline"
          className="cursor-pointer"
          onClick={() => setShowFilterPanel((p) => !p)}
          data-filter=""
        >
          {showFilterPanel ? (
            <FunnelX size="1.5em" className="text-red-400" />
          ) : (
            <Funnel size="1.5em" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              <ArrowDownNarrowWide size="1.5em" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="flex gap-2 items-center"
            side="bottom"
            align="start"
          >
            <ToggleGroup
              type="single"
              onValueChange={setSort}
              value={sort}
              orientation="vertical"
              className="items-start"
            >
              <SortItem value="date:oldest" label="Oldest">
                <CalendarArrowDown />
              </SortItem>
              <SortItem value="date:latest" label="Latest">
                <CalendarArrowUp />
              </SortItem>
              <SortItem value="title:asc" label="A-Z Title">
                <ArrowDownAZ />
              </SortItem>
              <SortItem value="title:desc" label="Z-A Title">
                <ArrowDownZA />
              </SortItem>
              <SortItem value="views:desc" label="Most Popular">
                <Star />
              </SortItem>
              <SortItem value="views:asc" label="Least Popular">
                <StarOff />
              </SortItem>
              <SortItem value="likes:desc" label="Most Liked">
                <Heart />
              </SortItem>
              <SortItem value="likes:asc" label="Least Liked">
                <HeartOff />
              </SortItem>
            </ToggleGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ButtonGroupText className="text-muted-foreground truncate">
          Found {query.count} videos
        </ButtonGroupText>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={copyQuery}
        >
          <div className="flex gap-2">
            {showQueryCopied ? (
              <Tooltip defaultOpen open={showQueryCopied}>
                <TooltipTrigger asChild>
                  <CheckCheck size="1.5em" />
                </TooltipTrigger>
                <TooltipContent>Copied</TooltipContent>
              </Tooltip>
            ) : (
              <Copy size="1.5em" />
            )}
          </div>
        </Button>
      </ButtonGroup>
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            key="filter-panel"
            ref={panelRef}
            initial={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "flex flex-col gap-2 self-center xl:self-start mx-4 -my-8 p-4 rounded-md bg-muted/30 w-3/4 overflow-hidden",
            )}
          >
            <p className="text-xl font-title font-bold">Filter by</p>
            <div className="self-start h-full w-full grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto overflow-x-hidden mx-4 pr-8">
              <div className="flex flex-col gap-2 items-start">
                <p className="font-title text-md font-semibold">Categories</p>
                <MultiSelect
                  onValuesChange={(v) => setFilter({ categories: v })}
                  values={filter.categories}
                >
                  <MultiSelectTrigger className="w-full min-w-xs max-w-full text-xs">
                    <MultiSelectValue placeholder="Filter categories..." />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      <MultiSelectItem value="gameplay">
                        Gameplay
                      </MultiSelectItem>
                      <MultiSelectItem value="event">Event</MultiSelectItem>
                      <MultiSelectItem value="teaser">Teaser</MultiSelectItem>
                      <MultiSelectItem value="vlog">Vlog</MultiSelectItem>
                      <MultiSelectItem value="irl_content">
                        IRL Content
                      </MultiSelectItem>
                      <MultiSelectItem value="short_film">
                        Short Film
                      </MultiSelectItem>
                      <MultiSelectItem value="music_video">
                        Music Video
                      </MultiSelectItem>
                      <MultiSelectItem value="promotional">
                        Promotional
                      </MultiSelectItem>
                      <MultiSelectItem value="compilation">
                        Compilation
                      </MultiSelectItem>
                      <MultiSelectItem value="other">Other</MultiSelectItem>
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="font-title text-md font-semibold">Roles</p>
                <MultiSelect
                  onValuesChange={(v) => setFilter({ roles: v })}
                  values={filter.roles}
                >
                  <MultiSelectTrigger className="w-full min-w-xs max-w-full text-xs">
                    <MultiSelectValue placeholder="Filter roles..." />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      <MultiSelectItem value="video_editor">
                        Video Editor
                      </MultiSelectItem>
                      <MultiSelectItem value="camera">Camera</MultiSelectItem>
                      <MultiSelectItem value="director">
                        Director
                      </MultiSelectItem>
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="font-title text-md font-semibold">Types</p>
                <MultiSelect
                  onValuesChange={(v) => setFilter({ types: v })}
                  values={filter.types}
                >
                  <MultiSelectTrigger className="w-full min-w-xs max-w-full text-xs">
                    <MultiSelectValue placeholder="Filter video types..." />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      <MultiSelectItem value="long-form">
                        Long-form
                      </MultiSelectItem>
                      <MultiSelectItem value="short-form">
                        Short-form
                      </MultiSelectItem>
                      <MultiSelectItem value="partial">
                        Partial Edit
                      </MultiSelectItem>
                      <MultiSelectItem value="cut">Cut Only</MultiSelectItem>
                      <MultiSelectItem value="subtitles">
                        Subtitles Only
                      </MultiSelectItem>
                      <MultiSelectItem value="unpublished">
                        Unpublished
                      </MultiSelectItem>
                      <MultiSelectItem value="hidden">Hidden</MultiSelectItem>
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="font-title text-md font-semibold">Date</p>
                <Slider
                  min={minDate}
                  max={maxDate}
                  onValueChange={(v) => setFilter({ date: v })}
                  value={filter.date}
                />
                <p className="flex items-center justify-between gap-4 w-full text-xs font-bold text-muted-foreground">
                  <span>{new Date(filter.date[0]).toLocaleDateString()}</span>
                  <span>{new Date(filter.date[1]).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="font-title text-md font-semibold">Views</p>
                <Slider
                  min={0}
                  max={maxViews}
                  onValueChange={(v) => setFilter({ views: v })}
                  value={filter.views}
                />
                <p className="flex items-center justify-between gap-4 w-full text-xs font-bold text-muted-foreground">
                  <span>{formatNumber(filter.views[0])}</span>
                  <span>{formatNumber(filter.views[1])}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="font-title text-md font-semibold">Likes</p>
                <Slider
                  min={0}
                  max={maxLikes}
                  onValueChange={(v) => setFilter({ likes: v })}
                  value={filter.likes}
                />
                <p className="flex items-center justify-between gap-4 w-full text-xs font-bold text-muted-foreground">
                  <span>{formatNumber(filter.likes[0])}</span>
                  <span>{formatNumber(filter.likes[1])}</span>
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="font-title font-bold cursor-pointer mt-4 xl:mr-4 xl:self-end xl:w-2xs"
              onClick={() =>
                setFilter({
                  roles: [],
                  types: [],
                  categories: [],
                  ids: [],
                  ...defaultFilters,
                })
              }
            >
              Clear All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <VideoFeed
        feed={videoFeedData}
        loading={!portfQ?.data || portfQ.isLoading}
      />
      <div className="text-sm text-muted-foreground">
        {!isLast && <p>Loading more...</p>}
        {isLast && <p>Nothing else :(</p>}
      </div>
      <div ref={btmRef} />
    </div>
  );
}
