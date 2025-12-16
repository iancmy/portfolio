"use client";
import {
  arrayEq,
  cn,
  formatNumber,
  toKebabCase,
  toTitleCase,
} from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio } from "@/lib/api";
import { Portfolio } from "@/lib/portfolio";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownZA,
  Calendar,
  CalendarArrowDown,
  CalendarArrowUp,
  CheckCheck,
  CircleQuestionMark,
  Copy,
  Eye,
  Funnel,
  FunnelX,
  Heart,
  HeartOff,
  Search,
  SearchCheck,
  SearchIcon,
  Settings2,
  Star,
  StarOff,
  X,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup } from "@/components/ui/toggle-group";
import SortItem from "./sort-item";
import { useQueryState, parseAsString } from "nuqs";
import { useVideoFilters } from "@/lib/hooks/useVideoFilters";
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
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import YoutubeIcon from "@/components/icons/youtube";
import { useVideoQueueStore } from "@/lib/store";

const PAGE_SIZE = 12;
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
  const [prevSort, setPrevSort] = useState<string | null>(null);
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("views:desc"),
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
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, sort, filter]);

  useEffect(() => {
    if (search && !prevSort) {
      setPrevSort(sort);
      setSort("relevant");
    } else if (!search && prevSort) {
      if (sort === "relevant") setSort(prevSort);
      setPrevSort(null);
    }
  }, [search, sort, prevSort]);

  const query = useMemo(() => {
    if (portfQ.isLoading || !portfQ?.data) return new Portfolio();
    let query = portfQ.data;

    // search
    if (search) query = query.search(search);

    // filter
    if (filter.yt_only) query = query.yt;
    if (filter.roles.length)
      query = query.filter.roles(...(filter.roles as VideoRoles[]));
    if (filter.types.length)
      query = query.filter.types(...(filter.types as VideoTypes[]));
    if (filter.categories.length)
      query = query.filter.categories(
        ...(filter.categories as VideoCategories[]),
      );
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
    if (sort === "relevant") return query;
    if (sort) query = query.search(`[sort:${sort}]`);

    return query;
  }, [portfQ?.data, portfQ.isLoading, search, sort, filter]);

  const setQueue = useVideoQueueStore((state) => state.setQueue);
  useEffect(() => {
    if (query.videos && query.count > 0)
      setQueue(query.videos.map((v) => v.id));
  }, [query.videos, query.count, setQueue]);

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
  const [showSortMenu, setShowSortMenu] = useState(false);
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
      if (target.closest("#filter-panel-toggle")) return;
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

  const dateFilterEq = useMemo(
    () => arrayEq(filter.date, defaultFilters.date),
    [filter.date, defaultFilters.date],
  );
  const viewsFilterEq = useMemo(
    () => arrayEq(filter.views, defaultFilters.views),
    [filter.views, defaultFilters.views],
  );
  const likesFilterEq = useMemo(
    () => arrayEq(filter.likes, defaultFilters.likes),
    [filter.likes, defaultFilters.likes],
  );

  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-12 px-4">
      <ButtonGroup className="flex w-full text-sm px-4">
        <InputGroup className="rounded-lg 2xl:max-w-3/10 lg:max-w-1/2 max-w-full">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search..."
            value={searchInput}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            className="text-sm"
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
        <DropdownMenu open={showSortMenu} onOpenChange={setShowSortMenu}>
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
              onValueChange={(v) => v && setSort(v)}
              value={sort}
              orientation="vertical"
              className="items-start"
            >
              <SortItem value="relevant" label="Most Relevant">
                <SearchCheck />
              </SortItem>
              <SortItem value="date:oldest" label="Oldest">
                <CalendarArrowDown />
              </SortItem>
              <SortItem value="date:latest" label="Latest">
                <CalendarArrowUp />
              </SortItem>
              <SortItem value="title:asc" label="Title A-Z">
                <ArrowDownAZ />
              </SortItem>
              <SortItem value="title:desc" label="Title Z-A">
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
        <AnimatePresence>
          {selected.length && (
            <motion.div
              key="selected-hint"
              initial={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={cn(
                "self-start p-2 rounded-md bg-muted/40 whitespace-nowrap text-muted-foreground text-sm flex gap-2 items-center",
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.span
                    className="flex gap-2 items-center cursor-pointer text-muted-foreground"
                    onClick={() => {
                      setFilter((f) => ({ ids: [...f.ids, ...selected] }));
                      setSelected([]);
                    }}
                    animate={{ y: [-1, 0, -3, 0, -1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {selected.length}
                    <CheckCheck size="1em" />
                  </motion.span>
                </TooltipTrigger>
                <TooltipContent>Add as Filter</TooltipContent>
              </Tooltip>
              <span
                className="text-red-400 cursor-pointer"
                onClick={() => setSelected([])}
              >
                <X size="1.2em" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </ButtonGroup>
      <div className="flex flex-wrap gap-1 px-8 -mt-8 items-end self-start">
        <span className="font-title text-md text-muted-foreground">
          Sort by:
        </span>
        <Badge
          className={cn(
            "bg-primary/40 text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
          )}
          onClick={() => setShowSortMenu(true)}
        >
          {sort === "date:oldest" ? (
            <CalendarArrowDown />
          ) : sort === "date:latest" ? (
            <CalendarArrowUp />
          ) : sort === "title:asc" ? (
            <ArrowDownAZ />
          ) : sort === "title:desc" ? (
            <ArrowDownZA />
          ) : sort === "views:desc" ? (
            <Star />
          ) : sort === "views:asc" ? (
            <StarOff />
          ) : sort === "likes:desc" ? (
            <Heart />
          ) : sort === "likes:asc" ? (
            <HeartOff />
          ) : (
            <SearchCheck />
          )}

          {sort === "date:oldest"
            ? "Oldest"
            : sort === "date:latest"
              ? "Latest"
              : sort === "title:asc"
                ? "Title A-Z"
                : sort === "title:desc"
                  ? "Title Z-A"
                  : sort === "views:desc"
                    ? "Most Popular"
                    : sort === "views:asc"
                      ? "Least Popular"
                      : sort === "likes:desc"
                        ? "Most Liked"
                        : sort === "likes:asc"
                          ? "Least Liked"
                          : "Most Relevant"}
          <Settings2 />
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1 px-8 -my-8 items-end self-start">
        <span className="font-title text-md text-muted-foreground">
          Filters:
        </span>
        {dateFilterEq &&
        viewsFilterEq &&
        likesFilterEq &&
        filter.roles.length < 1 &&
        filter.types.length < 1 &&
        filter.categories.length < 1 &&
        filter.ids.length < 1 &&
        !filter.yt_only ? (
          <span className="font-title text-md text-muted-foreground/50">
            None
          </span>
        ) : (
          <Badge
            className={cn(
              "bg-red-400/40 text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
            )}
            onClick={() =>
              setFilter({
                roles: [],
                types: [],
                categories: [],
                ids: [],
                yt_only: false,
                ...defaultFilters,
              })
            }
          >
            <FunnelX />
            Clear All
            <X />
          </Badge>
        )}
        {filter.yt_only && (
          <Badge
            className={cn(
              "bg-muted text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
            )}
            onClick={() => setFilter({ yt_only: false })}
          >
            <YoutubeIcon />
            Youtube Only
            <X className="text-red-400" />
          </Badge>
        )}
        {!dateFilterEq && (
          <Badge
            className={cn(
              "bg-muted text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
            )}
            onClick={() => setFilter({ date: defaultFilters.date })}
          >
            <Calendar />
            {new Date(filter.date[0]).toLocaleDateString()} -{" "}
            {new Date(filter.date[1]).toLocaleDateString()}
            <X className="text-red-400" />
          </Badge>
        )}
        {!viewsFilterEq && (
          <Badge
            className={cn(
              "bg-muted text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
            )}
            onClick={() => setFilter({ views: defaultFilters.views })}
          >
            <Eye />
            {formatNumber(filter.views[0])} - {formatNumber(filter.views[1])}
            <X className="text-red-400" />
          </Badge>
        )}
        {!likesFilterEq && (
          <Badge
            className={cn(
              "bg-muted text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
            )}
            onClick={() => setFilter({ likes: defaultFilters.likes })}
          >
            <Eye />
            {formatNumber(filter.likes[0])} - {formatNumber(filter.likes[1])}
            <X className="text-red-400" />
          </Badge>
        )}
        {filter.roles.map((role, i) => {
          return (
            <Badge
              key={`roles-filter-badge-${role}-${i}`}
              className={cn(
                "bg-muted text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
              )}
              onClick={() =>
                setFilter((f) => ({ roles: f.roles.filter((r) => r !== role) }))
              }
            >
              role: {role}
              <X className="text-red-400" />
            </Badge>
          );
        })}
        {filter.types.map((type, i) => {
          return (
            <Badge
              key={`types-filter-badge-${type}-${i}`}
              className={cn(
                "bg-muted text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
              )}
              onClick={() =>
                setFilter((f) => ({ types: f.types.filter((t) => t !== type) }))
              }
            >
              type: {type}
              <X className="text-red-400" />
            </Badge>
          );
        })}
        {filter.categories.map((category, i) => {
          return (
            <Badge
              key={`categories-filter-badge-${category}-${i}`}
              className={cn(
                "bg-muted text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
              )}
              onClick={() =>
                setFilter((f) => ({
                  categories: f.categories.filter((c) => c !== category),
                }))
              }
            >
              category: {category}
              <X className="text-red-400" />
            </Badge>
          );
        })}
        {filter.ids.map((id, i) => {
          return (
            <Badge
              key={`ids-filter-badge-${id}-${i}`}
              className={cn(
                "bg-muted text-foreground/80 font-bold flex gap-2 items-center cursor-pointer",
              )}
              onClick={() =>
                setFilter((f) => ({ ids: f.ids.filter((fid) => fid !== id) }))
              }
            >
              id: {id}
              <X className="text-red-400" />
            </Badge>
          );
        })}
      </div>
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
              "flex flex-col gap-2 self-center xl:self-start mx-4 -mb-8 p-4 rounded-md bg-muted/30 w-3/4 overflow-hidden",
            )}
          >
            <div className="text-xl font-title font-bold flex w-full items-center justify-between">
              <span>Filter by</span>
              <X
                size="1em"
                className="text-red-400 self-start cursor-pointer"
                onClick={() => setShowFilterPanel(false)}
              />
            </div>
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
                      {portfQ.data &&
                        portfQ.data?.categories.map((c) => (
                          <MultiSelectItem
                            key={`category-${toKebabCase(c)}`}
                            value={c}
                          >
                            {toTitleCase(c)}
                          </MultiSelectItem>
                        ))}
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
                      {portfQ.data &&
                        portfQ.data?.roles.map((r) => (
                          <MultiSelectItem
                            key={`role-${toKebabCase(r)}`}
                            value={r}
                          >
                            {toTitleCase(r)}
                          </MultiSelectItem>
                        ))}
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
                      {portfQ.data &&
                        portfQ.data?.types.map((t) => (
                          <MultiSelectItem
                            key={`type-${toKebabCase(t)}`}
                            value={t}
                          >
                            {toTitleCase(t)}
                          </MultiSelectItem>
                        ))}
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
            <div className="flex mt-4 xl:mr-4 xl:self-end xl:w-2xs gap-4">
              <Toggle
                aria-label="Toggle bookmark"
                variant="outline"
                className="text-muted-foreground data-[state=on]:text-foreground data-[state=on]:bg-red-500 cursor-pointer duration-400"
                pressed={filter.yt_only}
                onClick={() => setFilter((p) => ({ yt_only: !p.yt_only }))}
              >
                <YoutubeIcon />
                Show Youtube Only
              </Toggle>
              <Button
                variant="destructive"
                className="font-title font-bold cursor-pointer"
                onClick={() => {
                  setFilter({
                    roles: [],
                    types: [],
                    categories: [],
                    ids: [],
                    ...defaultFilters,
                  });
                }}
              >
                Clear All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <VideoFeed
        feed={videoFeedData}
        loading={!portfQ?.data || portfQ.isLoading}
        setSelected={setSelected}
        selected={selected}
      />
      <div className="text-sm text-muted-foreground">
        {!isLast && <p>Loading more...</p>}
        {isLast && <p>Nothing else :(</p>}
      </div>
      <div ref={btmRef} />
    </div>
  );
}
