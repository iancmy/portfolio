import ToolsFooter from "./footer";
import { ToolsHeader } from "./header";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-4 px-4 lg:max-w-xl">
      <ToolsHeader />
      {children}
      <ToolsFooter />
    </div>
  );
}
