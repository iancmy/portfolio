import LoadingPage from "@/components/ui/loading-page";

export default function Loading() {
  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-4 px-4 lg:max-w-xl">
      <LoadingPage />
    </div>
  );
}
