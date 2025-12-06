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
  label: string;
}

export default function SortItem({ children, value, label }: SortItemProps) {
  return (
    <ToggleGroupItem
      value={value}
      className="cursor-pointer text-sm min-w-40 justify-start"
    >
      <p className="flex gap-2 items-center truncate">
        {children}
        <span>{label}</span>
      </p>
    </ToggleGroupItem>
  );
}
