import { ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface SortItemProps {
  children?: ReactNode | ReactNode[];
  value: string;
  tooltipHint: string;
}

export default function SortItem({
  children,
  value,
  tooltipHint,
}: SortItemProps) {
  return (
    <Tooltip delayDuration={500}>
      <ToggleGroupItem value={value} className="cursor-pointer text-sm">
        <TooltipTrigger asChild>{children}</TooltipTrigger>
      </ToggleGroupItem>
      <TooltipContent align="start">
        <p className="">{tooltipHint}</p>
      </TooltipContent>
    </Tooltip>
  );
}
