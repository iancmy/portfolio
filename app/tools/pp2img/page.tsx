"use client";
import { motion, AnimatePresence } from "motion/react";
import {
  AudioLines,
  CaseUpper,
  Download,
  Film,
  Info,
  Loader2,
  OctagonAlert,
  RotateCcw,
  Settings2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parsePremiereXML, Sequence, Track } from "./pp-parser";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import InputColor from "@/components/ui/color-picker";
import { toKebabCase } from "@/lib/utils";
import { useClearState } from "@/lib/hooks/useClearState";

export default function Pp2Img() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [selectedSeq, setSelectedSeq] = useState<string | undefined>(undefined);
  const currSeq = useMemo(() => {
    if (!selectedSeq) return undefined;
    return sequences.filter((seq) => seq.id === selectedSeq)?.[0];
  }, [selectedSeq]);

  const [title, setTitle] = useState(files?.[0]?.name || "Untitled");
  const [subtitle, setSubtitle] = useState(currSeq?.name || "Untitled");
  const [videoColor, setVideoColor] = useState("#1C97E4");
  const [adjColor, setAdjColor] = useState("#B033C6");
  const [audioColor, setAudioColor] = useState("#7FAB5C");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [error, setError] = useClearState("");

  const onFileValidate = useCallback(
    (file: File) => {
      let message = "";

      if (files.length >= 1) {
        message = "You can only upload 1 file";
      }

      if (!file.name.toLowerCase().endsWith(".prproj")) {
        message = "Only .prproj files are allowed";
      }

      setError(message);
      return message;
    },
    [files],
  );

  const onFileReject = useCallback((file: File, message: string) => {
    console.error(
      `${message} : "${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected.`,
    );
  }, []);

  const processFile = async (file: File) => {
    setIsLoading(true);

    try {
      const ds = new DecompressionStream("gzip");
      const stream = file.stream().pipeThrough(ds);
      const response = new Response(stream);
      const text = await response.text();

      try {
        const parsedSequences = parsePremiereXML(text);
        setSequences(parsedSequences);
      } catch (e) {
        console.error("Parse error", e);
      }
    } catch (error) {
      console.error("Failed to decompress project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      processFile(files[0]);
      setTitle(files[0].name);
    }
  }, [files]);

  useEffect(() => {
    if (currSeq) setSubtitle(currSeq.name);
  }, [currSeq]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sequences.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const seq = currSeq;
    if (!seq) return;

    let maxVideoIndex = -1;
    let maxAudioIndex = -1;
    let maxDuration = 1;

    seq.tracks.forEach((t) => {
      if (t.type === "video") maxVideoIndex = Math.max(maxVideoIndex, t.index);
      if (t.type === "audio") maxAudioIndex = Math.max(maxAudioIndex, t.index);
      t.clips.forEach((c) => {
        if (c.end > maxDuration) maxDuration = c.end;
      });
    });

    const WIDTH = width;
    const LABEL_WIDTH = 50;
    const PADDING_RIGHT = 50;
    const TOP_PADDING = 80;
    const BOTTOM_PADDING = 40;
    const ROW_HEIGHT = 40;
    const TRACK_GAP = 4;
    const CENTER_GAP = 4;

    const videoCount = maxVideoIndex + 1;
    const audioCount = maxAudioIndex + 1;

    const videoSectionHeight = videoCount * (ROW_HEIGHT + TRACK_GAP);
    const audioSectionHeight = audioCount * (ROW_HEIGHT + TRACK_GAP);

    const totalHeight =
      TOP_PADDING +
      videoSectionHeight +
      CENTER_GAP +
      audioSectionHeight +
      BOTTOM_PADDING;

    setHeight(totalHeight);

    canvas.width = WIDTH;
    canvas.height = totalHeight;

    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, WIDTH, totalHeight);

    const centerX = WIDTH / 2;
    const centerY = totalHeight / 2;
    const maxRadius = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));

    const bgGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      maxRadius,
    );

    bgGradient.addColorStop(0, "#202020");
    bgGradient.addColorStop(1, "#151515");

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, WIDTH, totalHeight);

    const midY = TOP_PADDING + videoSectionHeight + CENTER_GAP / 2;
    const scaleX = (WIDTH - LABEL_WIDTH - PADDING_RIGHT) / maxDuration;

    for (let i = 0; i <= maxVideoIndex; i++) {
      const bottomY = midY - CENTER_GAP / 2 - i * (ROW_HEIGHT + TRACK_GAP);
      const y = bottomY - ROW_HEIGHT;
      const track = seq.tracks.find((t) => t.type === "video" && t.index === i);

      ctx.fillStyle = "#888";
      ctx.font = "12px JetBrains Mono";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`V${i + 1}`, LABEL_WIDTH - 10, y + ROW_HEIGHT / 2);

      drawTrack(ctx, track, y, ROW_HEIGHT, scaleX);
    }

    for (let i = 0; i <= maxAudioIndex; i++) {
      const y = midY + CENTER_GAP / 2 + i * (ROW_HEIGHT + TRACK_GAP);
      const track = seq.tracks.find((t) => t.type === "audio" && t.index === i);

      ctx.fillStyle = "#888";
      ctx.font = "12px JetBrains Mono";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`A${i + 1}`, LABEL_WIDTH - 10, y + ROW_HEIGHT / 2);

      drawTrack(ctx, track, y, ROW_HEIGHT, scaleX);
    }

    function drawTrack(
      context: CanvasRenderingContext2D,
      track: Track | undefined,
      y: number,
      h: number,
      scale: number,
    ) {
      context.fillStyle = "#2a2a2a";
      context.fillRect(LABEL_WIDTH, y, WIDTH - LABEL_WIDTH - PADDING_RIGHT, h);

      if (!track) return;

      const CLIP_GAP = 1;

      track.clips.forEach((clip) => {
        const startX = LABEL_WIDTH + clip.start * scale;
        const duration = clip.end - clip.start;
        const width = Math.max(duration * scale - CLIP_GAP, 1);
        const clipHeight = h - 4;
        const clipY = y + 2;

        if (clip.isAdjustmentLayer) context.fillStyle = adjColor;
        else if (track.type === "video") context.fillStyle = videoColor;
        else context.fillStyle = audioColor;

        const radius = 3;
        const safeRadius = Math.min(radius, width / 2, clipHeight / 2);

        context.beginPath();
        if (context.roundRect) {
          context.roundRect(startX, clipY, width, clipHeight, safeRadius);
        } else {
          context.rect(startX, clipY, width, clipHeight);
        }
        context.fill();
      });
    }

    const wmScale = 0.25;
    const wmWidth = 240 * wmScale;
    // const wmHeight = 234 * wmScale
    const wmMarginX = 20;
    const wmMarginY = 10;
    const drawWatermark = () => {
      const x = wmMarginX;
      const y = wmMarginY;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(wmScale, wmScale);

      const bgPath = new Path2D(
        "M42.5,0h155C221,0,240,19,240,42.5v149c0,23.5-19,42.5-42.5,42.5h-155C19,234,0,215,0,191.5v-149C0,19,19,0,42.5,0z",
      );
      const letterPath1 = new Path2D(
        "m57 164v-103c0-0.7 0.3-1.1 1-1.1 1.7 0 3.3 0 5.6-0.1 2.4-0.1 4.9-0.1 7.6-0.2s5.6-0.1 8.7-0.2 6.1-0.1 9.1-0.1c8.2 0 15 1 20.6 3.1 5 1.7 9.6 4.5 13.4 8.2 3.2 3.2 5.7 7.1 7.3 11.4 1.5 4.2 2.3 8.5 2.3 13 0 8.6-2 15.7-6 21.3s-9.6 9.8-16.1 12.2c-6.8 2.5-14.3 3.4-22.5 3.4-2.4 0-4 0-5-0.1s-2.4-0.1-4.3-0.1v32.1c0.1 0.7-0.4 1.3-1.1 1.4h-0.4-19c-0.8 0-1.2-0.4-1.2-1.3zm21.8-84.7v33.6c1.4 0.1 2.7 0.2 3.9 0.2h5.3c3.9 0 7.8-0.6 11.5-1.8 3.2-0.9 6-2.8 8.2-5.3 2.1-2.5 3.1-5.9 3.1-10.3 0.1-3.1-0.7-6.2-2.3-8.9-1.7-2.6-4.1-4.6-7-5.7-3.7-1.5-7.7-2.1-11.8-2-2.6 0-4.9 0-6.8 0.1-2-0.1-3.4 0-4.1 0.1z",
      );
      const letterPath2 = new Path2D(
        "m147 85.2h17.5c1 0 1.8 0.7 2.1 1.6 0.3 0.8 0.5 1.6 0.6 2.5 0.2 1 0.4 2.1 0.5 3.1 0.1 1.1 0.2 2.3 0.2 3.6 3-3.5 6.6-6.4 10.7-8.6 4.6-2.6 9.9-3.9 15.2-3.9 0.7-0.1 1.3 0.4 1.4 1.1v0.4 19.5c0 0.8-0.5 1.1-1.6 1.1-3.6-0.1-7.3 0.2-10.8 1-2.9 0.6-5.7 1.5-8.4 2.7-1.9 0.9-3.7 2.1-5.1 3.7v51c0 1-0.4 1.4-1.3 1.4h-19.7c-0.8 0.1-1.5-0.4-1.6-1.2v-0.4-55.4c0-2.4 0-4.9-0.1-7.5s-0.1-5.2-0.2-7.8c0-2.3-0.2-4.5-0.4-6.8-0.1-0.5 0.2-1 0.7-1.1 0-0.1 0.2-0.1 0.3 0z",
      );

      ctx.fillStyle = "#00005B";
      ctx.fill(bgPath);

      ctx.fillStyle = "#9999FF";
      ctx.fill(letterPath1);
      ctx.fill(letterPath2);

      ctx.restore();
    };

    drawWatermark();

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "white";
    ctx.font = "bold 24px JetBrains Mono";
    ctx.fillText(title, wmWidth + wmMarginX + 10, 40);
    ctx.font = "italic 18px JetBrains Mono";
    ctx.fillText(subtitle, wmWidth + wmMarginX + 15, 60);
  }, [
    sequences,
    currSeq,
    videoColor,
    adjColor,
    audioColor,
    title,
    subtitle,
    width,
    setHeight,
    files,
  ]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Pp2ImgIcon className="w-24 h-24" />
      <div className="flex flex-col gap-2">
        <p className="font-title text-2xl">Premiere to Image</p>
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
          onFileReject={onFileReject}
          accept=".prproj"
          maxFiles={1}
          className="w-full max-w-xl"
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
                  Or click to browse
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
          <AnimatePresence>
            {!!error && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="self-center text-xs text-red-500 flex gap-1 items-center"
              >
                <X size="1em" />
                {error}
              </motion.span>
            )}
          </AnimatePresence>
          <FileUploadList>
            {files.map((file) => (
              <FileUploadItem key={file.name} value={file}>
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 cursor-pointer"
                    onClick={() => {
                      setSequences([]);
                      setSelectedSeq(undefined);
                    }}
                  >
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading project file...</span>
          </div>
        )}

        {sequences.length > 0 ? (
          <ButtonGroup className="flex w-full">
            <ButtonGroupText>Sequence: </ButtonGroupText>
            <Select value={selectedSeq} onValueChange={setSelectedSeq}>
              <SelectTrigger className="w-full grow">
                <SelectValue placeholder="Select a sequence" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sequences</SelectLabel>
                  {sequences
                    .filter((s) => !!s.id && !!s.name)
                    .map((sequence, i) => {
                      return (
                        <SelectItem
                          key={sequence.id || `unnamed-sequence-${i}`}
                          value={sequence.id || `unnamed-sequence-${i}`}
                        >
                          {sequence.name || `unnamed-sequence-${i}`}
                        </SelectItem>
                      );
                    })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </ButtonGroup>
        ) : (
          <p className="text-muted-foreground text-sm flex gap-2 items-center justify-center">
            <OctagonAlert size="1em" />
            <span>No available sequence</span>
          </p>
        )}

        {sequences.length > 0 && !!selectedSeq && (
          <div className="flex flex-col p-4 rounded-md bg-muted/20 gap-2">
            <p className="font-title text-md font-bold">Options</p>
            <ButtonGroup className="w-full">
              <ButtonGroupText asChild>
                <Label htmlFor="title" className="!text-xs">
                  Title
                </Label>
              </ButtonGroupText>
              <InputGroup className="grow">
                <InputGroupInput
                  id="title"
                  value={title}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  className="!text-xs"
                />
                <InputGroupAddon align="inline-end">
                  <CaseUpper />
                </InputGroupAddon>
              </InputGroup>
            </ButtonGroup>
            <ButtonGroup className="w-full">
              <ButtonGroupText asChild>
                <Label htmlFor="subtitle" className="!text-xs">
                  Subtitle
                </Label>
              </ButtonGroupText>
              <InputGroup className="grow">
                <InputGroupInput
                  id="subtitle"
                  value={subtitle}
                  onInput={(e) => setSubtitle(e.currentTarget.value)}
                  className="!text-xs"
                />
                <InputGroupAddon align="inline-end">
                  <CaseUpper />
                </InputGroupAddon>
              </InputGroup>
            </ButtonGroup>
            <ButtonGroup className="w-full">
              <ButtonGroupText className="text-xs">Size</ButtonGroupText>
              <Select
                value={width.toString()}
                onValueChange={(v) => setWidth(parseInt(v))}
              >
                <SelectTrigger className="w-full grow text-xs">
                  <SelectValue placeholder="Select image size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sizes</SelectLabel>
                    <SelectItem key="4k" value="3840">
                      4k
                    </SelectItem>
                    <SelectItem key="1080p" value="1920">
                      1080p
                    </SelectItem>
                    <SelectItem key="720p" value="1280">
                      720p
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </ButtonGroup>
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-2 w-full items-center">
                <InputColor
                  value={videoColor}
                  onChange={setVideoColor}
                  className="cursor-pointer rounded-md"
                />
                <Film className="" size="1em" />
                <span className="text-xs">Video Clips</span>
              </div>
              <div className="flex gap-2 w-full items-center">
                <InputColor
                  value={adjColor}
                  onChange={setAdjColor}
                  className="cursor-pointer rounded-md"
                />
                <Settings2 className="" size="1em" />
                <span className="text-xs">Adj. / Graphics Layers</span>
              </div>
              <div className="flex gap-2 w-full items-center">
                <InputColor
                  value={audioColor}
                  onChange={setAudioColor}
                  className="cursor-pointer rounded-md"
                />
                <AudioLines className="" size="1em" />
                <span className="text-xs">Audio Clips</span>
              </div>
            </div>
          </div>
        )}

        {sequences.length > 0 && !!selectedSeq && (
          <div className="flex flex-col gap-2 w-full max-w-4xl mt-4">
            <p className="font-bold font-title text-md">Timeline Preview</p>
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={8}
              centerOnInit
              centerZoomedOut
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div className="border rounded-lg overflow-hidden shadow-xl bg-black relative group">
                  <div className="absolute bottom-4 right-4 z-10 flex gap-1 bg-black/50 p-1 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => zoomIn()}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => zoomOut()}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => resetTransform()}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.download = `timeline-${toKebabCase(title)}-${toKebabCase(subtitle)}.png`;
                        link.href = canvasRef.current?.toDataURL() || "";
                        link.click();
                      }}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <TransformComponent
                    wrapperClass="!w-full !h-full"
                    contentClass="!w-full !h-full"
                    wrapperStyle={{ aspectRatio: width / height }}
                    contentStyle={{ aspectRatio: width / height }}
                  >
                    <div
                      className="w-full bg-[#1e1e1e]"
                      style={{ aspectRatio: width / height }}
                    >
                      <canvas
                        ref={canvasRef}
                        width={width}
                        height={height}
                        className="w-full h-full object-contain block"
                      />
                    </div>
                  </TransformComponent>
                </div>
              )}
            </TransformWrapper>
          </div>
        )}
      </div>
    </div>
  );
}
