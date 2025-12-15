import Link from "next/link";
import { toKebabCase } from "@/lib/utils";
import { TOOLS } from "./tools";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools",
  description: "Tools made by me",
};

export default async function ToolsPage() {
  return (
    <div className="w-full flex flex-col gap-4">
      {TOOLS.length > 0 ? (
        TOOLS.map((tool, i) => (
          <Link
            href={tool.src}
            key={`tool-${i}-${toKebabCase(tool.title)}`}
            className="flex gap-4 items-center px-4 py-2 self-start hover:bg-muted rounded-md transition-colors duration-250 w-full"
          >
            {tool.icon}
            <p>{tool.title}</p>
          </Link>
        ))
      ) : (
        <p>No tools yet.</p>
      )}
    </div>
  );
}
