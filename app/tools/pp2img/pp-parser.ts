import { toKebabCase } from "@/lib/utils";

export interface Clip {
  name: string;
  start: number;
  end: number;
  isAdjustmentLayer: boolean;
}

export interface Track {
  type: "video" | "audio";
  index: number;
  clips: Clip[];
}

export interface Sequence {
  id: string;
  name: string;
  tracks: Track[];
}

export function parsePremiereXML(xmlString: string): Sequence[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const sequenceMap = new Map<string, Sequence>();

  const nodeMap = new Map<string, Element>();

  const query = [
    "VideoTrackGroup", "AudioTrackGroup",
    "VideoClipTrack", "AudioClipTrack",
    "VideoClipTrackItem", "AudioClipTrackItem",
    "SubClip",
    "VideoClip", "AudioClip"
  ].join(",");

  doc.querySelectorAll(query).forEach((el) => {
    const id = el.getAttribute("ObjectID") || el.getAttribute("ObjectUID");
    if (id) nodeMap.set(id, el);
  });

  const sequences = doc.querySelectorAll("Sequence[ObjectUID]");

  sequences.forEach((seq) => {
    const seqName = seq.querySelector("Name")?.textContent || "Untitled";
    const id = toKebabCase(seqName)
    const trackMap = new Map<string, Track>();

    seq.querySelectorAll("TrackGroup").forEach((tg) => {
      const groupRef = tg.querySelector("Second")?.getAttribute("ObjectRef");
      const trackGroup = groupRef ? nodeMap.get(groupRef) : null;
      if (!trackGroup) return;

      trackGroup.querySelectorAll("Track[ObjectURef]").forEach((trackRef) => {
        const uRef = trackRef.getAttribute("ObjectURef");
        const clipTrack = uRef ? nodeMap.get(uRef) : null;
        if (!clipTrack) return;

        const index = parseInt(trackRef.getAttribute("Index") || "0", 10);
        const type = clipTrack.tagName.startsWith("Video") ? "video" : "audio";
        const clips: Clip[] = [];

        clipTrack.querySelectorAll("TrackItem").forEach((item) => {
          const itemRef = item.getAttribute("ObjectRef");
          const itemNode = itemRef ? nodeMap.get(itemRef) : null;
          if (!itemNode) return;

          const subClipRef = itemNode.querySelector("SubClip")?.getAttribute("ObjectRef");
          const subClipNode = subClipRef ? nodeMap.get(subClipRef) : null;

          let isAdjustmentLayer = false;

          if (subClipNode) {
            const sourceClipRef = subClipNode.querySelector("Clip")?.getAttribute("ObjectRef");
            const sourceClipNode = sourceClipRef ? nodeMap.get(sourceClipRef) : null;

            if (sourceClipNode) {
              const adjTag = sourceClipNode.querySelector("AdjustmentLayer");
              if (adjTag && adjTag.textContent === "true") {
                isAdjustmentLayer = true;
              }
            }
          }

          clips.push({
            name: subClipNode?.querySelector("Name")?.textContent || "Untitled",
            start: parseInt(itemNode.querySelector("Start")?.textContent || "0", 10),
            end: parseInt(itemNode.querySelector("End")?.textContent || "0", 10),
            isAdjustmentLayer,
          });
        });

        const uniqueKey = `${type}-${index}`;
        const existingTrack = trackMap.get(uniqueKey);

        if (existingTrack) {
          existingTrack.clips.push(...clips);
        } else {
          trackMap.set(uniqueKey, { index, type, clips });
        }
      });
    });

    const consolidatedTracks = Array.from(trackMap.values());

    consolidatedTracks.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'video' ? -1 : 1;
        return a.index - b.index;
    });

    if (sequenceMap.has(seqName)) {
      const existingSeq = sequenceMap.get(seqName)!;
      consolidatedTracks.forEach(newT => {
        const match = existingSeq.tracks.find(t => t.index === newT.index && t.type === newT.type);
        if (match) match.clips.push(...newT.clips);
        else existingSeq.tracks.push(newT);
      });
    } else {
      sequenceMap.set(seqName, { id, name: seqName, tracks: consolidatedTracks });
    }
  });

  return Array.from(sequenceMap.values());
}
