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
import { formatISO } from "date-fns";

const placeholderData: Activity[] = [
  {
    date: formatISO(new Date("1/1/2024"), { representation: "date" }),
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
  const portQ = useQuery<Portfolio>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
  });

  return (
    <div className="flex gap-4 items-center justify-around">
      <span className="font-bold font-title text-2xl text-accent [writing-mode:vertical-lr]">
        {videoDataToActivity(portQ.data.videos)[0]?.date
          ? new Date(
            videoDataToActivity(portQ.data.videos)[0].date
            ).getFullYear()
          : new Date().getFullYear()}
      </span>
      <ContributionGraph
        data={
          portQ.isLoading || portQ.isError
            ? placeholderData
            : videoDataToActivity(portQ.data.videos)
        }
        className="max-w-3xl not-lg:max-w-xs"
      >
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
      <span className="font-bold font-title text-2xl text-accent [writing-mode:vertical-lr]">
        {new Date().getFullYear()}
      </span>
    </div>
  );
}
