import Image from "next/image";
import TypewriterTitle from "./type-writer";

const sequences = [
  {
    text: "Loading...",
    deleteAfter: true,
  },
  {
    text: "Cleaning...",
    deleteAfter: true,
  },
];

export default function LoadingPage() {
  return (
    <>
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-20 blur-lg animate-pulse"></div>
        <Image
          src="/images/impressed.png"
          alt="Loading page"
          width={120}
          height={120}
          className="relative pixelated animate-bounce"
        />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Loading Page
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Cleaning up the page for you
        </p>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
        <Image src="/images/bot.png" alt="Bot" width={24} height={24} />
        <TypewriterTitle
          sequences={sequences}
          typingSpeed={100}
          loopDelay={0}
          prepend="Status:"
          className="font-body text-xs text-muted-foreground"
        />
      </div>
    </>
  );
}
