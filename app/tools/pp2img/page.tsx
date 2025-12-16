"use client";
import {
  Download,
  Info,
  Loader2,
  Settings2,
  Upload,
  Palette,
  Save,
  Copy,
  CheckCheck,
  ChevronsDown,
  X,
  RefreshCcw,
  RefreshCw,
  Settings,
  ChevronDown,
  FolderArchive,
} from "lucide-react";
import Pp2ImgIcon from "./toolIcon";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parsePremiereXML } from "./pp-parser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, toKebabCase } from "@/lib/utils";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProjectSequence, SequenceOptions, SyncableKey } from "./types";
import {
  serializeSettings,
  useGlobalSettingsParams,
} from "./useGlobalSettingsParams";
import { useGlobalSettingsStore } from "./useGlobalSettingsStore";
import { COLOR_THEMES } from "./themes";
import { drawSequence } from "./utils";
import { ConfigPanel } from "./config-panel";
import { TimelineCanvas } from "./timeline-canvas";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InputGroup } from "@/components/ui/input-group";
import { AnimatePresence, motion } from "motion/react";

const DEFAULT_FLAGS: Record<SyncableKey, boolean> = {
  title: true,
  width: true,
  videoColor: true,
  adjColor: true,
  audioColor: true,
  transparentBg: true,
};

const MAX_FILES = 100;

export default function Pp2Img() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sequences, setSequences] = useState<ProjectSequence[]>([]);
  const [selectedSeqIds, setSelectedSeqIds] = useState<string[]>([]);

  const [globalOptions, setGlobalOptions] = useGlobalSettingsParams();
  const [showGlobalOptions, setShowGlobalOptions] = useState(false);
  const [showIndividualOptions, setShowIndividualOptions] = useState(false);
  const saveGlobalSettings = useGlobalSettingsStore(
    (state) => state.setSettings,
  );

  const [seqOptions, setSeqOptions] = useState<Record<string, SequenceOptions>>(
    {},
  );

  const selectedSequences = useMemo(() => {
    return sequences.filter((seq) => selectedSeqIds.includes(seq.id));
  }, [sequences, selectedSeqIds]);

  useEffect(() => {
    setSeqOptions((prev) => {
      const next = { ...prev };
      let hasChanges = false;
      Object.keys(next).forEach((id) => {
        const seqSourceFileName =
          sequences.find((s) => s.id === id)?.sourceFile || "";
        const seqOpts = next[id];
        const newOpts = { ...seqOpts };
        let seqChanged = false;

        (Object.keys(DEFAULT_FLAGS) as SyncableKey[]).forEach((key) => {
          if (key === "title") {
            if (!!globalOptions[key]) {
              if (newOpts[key] !== globalOptions[key]) {
                newOpts[key] = globalOptions[key];
                newOpts.syncFlags[key] = true;
                seqChanged = true;
              }
            } else {
              if (!globalOptions[key]) newOpts[key] = seqSourceFileName;
              // newOpts.syncFlags[key] = false;
              seqChanged = true;
            }

            return;
          }

          if (seqOpts.syncFlags[key]) {
            if (newOpts[key] !== globalOptions[key]) {
              // @ts-ignore
              newOpts[key] = globalOptions[key];
              seqChanged = true;
            }
          }
        });

        if (seqChanged) {
          next[id] = newOpts;
          hasChanges = true;
        }
      });

      return hasChanges ? next : prev;
    });
  }, [globalOptions, selectedSequences]);

  const handleGlobalChange = (key: string, value: any) => {
    setGlobalOptions({ [key]: value });
  };

  const handleIndividualChange = (
    id: string,
    key: SyncableKey | "subtitle",
    value: any,
  ) => {
    setSeqOptions((prev) => {
      const current = prev[id];
      if (key === "subtitle")
        return { ...prev, [id]: { ...current, subtitle: value } };
      return {
        ...prev,
        [id]: {
          ...current,
          [key]: value,
          syncFlags: { ...current.syncFlags, [key]: false },
        },
      };
    });
  };

  const toggleSync = (id: string, key: SyncableKey, sourceFilename: string) => {
    setSeqOptions((prev) => {
      const current = prev[id];
      const isCurrentlySynced = current.syncFlags[key];

      if (!isCurrentlySynced) {
        let globalValue = globalOptions[key];
        if (key === "title" && !globalValue) globalValue = sourceFilename;

        return {
          ...prev,
          [id]: {
            ...current,
            [key]: globalValue,
            syncFlags: { ...current.syncFlags, [key]: true },
          },
        };
      } else {
        return {
          ...prev,
          [id]: {
            ...current,
            syncFlags: { ...current.syncFlags, [key]: false },
          },
        };
      }
    });
  };

  const applyTheme = (themeKey: string) => {
    // @ts-ignore
    const t = COLOR_THEMES[themeKey];
    if (!t) return;
    setGlobalOptions((prev) => ({
      ...prev,
      videoColor: t.video,
      adjColor: t.adj,
      audioColor: t.audio,
    }));
  };

  const [showOptionsCopied, setShowOptionsCopied] = useState(false);
  const handleCopyOptions = () => {
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    const serialized = serializeSettings(globalOptions);
    const fullUrl = `${cleanUrl}${serialized}`;

    navigator.clipboard.writeText(fullUrl);
    setShowOptionsCopied(true);
    setTimeout(() => setShowOptionsCopied(false), 2000);
  };

  const [showSavedDefaults, setShowSavedDefaults] = useState(false);
  const handleSaveDefaults = () => {
    saveGlobalSettings(globalOptions);
    setShowSavedDefaults(true);
    setTimeout(() => setShowSavedDefaults(false), 2000);
  };

  const onFileValidate = useCallback(
    (file: File) => {
      if (files.length >= MAX_FILES) return `Max ${MAX_FILES} files allowed`;
      if (!file.name.toLowerCase().endsWith(".prproj"))
        return "Only .prproj files allowed";
      return "";
    },
    [files],
  );

  useEffect(() => {
    const loadFiles = async () => {
      if (files.length === 0) {
        setSequences([]);
        setSeqOptions({});
        return;
      }

      setIsLoading(true);
      const newSequences: ProjectSequence[] = [];
      const newOptions: Record<string, SequenceOptions> = {};
      const worker = new Worker("/workers/decompress.worker.js");
      let processedCount = 0;

      worker.onmessage = (e) => {
        const { type, text, fileName } = e.data;
        processedCount++;

        if (type === "SUCCESS") {
          try {
            const parsed = parsePremiereXML(text);
            parsed.forEach((seq) => {
              const uniqueId = `${fileName}-${seq.id}`;
              newSequences.push({ ...seq, id: uniqueId, sourceFile: fileName });

              if (!seqOptions[uniqueId]) {
                newOptions[uniqueId] = {
                  title: fileName,
                  subtitle: seq.name,
                  width: globalOptions.width,
                  videoColor: globalOptions.videoColor,
                  adjColor: globalOptions.adjColor,
                  audioColor: globalOptions.audioColor,
                  transparentBg: globalOptions.transparentBg,
                  syncFlags: DEFAULT_FLAGS,
                };
              }
            });
          } catch (parseErr) {
            console.error("XML Parse Error", parseErr);
          }
        }
        if (processedCount === files.length) {
          setSeqOptions((prev) => ({ ...prev, ...newOptions }));
          setSequences((prev) => [...prev, ...newSequences]);
          setIsLoading(false);
          worker.terminate();
        }
      };
      files.forEach((file) => worker.postMessage(file));
      return () => worker.terminate();
    };

    loadFiles();
  }, [files]);

  const handleDownloadAll = async () => {
    if (selectedSequences.length === 0) return;
    setIsLoading(true);
    const tempCanvas = document.createElement("canvas");

    for (const seq of selectedSequences) {
      const opts = seqOptions[seq.id];
      if (!opts) continue;

      drawSequence(
        tempCanvas,
        seq,
        opts.width,
        {
          video: opts.videoColor,
          adj: opts.adjColor,
          audio: opts.audioColor,
          transparentBg: opts.transparentBg,
        },
        { title: opts.title, subtitle: opts.subtitle },
      );

      const link = document.createElement("a");
      link.download = `${seq.id}.png`;
      link.href = tempCanvas.toDataURL() || "";
      link.click();
    }

    setIsLoading(false);
  };

  const handleDownloadAllZip = async () => {
    if (selectedSequences.length === 0) return;
    setIsLoading(true);
    const zip = new JSZip();
    const tempCanvas = document.createElement("canvas");

    for (const seq of selectedSequences) {
      const opts = seqOptions[seq.id];
      if (!opts) continue;

      drawSequence(
        tempCanvas,
        seq,
        opts.width,
        {
          video: opts.videoColor,
          adj: opts.adjColor,
          audio: opts.audioColor,
          transparentBg: opts.transparentBg,
        },
        { title: opts.title, subtitle: opts.subtitle },
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        tempCanvas.toBlob(resolve),
      );
      if (blob) {
        zip.file(
          `${toKebabCase(opts.title)}-${toKebabCase(opts.subtitle)}.png`,
          blob,
        );
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "timelines.zip");
    setIsLoading(false);
  };

  const handleReset = () => {
    setFiles([]);
    setSequences([]);
    setSelectedSeqIds([]);
    setSeqOptions({});
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-xl">
      <Pp2ImgIcon className="w-24 h-24" />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center gap-2">
          <p className="font-title text-2xl">Premiere to Image</p>
          <Button
            variant="outline"
            onClick={handleReset}
            className={cn(
              "group text-md text-muted-foreground p-2 rounded-md w-8 h-8 self-end flex items-center justify-center",
              files.length < 1 && "disabled",
            )}
            disabled={files.length < 1}
          >
            <RefreshCw size="1em" className="group-hover:animate-spin" />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Convert your Premiere Pro timelines into images that you can share.
        </p>
        <p className="text-xs italic ml-2 font-bold text-muted-foreground flex gap-2 items-center">
          <Info />
          <span>
            Your project file will not be uploaded to any server. All operations
            are done in the browser.
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 self-center w-full">
        <FileUpload
          value={files}
          onValueChange={setFiles}
          onFileValidate={onFileValidate}
          accept=".prproj"
          maxFiles={MAX_FILES}
          className="w-full max-w-xl"
          multiple
        >
          {files.length < 1 && (
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">
                  Drag & drop your project file here
                </p>
                <p className="text-muted-foreground text-xs">
                  Or click to browse (Max {MAX_FILES})
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-fit cursor-pointer"
                >
                  Browse files
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
          )}

          <FileUploadList>
            {files.map((file) => (
              <FileUploadItem key={file.name} value={file}>
                <FileUploadItemMetadata />
                <FileUploadItemDelete />
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing projects...</span>
          </div>
        )}

        {sequences.length > 0 && (
          <ButtonGroup className="flex w-full h-full">
            <ButtonGroupText>Sequences: </ButtonGroupText>
            <InputGroup className="overflow-hidden">
              <MultiSelect
                values={selectedSeqIds}
                onValuesChange={setSelectedSeqIds}
              >
                <MultiSelectTrigger className="w-full h-full flex-1 bg-none border-none">
                  <MultiSelectValue placeholder="Select sequences..." />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  <MultiSelectGroup>
                    {files.map((f) => {
                      const fileSeqs = sequences.filter(
                        (s) => s.sourceFile === f.name,
                      );
                      if (fileSeqs.length === 0) return null;
                      return (
                        <div key={f.name}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                            {f.name}
                          </div>
                          {fileSeqs.map((seq) => (
                            <MultiSelectItem key={seq.id} value={seq.id}>
                              {seq.name}
                            </MultiSelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </MultiSelectGroup>
                </MultiSelectContent>
              </MultiSelect>
            </InputGroup>
          </ButtonGroup>
        )}

        {selectedSequences.length > 0 && (
          <>
            <div className="border rounded-md bg-muted/20 p-4 mt-4 relative group">
              <div className="flex items-center gap-4 mb-4 border-b pb-2">
                <div className="flex gap-1 items-center">
                  <Settings2 size="1em" />
                  <span className="font-title text-sm font-bold">
                    Global Options
                  </span>
                </div>
                <div className="flex items-center gap-1 grow">
                  <Select onValueChange={applyTheme}>
                    <SelectTrigger className="text-xs gap-1 border-dashed grow">
                      <Palette size="1em" />
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: theme.video }}
                              />
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: theme.adj }}
                              />
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: theme.audio }}
                              />
                            </div>
                            {theme.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2 text-xs gap-1.5 text-muted-foreground hover:text-primary cursor-pointer"
                    onClick={handleCopyOptions}
                    title="Copy URL"
                  >
                    {showOptionsCopied ? (
                      <Tooltip defaultOpen open={showOptionsCopied}>
                        <TooltipTrigger asChild>
                          <CheckCheck size="1.5em" />
                        </TooltipTrigger>
                        <TooltipContent>Copied</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Copy size="1.5em" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2 text-xs gap-1.5 border-dashed hover:border-solid cursor-pointer"
                    onClick={handleSaveDefaults}
                    title="Save Default"
                  >
                    {showSavedDefaults ? (
                      <Tooltip defaultOpen open={showSavedDefaults}>
                        <TooltipTrigger asChild>
                          <CheckCheck size="1.5em" />
                        </TooltipTrigger>
                        <TooltipContent>Saved</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
              <AnimatePresence>
                {showGlobalOptions ? (
                  <ConfigPanel
                    key="global-config-panel"
                    variant="global"
                    values={globalOptions}
                    onChange={handleGlobalChange}
                    setShowGlobalOptions={setShowGlobalOptions}
                  />
                ) : (
                  <motion.div
                    key="global-config-panel-expand"
                    animate={{ opacity: 1, y: [-1, 0, -3, 0, -1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-full flex items-center justify-center text-muted-foreground cursor-pointer"
                    onClick={() => setShowGlobalOptions(true)}
                  >
                    <ChevronsDown size="1em" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col gap-4 w-full mt-6">
              <div className="flex justify-between items-center">
                <p className="font-bold font-title text-md">Preview</p>
                <ButtonGroup className="!text-xs flex items-center">
                  <Button
                    onClick={handleDownloadAll}
                    size="sm"
                    variant="outline"
                    className="flex gap-2 text-xs cursor-pointer"
                  >
                    <Download size="1em" /> Download All
                  </Button>
                  <Button
                    onClick={handleDownloadAllZip}
                    size="sm"
                    variant="outline"
                    className="flex gap-2 text-xs cursor-pointer"
                  >
                    <FolderArchive size="1em" />
                  </Button>
                </ButtonGroup>
              </div>
              <Carousel
                className="w-full"
                setApi={(api) => {
                  api?.reInit({
                    watchDrag: (_, e) => {
                      const target = e.target as HTMLElement;
                      const isOnCanvas = target.closest(
                        "[data-canvas-wrapper]",
                      );

                      if (isOnCanvas) return false;
                      return true;
                    },
                  });
                }}
              >
                <CarouselContent>
                  {selectedSequences.map((seq) => {
                    const opts = seqOptions[seq.id];
                    if (!opts) return null;

                    return (
                      <CarouselItem key={seq.id}>
                        <div className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
                          <div className="flex flex-col gap-6">
                            <div className="w-full flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p
                                    className="font-bold text-sm truncate"
                                    title={seq.sourceFile}
                                  >
                                    {seq.sourceFile}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {seq.name}
                                  </p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className={cn(
                                    "text-primary-foreground/60 hover:text-primary cursor-pointer",
                                    showIndividualOptions &&
                                      "text-red-400 hover:text-red-500",
                                  )}
                                  onClick={() =>
                                    setShowIndividualOptions((p) => !p)
                                  }
                                >
                                  {showIndividualOptions ? (
                                    <X size="1em" />
                                  ) : (
                                    <Settings size="1em" />
                                  )}
                                </Button>
                              </div>
                              <AnimatePresence>
                                {showIndividualOptions && (
                                  <ConfigPanel
                                    key={`individual-config-panel-${seq.id}`}
                                    variant="individual"
                                    values={opts}
                                    syncFlags={opts.syncFlags}
                                    onChange={(k, v) =>
                                      handleIndividualChange(
                                        seq.id,
                                        k as any,
                                        v,
                                      )
                                    }
                                    onToggleSync={(k) =>
                                      toggleSync(seq.id, k, seq.sourceFile)
                                    }
                                    setShowIndividualOptions={
                                      setShowIndividualOptions
                                    }
                                  />
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="w-full min-w-[300px] h-[300px] flex flex-col items-center justify-center">
                              <TimelineCanvas
                                sequence={seq}
                                width={opts.width}
                                options={{
                                  video: opts.videoColor,
                                  adj: opts.adjColor,
                                  audio: opts.audioColor,
                                  transparentBg: opts.transparentBg,
                                }}
                                text={{
                                  title: opts.title,
                                  subtitle: opts.subtitle,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <div className="flex justify-center gap-4 mt-4">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
