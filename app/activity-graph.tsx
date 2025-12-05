"use client";

import {
  Activity,
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
} from "@/components/kibo-ui/contribution-graph";
import { fetchPortfolio, Portfolio } from "@/lib/api";
import { videoDataToActivity } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { formatISO, sub } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const placeholderData: Activity[] = [
  {
    date: formatISO(new Date(new Date().getFullYear(), 0, 1), {
      representation: "date",
    }),
    count: 0,
    level: 0,
  },
  {
    date: formatISO(new Date(), { representation: "date" }),
    count: 0,
    level: 0,
  },
];

export default function ActivityGraph() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [contribs, setContribs] = useState<Activity[]>(placeholderData);
  const portQ = useQuery<Portfolio>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
    staleTime: 0,
  });

  const startYear =
    portQ.data.sort.date.oldest().videos[0]?.date.getFullYear() ??
    new Date().getFullYear();
  const endYear =
    portQ.data.sort.date.latest().videos[0]?.date.getFullYear() ??
    new Date().getFullYear();

  const showYear = (value: string) => {
    setYear(parseInt(value));
  };

  useEffect(() => {
    if (portQ.data.videos.length > 0) {
      let startDate = new Date(year, 0, 1)
      let endDate = new Date(year, 11, 31)

      if (new Date().getFullYear() === year) {
        endDate = new Date()
        startDate = sub(endDate, {years: 1})
      }

      const padding = [
        {
          date: formatISO(startDate, {
            representation: "date",
          }),
          count: 0,
          level: 0,
        },
        {
          date: formatISO(endDate, { representation: "date" }),
          count: 0,
          level: 0,
        },
      ] as Activity[];

      const videos = portQ.data.filter.date(`${startDate}..${endDate}`).videos;
      const newContribs = [...padding, ...videoDataToActivity(videos)];
      setContribs(newContribs);
    }
  }, [year, portQ.data]);

  return (
    <div className="flex flex-col gap-4 items-center justify-around">
      <Select defaultValue={`${year}`} onValueChange={showYear}>
        <SelectTrigger className="w-1/5 self-end">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {[...new Array(endYear + 1 - startYear)]
            .map((_, index) => endYear - index)
            .map((year, index) => {
              return (
                <SelectItem key={`item-${year}`} value={`${year}`}>
                  {index === 0 ? "Present" : year}
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
      <ContributionGraph data={contribs} className="max-w-4xl not-lg:max-w-xs">
        <ContributionGraphCalendar>
          {({ activity, dayIndex, weekIndex }) => (
            <ContributionGraphBlock
              activity={activity}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
              className='data-[level="0"]:fill-primary/20 data-[level="1"]:fill-primary/40 data-[level="2"]:fill-primary/60 data-[level="3"]:fill-primary/85 data-[level="4"]:fill-primary/100'
            />
          )}
        </ContributionGraphCalendar>
      </ContributionGraph>
    </div>
  );
}
