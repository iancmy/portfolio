"use client";

import { YtClient } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Eye, Heart, SquareArrowOutUpRight, Users, Video } from "lucide-react";
import Link from "next/link";
import { fetchPortfolio, Portfolio } from "@/lib/api";
import { shuffle } from "@/lib/utils";

export default function ClientsCard() {
  const ytChannelsQ = useQuery<Portfolio, Error, YtClient[]>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    refetchOnWindowFocus: false,
    select: (portf) => shuffle(portf.yt.clients) as YtClient[]
  });

  return (
    <Carousel
      className="w-full not-lg:max-w-xs max-w-2xl not-lg:text-xs text-sm hover:cursor-pointer select-none mt-4"
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
    >
      <CarouselContent>
        {!ytChannelsQ.isLoading ? ytChannelsQ.data?.map((client, i) => {
              return (
                <CarouselItem
                  key={`${i}-${client.name}`}
                  className="relative lg:basis-1/3 md:basis-1/2"
                >
                  <Link href={client.channel_src} target="_blank">
                    <Card>
                      <CardHeader className="flex gap-2 items-center">
                        <Avatar>
                          <picture>
                            <img
                              src={client.client_avatar}
                              alt={`client-photo-${client.name}`}
                              className="border-none h-full w-full"
                            />
                          </picture>
                        </Avatar>
                        <div className="flex flex-col justify-center">
                          <CardTitle className="truncate">
                            {client.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users size={"1.25em"} />
                            {/* <span>{client.yt_channel_subs}</span> */}
                            <AnimatedNumber
                              value={client.total_subs}
                              suffix="sub"
                              animate={false}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-blue-300">
                          <Video size={"1.25em"} />
                          <AnimatedNumber
                            prefix="+"
                            initialValue={client.count * 0.8}
                            value={client.count}
                            suffix="video"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-primary">
                          <Eye size={"1.25em"} />
                          <AnimatedNumber
                            prefix="+"
                            initialValue={client.total_views * 0.8}
                            value={client.total_views}
                            suffix="view"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-red-200">
                          <Heart size={"1.25em"} />
                          <AnimatedNumber
                            prefix="+"
                            initialValue={client.total_likes * 0.8}
                            value={client.total_likes}
                            suffix="like"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <SquareArrowOutUpRight
                    size="1rem"
                    className="text-muted-foreground absolute bottom-4 right-4"
                  />
                </CarouselItem>
              );
            })
          : [1, 2, 3].map((_, i) => {
              return (
                <CarouselItem
                  key={`${i}-client-placeholder-skeleton`}
                  className="lg:basis-1/3 md:basis-1/2"
                >
                  <Card>
                    <CardHeader className="flex gap-2 items-center">
                      <Avatar>
                        <Skeleton className="w-full h-full"></Skeleton>
                      </Avatar>
                      <div className="flex flex-col justify-center gap-1">
                        <CardTitle className="truncate flex">
                          <Skeleton className="flex-1 min-h-2 w-12"></Skeleton>
                        </CardTitle>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users size={"1.25em"} />
                          <Skeleton className="flex-1 min-h-2 w-12"></Skeleton>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-blue-300">
                        <Video size={"1.25em"} />
                        <Skeleton className="flex-1 min-h-2 w-12"></Skeleton>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <Eye size={"1.25em"} />
                        <Skeleton className="flex-1 min-h-2 w-12"></Skeleton>
                      </div>
                      <div className="flex items-center gap-2 text-red-200">
                        <Heart size={"1.25em"} />
                        <Skeleton className="flex-1 min-h-2 w-12"></Skeleton>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
