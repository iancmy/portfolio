"use client";

import { Heart } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio } from "@/lib/api";
import { Portfolio } from "@/lib/portfolio"
import YoutubeShortsIcon from "@/components/icons/youtube-shorts";

export default function TotalLikes() {
  const totalLikesQ = useQuery<Portfolio, Error, number>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
    select: (portf) => portf.totalLikes
  });

  const sfLikesQ = useQuery<Portfolio, Error, number>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
    select: (portf) => portf.filter.types("short-form").totalLikes
  });

  return (
    <Card className="gap-0 p-8">
      <CardTitle className="text-center font-body flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Heart size="1.5em" />
        <span>Total Likes</span>
      </CardTitle>
      <CardContent className="flex flex-col items-center justify-center font-bold">
        <AnimatedNumber
          className="text-3xl text-primary"
          initialValue={totalLikesQ.data * 0.5}
          value={totalLikesQ.data}
        />
        <div className="text-secondary text-sm flex gap-2 items-center">
          <YoutubeShortsIcon />
          <AnimatedNumber
            initialValue={sfLikesQ.data * 0.5}
            value={sfLikesQ.data}
          />
        </div>
      </CardContent>
    </Card>
  );
}
