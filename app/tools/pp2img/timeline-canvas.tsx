import { useEffect, useRef } from "react";
import { drawSequence } from "./utils";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { toKebabCase } from "@/lib/utils";
import { Sequence } from "./pp-parser";

export function TimelineCanvas({
  sequence,
  width,
  options,
  text,
}: {
  sequence: Sequence;
  width: number;
  options: {
    video: string;
    adj: string;
    audio: string;
    transparentBg: boolean;
  };
  text: { title: string; subtitle: string };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && sequence) {
      drawSequence(canvasRef.current, sequence, width, options, text);
    }
  }, [sequence, width, options, text]);

  return (
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={8}
        centerOnInit
        centerZoomedOut
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <div data-canvas-wrapper className="border rounded-lg shadow-xl bg-black/10 relative group w-full h-full">
            {options.transparentBg && (
              <div
                className="absolute inset-0 -z-10 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(#888 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            )}
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
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => {
                  const link = document.createElement("a");
                  link.download = `${sequence.id}.png`;
                  link.href = canvasRef.current?.toDataURL() || "";
                  link.click();
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full"
            >
              <div
                className={`grow w-full h-full flex items-center justify-center`}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain shadow-sm"
                />
              </div>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
  );
}
