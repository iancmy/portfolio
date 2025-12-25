import { RepoNode } from "@/lib/repos";
import { cn, formatBytes, toKebabCase } from "@/lib/utils";
import {
  ChevronDown,
  Clock,
  Clock4,
  ClockArrowUp,
  ClockFading,
  Download,
  Globe,
  Scale,
  Star,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SimpleIcon } from "@/components/icons/simple-icons";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

interface RepoCardProps {
  className?: string;
  data: RepoNode;
}

export default function RepoCard({ data, className }: RepoCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col gap-2 bg-muted/40 rounded-md px-4 py-2 hover:shadow-md hover:bg-muted transition-all duration-400 w-1/4 not-lg:w-full h-50 not-lg:h-fit not-lg:min-h-40",
        className,
      )}
    >
      <Tooltip delayDuration={500}>
        <TooltipContent align="start">{data.name}</TooltipContent>
        <TooltipTrigger asChild>
          <div className="">
            <p className="font-title truncate max-w-8/10 text-md font-bold">
              {data.name}
            </p>
          </div>
        </TooltipTrigger>
      </Tooltip>
      <div className="flex gap-1">
        {data.languages.map((lang, i) => {
          return (
            <SimpleIcon
              key={`repo-lang${i}-${lang.name}`}
              name={lang.name}
              className="w-3"
              style={{ color: lang.color }}
            />
          );
        })}
      </div>
      <Tooltip delayDuration={500}>
        <TooltipContent align="start">
          {data.description || "No description"}
        </TooltipContent>
        <TooltipTrigger asChild>
          {data.description ? (
            <p className="max-w-8/10 text-xs font-thin line-clamp-3">
              {data.description}
            </p>
          ) : (
            <p className="max-w-8/10 text-xs text-muted-foreground font-thin italic">
              No description
            </p>
          )}
        </TooltipTrigger>
      </Tooltip>
      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end text-sm">
        <p className="flex gap-1 items-center leading-none">
          <Star size="1em" fill="currentColor" className="text-primary" />
          <span>{data.stars}</span>
        </p>
        {data.license && (
          <Tooltip delayDuration={500}>
            <TooltipContent>{data.license.name}</TooltipContent>
            <TooltipTrigger className="text-muted-foreground">
              <Scale size="1em" />
            </TooltipTrigger>
          </Tooltip>
        )}
      </div>
      <div className="flex-1 flex items-end w-full">
        <p className="text-xs text-muted-foreground/50 flex gap-1 items-center flex-1">
          <ClockArrowUp size="1em" />
          <span>
            {data.updatedAt.toLocaleDateString([], { dateStyle: "short" })}
          </span>
        </p>
      </div>
      <ButtonGroup className="w-full">
        <Button
          variant="outline"
          onClick={() => {
            if (data.url)
              window.open(data.url, "_blank", "noopener,noreferrer");
          }}
          disabled={!data.url}
          className={cn(
            "text-xs flex gap-1 items-center cursor-pointer",
            !data.url && "text-muted-foreground",
          )}
        >
          <SimpleIcon name="github"/>
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (data.homepageUrl)
              window.open(data.homepageUrl, "_blank", "noopener,noreferrer");
          }}
          disabled={!data.homepageUrl}
          className={cn(
            "text-xs flex gap-1 items-center cursor-pointer",
            !data.homepageUrl && "text-muted-foreground",
          )}
        >
          <Globe size="1em" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              className="flex-1 text-xs font-title cursor-pointer truncate"
              disabled={!data.latestRelease}
              onClick={(e) => e.stopPropagation()}
            >
              {!!data.latestRelease ? (
                <Tooltip delayDuration={500}>
                  <TooltipContent>{data.latestRelease.name}</TooltipContent>
                  <TooltipTrigger asChild>
                    <span className="truncate">
                      Download{" "}
                      <span className="text-primary">
                        {data.latestRelease.name}
                      </span>
                    </span>
                  </TooltipTrigger>
                </Tooltip>
              ) : (
                <span>Download</span>
              )}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          {!!data.latestRelease && (
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-title text-md text-primary">
                <span
                  onClick={() => {
                    window.open(
                      data.latestRelease?.url,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  className="cursor-pointer"
                >
                  {data.latestRelease.name}-{data.latestRelease.tagName}@
                  {data.latestRelease.publishedAt.toLocaleDateString([], {
                    dateStyle: "short",
                  })}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {data.latestRelease.releaseAssets.map((asset) => {
                  return (
                    <DropdownMenuItem
                      key={`asset-${toKebabCase(asset.name)}`}
                      asChild
                    >
                      <p
                        onClick={() => {
                          window.open(
                            asset.downloadUrl,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                        className="group text-xs"
                      >
                        <span>{asset.name}</span>
                        <span className="text-muted-foreground group-hover:text-white">{formatBytes(asset.size)}</span>
                      </p>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </ButtonGroup>
    </Card>
  );
}
