export type VideoRoles = "director" | "camera" | "video_editor";
export type VideoTypes =
  | "long-form"
  | "short-form"
  | "motion-graphics"
  | "partial"
  | "cut"
  | "subtitles"
  | "unpublished"
  | "hidden"
  | string;
export type VideoCategories =
  | "gameplay"
  | "event"
  | "teaser"
  | "vlog"
  | "irl_content"
  | "short_film"
  | "music_video"
  | "promotional"
  | "compilation"
  | "other"
  | string;

export type VideoTag = string;

export interface VideoToml {
  date: string;
  title: string;
  description?: string;
  role: VideoRoles[];
  type: VideoTypes[];
  category: VideoCategories[];
  client: string;
  client_avatar: string;
  is_yt: boolean;
  src: string; // conditional || with fallback_src and ext_src to ensure there's always a value here
  fallback_src?: string;
  ext_src?: string;
  tags: VideoTag[];
}

export interface NonYtVideoData extends Omit<VideoToml, "date" | "is_yt"> {
  is_yt: false;
  date: Date;
  id: string;
  thumbnail: string;
  duration: string;
}

export interface YtVideoData extends Omit<VideoToml, "date" | "is_yt"> {
  is_yt: true;
  date: Date;
  id: string;
  thumbnail: string;
  duration: string;

  channel_src: string;
  subs: number;
  views: number;
  likes: number;
}

export type VideoData = YtVideoData | NonYtVideoData;
