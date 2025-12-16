import { Sequence, Track } from "./pp-parser";

export function drawSequence(
  canvas: HTMLCanvasElement,
  seq: Sequence,
  width: number,
  options: {
    video: string;
    adj: string;
    audio: string;
    transparentBg: boolean;
  },
  text: { title: string; subtitle: string },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let maxVideoIndex = -1;
  let maxAudioIndex = -1;
  let maxDuration = 1;
  let minStartTime = Infinity;

  seq.tracks.forEach((t) => {
    if (t.type === "video") maxVideoIndex = Math.max(maxVideoIndex, t.index);
    if (t.type === "audio") maxAudioIndex = Math.max(maxAudioIndex, t.index);
    t.clips.forEach((c) => {
      if (c.end > maxDuration) maxDuration = c.end;
      if (c.start < minStartTime) minStartTime = c.start;
    });
  });

  if (minStartTime === Infinity) minStartTime = 0;

  const visibleDuration = maxDuration - minStartTime;
  if (visibleDuration <= 0) return; // do not do empty sequences

  const WIDTH = width;
  const LABEL_WIDTH = 60;
  const PADDING_RIGHT = 50;
  const TOP_PADDING = 120;
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

  canvas.width = WIDTH;
  canvas.height = totalHeight;

  // background
  if (!options.transparentBg) {
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
  } else {
    ctx.clearRect(0, 0, WIDTH, totalHeight);
  }

  const midY = TOP_PADDING + videoSectionHeight + CENTER_GAP / 2;
  const scaleX = (WIDTH - LABEL_WIDTH - PADDING_RIGHT) / visibleDuration;

  // timecode ruler
  if (!options.transparentBg) {
    ctx.fillStyle = "#111";
    ctx.fillRect(
      LABEL_WIDTH,
      TOP_PADDING - 25,
      WIDTH - LABEL_WIDTH - PADDING_RIGHT,
      20,
    );
  }

  ctx.fillStyle = "#666";
  ctx.font = "10px JetBrains Mono";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  let interval = 60;
  if (visibleDuration < 60) interval = 5;
  else if (visibleDuration < 600) interval = 30;

  for (let t = 0; t <= visibleDuration; t += interval) {
    const x = LABEL_WIDTH + t * scaleX;
    ctx.fillRect(Math.floor(x), TOP_PADDING - 10, 1, 5);

    const absoluteTime = minStartTime + t;
    const minutes = Math.floor(absoluteTime / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(absoluteTime % 60)
      .toString()
      .padStart(2, "0");

    ctx.fillStyle = "#888";
    ctx.fillText(`${minutes}:${seconds}`, x, TOP_PADDING - 12);
    ctx.fillStyle = "#666";
  }

  // tracks
  const drawTrack = (
    context: CanvasRenderingContext2D,
    track: Track | undefined,
    y: number,
    h: number,
    scale: number,
  ) => {
    context.fillStyle = options.transparentBg
      ? "rgba(42,42,42,0.8)"
      : "#2a2a2a";
    context.fillRect(LABEL_WIDTH, y, WIDTH - LABEL_WIDTH - PADDING_RIGHT, h);
    if (!track) return;

    const CLIP_GAP = 1;
    track.clips.forEach((clip) => {
      const startX = LABEL_WIDTH + (clip.start - minStartTime) * scale;
      const duration = clip.end - clip.start;
      const w = Math.max(duration * scale - CLIP_GAP, 1);
      const clipHeight = h - 4;
      const clipY = y + 2;

      if (clip.isAdjustmentLayer) context.fillStyle = options.adj;
      else if (track.type === "video") context.fillStyle = options.video;
      else context.fillStyle = options.audio;

      const radius = 3;
      const safeRadius = Math.min(radius, w / 2, clipHeight / 2);

      context.beginPath();
      if (context.roundRect) {
        context.roundRect(startX, clipY, w, clipHeight, safeRadius);
      } else {
        context.rect(startX, clipY, w, clipHeight);
      }
      context.fill();
    });
  };

  for (let i = 0; i <= maxVideoIndex; i++) {
    const bottomY = midY - CENTER_GAP / 2 - i * (ROW_HEIGHT + TRACK_GAP);
    const y = bottomY - ROW_HEIGHT;
    const track = seq.tracks.find((t) => t.type === "video" && t.index === i);

    ctx.fillStyle = "#888";
    ctx.font = "12px JetBrains Mono";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const label = track?.name || `V${i + 1}`;
    ctx.fillText(label.substring(0, 8), LABEL_WIDTH - 10, y + ROW_HEIGHT / 2);

    drawTrack(ctx, track, y, ROW_HEIGHT, scaleX);
  }

  for (let i = 0; i <= maxAudioIndex; i++) {
    const y = midY + CENTER_GAP / 2 + i * (ROW_HEIGHT + TRACK_GAP);
    const track = seq.tracks.find((t) => t.type === "audio" && t.index === i);

    ctx.fillStyle = "#888";
    ctx.font = "12px JetBrains Mono";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const label = track?.name || `A${i + 1}`;
    ctx.fillText(label.substring(0, 8), LABEL_WIDTH - 10, y + ROW_HEIGHT / 2);

    drawTrack(ctx, track, y, ROW_HEIGHT, scaleX);
  }

  // premiere pro logo
  const wmScale = 0.25;
  const wmWidth = 240 * wmScale;
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

  // title
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "white"
  ctx.font = "bold 24px JetBrains Mono";
  ctx.fillText(text.title, wmWidth + wmMarginX + 10, 40);
  ctx.font = "italic 18px JetBrains Mono";
  ctx.fillText(text.subtitle, wmWidth + wmMarginX + 10, 60);
}
