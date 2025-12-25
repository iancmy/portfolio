import { SimpleIcon } from "@/components/icons/simple-icons";
import ActivityGraph from "./activity-graph";
import Repos from "./repos";

export default function Dev() {
  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-4 px-4 lg:max-w-xl">
      <p className="bg-primary/20 py-2 w-5xl rounded-2xl text-3xl font-bold font-title flex gap-4 items-center justify-center text-primary shadow-md">
        <SimpleIcon name="Github" className="w-8"/>
        <span>Activity</span>
      </p>
      <ActivityGraph />
      <p className="mt-12 bg-primary/20 py-2 w-5xl rounded-2xl text-3xl font-bold font-title flex gap-4 items-center justify-center text-primary shadow-md">
        <SimpleIcon name="Git" className="w-8"/>
        <span>Projects</span>
      </p>
      <Repos />
    </div>
  );
}
