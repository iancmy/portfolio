"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TOOLS } from "./tools";
import { MessageSquareText } from "lucide-react";

export default function ToolsFooter() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const activeTool = TOOLS.find((t) => t.src === pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  const kofiLight = "https://storage.ko-fi.com/cdn/kofi1.png?v=6";
  const kofiDark = "https://storage.ko-fi.com/cdn/kofi3.png?v=6";

  return (
    <div className="flex flex-col gap-1">
      <Link href="/chat" className="flex text-xs text-muted-foreground text-center items-center justify-center gap-2 hover:underline">
        Problems? Message me <MessageSquareText size="1em"/>
      </Link>
      <p className="flex text-xs text-muted-foreground text-center items-center justify-center gap-2">
        If you like {!activeTool ? "any of these," : "this,"} consider
        supporting me -&gt;
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
  );
}
