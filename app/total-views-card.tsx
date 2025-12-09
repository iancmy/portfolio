"use client";

import { Eye } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio } from "@/lib/api";
import { Portfolio } from "@/lib/portfolio"
import YoutubeShortsIcon from "@/components/icons/youtube-shorts";

export default function TotalViews() {
  const totalViewsQ = useQuery<Portfolio, Error, number>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
    select: (portf) => portf.totalViews
  });

  const sfViewsQ = useQuery<Portfolio, Error, number>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
    select: (portf) => portf.filter.types("short-form").totalViews
  });

  return (
    <Card className="gap-0 p-8">
      <CardTitle className="text-center font-body flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Eye size="1.5em" />
        <span>Total Views</span>
      </CardTitle>
      <CardContent className="flex flex-col items-center justify-center font-bold">
        <AnimatedNumber
          className="text-3xl text-primary"
          initialValue={totalViewsQ.data * 0.5}
          value={totalViewsQ.data}
        />
        <div className="text-secondary text-sm flex gap-2 items-center">
          <YoutubeShortsIcon />
          <AnimatedNumber
            initialValue={sfViewsQ.data * 0.5}
            value={sfViewsQ.data}
          />
        </div>
      </CardContent>
    </Card>
  );
}
