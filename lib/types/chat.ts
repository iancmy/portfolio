export interface ChatStatus {
  status: "online" | "offline";
}

export type ChatTimestamp = string;

export interface ChatMessage {
  text: string;
  name: string;
  isUser: boolean;
  ts: ChatTimestamp;
}

export type ChatMessages = ChatMessage[]
