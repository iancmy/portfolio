"use client";

import { usePathname } from "next/navigation";
import { TOOLS } from "./tools";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const TOOLS_ROOT = "/tools";
export function ToolsHeader() {
  const pathname = usePathname();
  const activeTool = TOOLS.find((t) => t.src === pathname);
  const pageTitle = activeTool ? activeTool.title : "Tools";

  return (
    <>
      <p className="font-title text-3xl self-start font-bold">{pageTitle}</p>
      <Breadcrumb className="self-start font-title">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {activeTool ? (
              <BreadcrumbLink href={TOOLS_ROOT}>Tools</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Tools</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {activeTool && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{activeTool.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
