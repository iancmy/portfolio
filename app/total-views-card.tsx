"use client";

import { Eye } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio, Portfolio } from "@/lib/api";

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
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="w-4 h-4"
          >
            <title>YouTube Shorts</title>
            <path d="m18.931 9.99-1.441-.601 1.717-.913a4.48 4.48 0 0 0 1.874-6.078 4.506 4.506 0 0 0-6.09-1.874L4.792 5.929a4.504 4.504 0 0 0-2.402 4.193 4.521 4.521 0 0 0 2.666 3.904c.036.012 1.442.6 1.442.6l-1.706.901a4.51 4.51 0 0 0-2.369 3.967A4.528 4.528 0 0 0 6.93 24c.725 0 1.437-.174 2.08-.508l10.21-5.406a4.494 4.494 0 0 0 2.39-4.192 4.525 4.525 0 0 0-2.678-3.904ZM9.597 15.19V8.824l6.007 3.184z" />
          </svg>
          <AnimatedNumber
            initialValue={sfViewsQ.data * 0.5}
            value={sfViewsQ.data}
          />
        </div>
      </CardContent>
    </Card>
  );
}
