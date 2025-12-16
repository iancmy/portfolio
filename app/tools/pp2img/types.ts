import { Sequence } from "./pp-parser";

export type ProjectSequence = Sequence & { sourceFile: string };
export type SyncableKey =
  | "title"
  | "width"
  | "videoColor"
  | "adjColor"
  | "audioColor"
  | "transparentBg";

export type SequenceOptions = {
  title: string;
  subtitle: string;
  width: number;
  videoColor: string;
  adjColor: string;
  audioColor: string;
  transparentBg: boolean;
  syncFlags: Record<SyncableKey, boolean>;
};
