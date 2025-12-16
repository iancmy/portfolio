import { Button } from "@/components/ui/button";
import { Link, Unlink } from "lucide-react";

export function SyncTrigger({
  isSynced,
  onClick,
  label,
}: {
  isSynced: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`h-6 w-6 cursor-pointer border-0 transition-colors ${isSynced ? "text-primary/70 hover:text-primary" : "text-muted-foreground hover:text-destructive"}`}
      onClick={onClick}
      title={
        isSynced ? `Synced to Global ${label}` : `Unlinked (Custom ${label})`
      }
    >
      {isSynced ? <Link size="1em" /> : <Unlink size="1em" />}
    </Button>
  );
}
