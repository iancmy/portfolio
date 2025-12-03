"use client";

import { ShineBorder } from "@/components/ui/shine-border";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import TypewriterTitle from "@/components/ui/type-writer";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import ClientsCard from "@/components/clients-card";
import TotalViews from "@/components/total-views-card";
import TotalLikes from "@/components/total-likes-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useQuery } from "@tanstack/react-query";
import ActivityGraph from "@/components/activity-graph";
import { Film, SquareArrowOutUpRight } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { fetchPortfolio, Portfolio } from "@/lib/api";
import { YtClient } from "@/lib/types";

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const kofiLight = "https://storage.ko-fi.com/cdn/kofi1.png?v=6";
  const kofiDark = "https://storage.ko-fi.com/cdn/kofi3.png?v=6";

  const test = useQuery<Portfolio>({
    queryKey: ["portfolio", "test"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
  });
  const ytCountQ = useQuery<Portfolio, Error, number>({
    queryKey: ["portfolio", "yt", "count"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
    select: (portf) => portf.yt.count,
  });

  const ytChannelsQ = useQuery<Portfolio, Error, YtClient[]>({
    queryKey: ["portfolio", "yt", "channels"],
    queryFn: fetchPortfolio,
    initialData: new Portfolio(),
    select: (portf) => portf.yt.clients as YtClient[],
  });

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <Card className="relative w-2/3 not-lg:w-full min-h-[36em]">
        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        <Image
          className="object-cover p-0.25 rounded-xl"
          src="/images/hero.jpg"
          alt="dom-editing"
          fill
        />
      </Card>
      <h1 className="flex gap-[0.25em] text-center text-7xl not-lg:text-4xl font-medium font-title">
        <span>Hi! My name is</span>
        <TypewriterTitle
          sequences={[
            {
              text: "Ian.",
              deleteAfter: true,
              pauseAfter: 500,
            },
            {
              text: "Dom.",
              deleteAfter: true,
              pauseAfter: 500,
            },
          ]}
          typingSpeed={150}
          loopDelay={0}
        />
      </h1>
      <div>
        <p className="text-center">
          I{" "}
          <Link href="/work" className="underline font-bold text-primary">
            edit videos
          </Link>{" "}
          for work and{" "}
          <Link
            href="/dev/projects"
            className="underline font-bold text-primary"
          >
            write code
          </Link>{" "}
          for fun... both involve too much coffee.
        </p>
        <p className="flex text-xs text-gray-400 text-center items-center justify-center gap-2">
          You can support and buy me one here -&gt;
          <Link href="https://ko-fi.com/Z8Z21JJ65S" target="_blank">
            <picture>
              <img
                src={mounted && theme === "dark" ? kofiDark : kofiLight}
                alt="Buy Me a Coffee at ko-fi.com"
                className="border-none h-[24px] w-full"
              />
            </picture>
          </Link>
        </p>
      </div>
      <Link href="/work">
        <RainbowButton
          variant="outline"
          className="text-xl font-title mt-8"
          size="lg"
        >
          <span>Portfolio</span>
          <SquareArrowOutUpRight size="1em" />
        </RainbowButton>
      </Link>
      <p className="mt-12 mb-8 bg-primary/20 py-4 w-5xl rounded-2xl text-5xl font-bold font-title flex gap-4 items-center justify-center text-primary shadow-md">
        <Film size="1em" />
        <span>Editing Activity</span>
      </p>
      <ActivityGraph />
      <div className="mt-12 flex flex-col gap-4">
        <p className="mt-8 bg-red-500/20 py-4 w-5xl rounded-2xl text-5xl font-bold font-title flex gap-4 items-center justify-center text-red-500 shadow-md">
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="w-12 h-12"
          >
            <title>YouTube</title>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.12 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span>Youtube Stats</span>
        </p>
        <div className="flex gap-2 items-center place-self-center font-title text-2xl not-lg:text-xl">
          <span>Edited</span>
          <AnimatedNumber
            className="font-body text-4xl text-primary"
            initialValue={0}
            value={ytCountQ.data}
          />
          <span>videos across</span>
          <AnimatedNumber
            className="font-body text-4xl text-primary"
            initialValue={0}
            value={ytChannelsQ.data.length}
          />
          <span>channels.</span>
        </div>
        <div className="flex gap-2 items-center justify-center">
          <TotalViews />
          <TotalLikes />
        </div>
        <div className="flex items-center justify-center">
          <ClientsCard />
        </div>
      </div>
    </div>
  );
}
