import { YtVideoData, NonYtVideoData, VideoData } from "./videos";

export interface BaseYtClient {
  total_views: number
  total_likes: number
}

export type YtClient = BaseYtClient & Pick<YtVideoData, "client_avatar" | "channel_src"> & {
  name: YtVideoData["client"]
  count: number;
  total_subs: number;
  videos: YtVideoData[]
}
export type NonYtClient = Pick<NonYtVideoData, "client_avatar"> & {
  name: NonYtVideoData["client"]
  count: number;
  videos: VideoData[]
}
export type ClientData = YtClient | NonYtClient
