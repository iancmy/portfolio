import { Label } from "@/components/ui/label";
import { SyncableKey } from "./types";
import { SyncTrigger } from "./sync-trigger";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  AudioLines,
  CaseLower,
  CaseUpper,
  ChevronsUp,
  Film,
  Settings2,
  VectorSquare,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import InputColor from "@/components/ui/color-picker";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { motion } from "motion/react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { hexToInverse } from "@/lib/color-converter";

export function ConfigPanel({
  values,
  setShowGlobalOptions,
  setShowIndividualOptions,
  syncFlags,
  onChange,
  onToggleSync,
  variant = "individual",
}: {
  values: any;
  setShowGlobalOptions?: Dispatch<SetStateAction<boolean>>;
  setShowIndividualOptions?: Dispatch<SetStateAction<boolean>>;
  syncFlags?: Record<SyncableKey, boolean>;
  onChange: (key: string, value: any) => void;
  onToggleSync?: (key: SyncableKey) => void;
  variant?: "global" | "individual";
}) {
  const Header = ({
    label,
    fieldKey,
  }: {
    label: string;
    fieldKey?: SyncableKey;
  }) => (
    <>
      <ButtonGroupText className="text-xs font-medium">
        {label}
        {variant === "individual" && fieldKey && syncFlags && onToggleSync && (
          <SyncTrigger
            label={label}
            isSynced={syncFlags[fieldKey]}
            onClick={() => onToggleSync(fieldKey)}
          />
        )}
      </ButtonGroupText>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ ease: "easeInOut", duration: 0.25 }}
      className="flex flex-col gap-2"
    >
      <ButtonGroup className="w-full">
        <Header label="Title" fieldKey="title" />
        <InputGroup
          className={
            variant === "individual" && syncFlags?.title ? "opacity-80" : ""
          }
        >
          <InputGroupInput
            value={values.title}
            placeholder={
              variant === "global" ? "Leave empty to use filenames" : ""
            }
            onChange={(e) => {
              onChange("title", e.target.value);
            }}
            className="h-8 !text-xs"
          />
          <InputGroupAddon>
            <CaseUpper size="1em" />
          </InputGroupAddon>
        </InputGroup>
      </ButtonGroup>

      {variant === "individual" && (
        <ButtonGroup className="w-full">
          <Header label="Subtitle" />
          <InputGroup>
            <InputGroupInput
              value={values.subtitle}
              onChange={(e) => onChange("subtitle", e.target.value)}
              className="h-8 !text-xs"
            />
            <InputGroupAddon>
              <CaseLower size="1em" />
            </InputGroupAddon>
          </InputGroup>
        </ButtonGroup>
      )}

      <ButtonGroup className="w-full">
        <Header label="Size" fieldKey="width" />
        <Select
          value={values.width.toString()}
          onValueChange={(v) => onChange("width", parseInt(v))}
        >
          <SelectTrigger
            className={`h-8 !text-xs ${variant === "individual" && syncFlags?.width ? "opacity-80" : ""} grow`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3840">4k</SelectItem>
            <SelectItem value="1920">1080p</SelectItem>
            <SelectItem value="1280">720p</SelectItem>
          </SelectContent>
        </Select>
        <Header label="Transparent?" fieldKey="transparentBg" />
        <div
          className={`flex items-center gap-2 px-2 border-1 rounded-md${variant === "individual" && syncFlags?.transparentBg ? "opacity-80" : ""}`}
        >
          <Switch
            checked={values.transparentBg}
            onCheckedChange={(v) => onChange("transparentBg", v)}
            className="scale-75 cursor-pointer"
          />
        </div>
      </ButtonGroup>
      <ButtonGroup className="w-full max-h-10 rounded-md overflow-hidden flex gap-1 flex-wrap">
        <ButtonGroupText className="text-xs font-medium truncate flex-1 max-w-[75px]">
          Colors
        </ButtonGroupText>
        <ButtonGroupSeparator />
        <div className="flex items-center gap-2 px-2 py-1 bg-muted flex-1">
          <InputColor
            value={values.videoColor}
            onChange={(v) => onChange("videoColor", v)}
            className="rounded-full w-7 h-7 shadow-md"
            overlay={<Film size="1em" style={{ color: hexToInverse(values.videoColor) }} />}
          />
          <div className="flex items-center justify-start gap-1">
            <span className="text-xs text-primary/80">Video</span>
            {variant === "individual" && syncFlags && onToggleSync && (
              <SyncTrigger
                isSynced={syncFlags.videoColor}
                onClick={() => onToggleSync("videoColor")}
                label="Video Color"
              />
            )}
          </div>
        </div>
        <ButtonGroupSeparator />
        <div className="flex items-center gap-2 px-2 py-1 bg-muted flex-1">
          <InputColor
            value={values.adjColor}
            onChange={(v) => onChange("adjColor", v)}
            className="rounded-full w-7 h-7 shadow-md"
            overlay={<VectorSquare size="1em" style={{ color: hexToInverse(values.adjColor) }} />}
          />
          <div className="flex items-center justify-start gap-1">
            <span className="text-xs text-muted-foreground">Graphics</span>
          </div>
          {variant === "individual" && syncFlags && onToggleSync && (
            <SyncTrigger
              isSynced={syncFlags.adjColor}
              onClick={() => onToggleSync("adjColor")}
              label="Graphics Color"
            />
          )}
        </div>
        <ButtonGroupSeparator />
        <div className="flex items-center gap-2 px-2 py-1 bg-muted flex-1">
          <InputColor
            value={values.audioColor}
            onChange={(v) => onChange("audioColor", v)}
            className="rounded-full w-7 h-7 shadow-md"
            overlay={<AudioLines size="1em" style={{ color: hexToInverse(values.audioColor) }} />}
          />
          <div className="flex items-center justify-start gap-1">
            <span className="text-xs text-muted-foreground">Audio</span>
          </div>
          {variant === "individual" && syncFlags && onToggleSync && (
            <SyncTrigger
              isSynced={syncFlags.audioColor}
              onClick={() => onToggleSync("audioColor")}
              label="Audio Color"
            />
          )}
        </div>
      </ButtonGroup>
      <motion.div
        animate={{ y: [-1, 0, -3, 0, -1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full flex items-center justify-center text-muted-foreground cursor-pointer"
        onClick={() => {
          variant === "individual"
            ? setShowIndividualOptions && setShowIndividualOptions(false)
            : setShowGlobalOptions && setShowGlobalOptions(false);
        }}
      >
        <ChevronsUp size="1em" />
      </motion.div>
    </motion.div>
  );
}
