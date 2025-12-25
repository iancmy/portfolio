"use client";

import {
  Activity,
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
} from "@/components/kibo-ui/contribution-graph";
import { githubDataToActivity } from "@/lib/utils";
import { formatISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { GHActivityDate } from "@/lib/types/github";
import { useGithubActivity } from "./queries";

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
  const [year, setYear] = useState<GHActivityDate>("present");
  const { mutate: mutateActivity, data: activityData } = useGithubActivity();

  const handleYearSelect = (value: string) => {
    let finalValue: GHActivityDate;
    if (value !== "present") finalValue = parseInt(value);
    else finalValue = value;
    setYear(finalValue);
  };

  useEffect(() => {
    mutateActivity({ year });
  }, [year, mutateActivity]);

  const githubActivity = useMemo(() => {
    if (activityData && activityData.weeks.length) {
      return githubDataToActivity(activityData);
    }

    return placeholderData
  }, [activityData]);

  return (
    <div className="flex flex-col gap-4 items-center justify-around">
      <Select value={year.toString()} onValueChange={handleYearSelect}>
        <SelectTrigger className="w-1/5 self-end">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {[...new Array(5)]
            .map((_, index) => new Date().getFullYear() - index)
            .map((year, index) => {
              return (
                <SelectItem
                  key={`item-${year}`}
                  value={`${index === 0 ? "present" : year}`}
                >
                  {index === 0 ? "Present" : year}
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
      <ContributionGraph
        data={githubActivity}
        className="max-w-4xl not-lg:max-w-xs"
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
    </div>
  );
}
