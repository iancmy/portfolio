"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio, Portfolio } from "@/lib/api";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownZA,
  CalendarArrowDown,
  CalendarArrowUp,
  FunnelPlus,
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
import { useInView } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup } from "@/components/ui/toggle-group";
import SortItem from "./sort-item";

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
  const {
    value: sortInput,
    setValue: setSort,
    debouncedQValue: sort
  } = useDebouncedQState("sort", "date:latest")
  const [filter, setFilter] = useState("")

  const portfQ = useQuery<Portfolio>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
  });

  const query = useMemo(() => {
    setVisibleCount(PAGE_SIZE);
    if (portfQ.isLoading || !portfQ?.data) return new Portfolio();
    let query = portfQ.data

    // search
    if (search) query = query.search(search);

    // filter
    if (filter) {}

    // sort
    if (sort) query = query.search(`[sort:${sort}]`)

    return query;
  }, [portfQ?.data, search, sort]);

  useEffect(() => {
    const totalDataCount = query.count;

    if (visibleCount >= query.count) return setIsLast(true);
    else setIsLast(false);

    if (btmInView) {
      const loadMore = Math.min(PAGE_SIZE, totalDataCount - visibleCount);
      setVisibleCount((v) => v + loadMore);
    }
  }, [query.count, btmInView]);

  const videoFeedData = useMemo(() => {
    return query.head(visibleCount).videos;
  }, [query, visibleCount]);

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              <FunnelPlus size="1.5em" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col gap-2" side="bottom" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Date</DropdownMenuLabel>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
            <ToggleGroup type="single" onValueChange={setSort} value={sortInput}>
              <SortItem value="date:oldest" tooltipHint="Oldest">
                <CalendarArrowDown />
              </SortItem>
              <SortItem value="date:latest" tooltipHint="Latest">
                <CalendarArrowUp />
              </SortItem>
              <SortItem value="title:asc" tooltipHint="A-Z Title">
                <ArrowDownAZ />
              </SortItem>
              <SortItem value="title:desc" tooltipHint="Z-A Title">
                <ArrowDownZA />
              </SortItem>
              <SortItem value="views:desc" tooltipHint="Most Popular">
                <Star />
              </SortItem>
              <SortItem value="views:asc" tooltipHint="Least Popular">
                <StarOff />
              </SortItem>
              <SortItem value="likes:desc" tooltipHint="Most Liked">
                <Heart />
              </SortItem>
              <SortItem value="likes:asc" tooltipHint="Least Liked">
                <HeartOff />
              </SortItem>
            </ToggleGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ButtonGroupText className="text-muted-foreground">
          Found {query.count} videos
        </ButtonGroupText>
      </ButtonGroup>

      <VideoFeed
        feed={videoFeedData}
        loading={!portfQ?.data || portfQ.isLoading}
      />
      <div className="text-sm text-muted-foreground">
        {!isLast && <p ref={btmRef}>Loading more...</p>}
        {isLast && <p ref={btmRef}>Nothing else :(</p>}
      </div>
      <div ref={btmRef} />
    </div>
  );
}
