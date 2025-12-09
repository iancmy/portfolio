"use client";

import { Status, StatusIndicator } from "@/components/kibo-ui/status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import TypewriterTitle, {
  TypewriterSequence,
} from "@/components/ui/type-writer";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChatInfoStore } from "./store";
import {
  useChatMessages,
  useChatStatus,
  useEndChatSession,
  useSendChatMessage,
} from "./queries";
import { AtSign, Send, UserPen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Spinner } from "@/components/ui/spinner";
import DiscordIcon from "@/components/icons/discord";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTimeoutState } from "@/lib/hooks/useTimeoutState";
import { cn } from "@/lib/utils";

const NAME_CHAR_LIMIT = 20;
const MSG_CHAR_LIMIT = 300;

const DISCORD = "@domnc";
const EMAIL = "ianalbert.c@gmail.com";

export default function Chat() {
  const chatStatusQ = useChatStatus();

  const { data: messages = [] } = useChatMessages();
  const { mutate: sendMessage, isPending } = useSendChatMessage();
  const { mutate: endChat } = useEndChatSession();

  const chatStatusMsgSequence = useMemo(() => {
    const sequence: TypewriterSequence[] = [];

    if (chatStatusQ.data.status === "online") {
      sequence.push(
        {
          text: "I am online right now.",
          pauseAfter: 500,
        },
        {
          text: "Feel free to message me below!",
          pauseAfter: 500,
        },
      );
    } else {
      sequence.push(
        {
          text: "I am offline at the moment...",
          pauseAfter: 500,
        },
        {
          text: "You can still leave a message below.",
          pauseAfter: 500,
        },
        {
          text: "I will reply as soon as I can!",
          pauseAfter: 500,
        },
      );
    }

    return sequence;
  }, [chatStatusQ.data.status]);

  const { name, setName } = useChatInfoStore();
  const [nameValue, setNameValue] = useState("");
  const [changeName, setChangeName] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messageInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const [discordCopied, setDiscordCopied] = useTimeoutState(false, 1000);
  const [emailCopied, setEmailCopied] = useTimeoutState(false, 1000);

  return (
    <div className="relative w-full flex flex-col items-center justify-start gap-4 px-4 lg:max-w-xl">
      <div className="w-full flex gap-4 items-center">
        <div className="self-start w-12 aspect-square drop-shadow-xs relative">
          <Avatar className="w-full h-full">
            <AvatarImage
              src="/images/dom-pixel.png"
              alt="dom-logo"
              className="object-cover w-full h-full"
            />
            <AvatarFallback>I</AvatarFallback>
          </Avatar>
          <Status
            className="text-xs absolute z-50 bottom-0 right-1 pointer-events-none bg-background p-0"
            status={chatStatusQ.data.status}
            variant="none"
          >
            <StatusIndicator />
          </Status>
        </div>
        <TypewriterTitle
          sequences={chatStatusMsgSequence}
          typingSpeed={75}
          loopDelay={0}
          className="font-body self-end text-xs lg:text-sm"
        />
      </div>
      <div className="w-full flex gap-4 items-center px-4">
        <Tooltip open={discordCopied}>
          <TooltipContent className="text-xs shadow-md">Copied!</TooltipContent>
          <TooltipTrigger asChild>
            <p
              className="flex gap-2 items-center text-xs text-muted-foreground cursor-pointer"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await navigator.clipboard.writeText(DISCORD);
                  setDiscordCopied(true);
                } catch (err) {
                  console.error("Failed to copy username:", err);
                }
              }}
            >
              <DiscordIcon className="w-4 h-4" />
              <span>{DISCORD}</span>
            </p>
          </TooltipTrigger>
        </Tooltip>
        <Tooltip open={emailCopied}>
          <TooltipContent className="text-xs shadow-md">Copied!</TooltipContent>
          <TooltipTrigger asChild>
            <p
              className="flex gap-2 items-center text-xs text-muted-foreground cursor-pointer"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await navigator.clipboard.writeText(EMAIL);
                  setEmailCopied(true);
                } catch (err) {
                  console.error("Failed to copy username:", err);
                }
              }}
            >
              <AtSign className="w-4 h-4" />
              <span>{EMAIL}</span>
            </p>
          </TooltipTrigger>
        </Tooltip>
      </div>
      <div className="flex grow flex-col w-full bg-primary/5 rounded-md h-96 p-4 gap-4 border border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          <div className="flex gap-2 items-center">
            {chatStatusQ.data.status === "online" ? (
              <span>Live Chat</span>
            ) : (
              <span>Offline</span>
            )}
          </div>
          {messages.length > 0 ? (
            <p
              className="text-xs text-red-500 cursor-pointer flex gap-2 items-center font-bold"
              onClick={() => endChat()}
            >
              <span>End</span>
              <X size="1em" />
            </p>
          ) : (
            <Status
              className="pointer-events-none"
              status={chatStatusQ.data.status}
              variant="none"
            >
              <StatusIndicator />
            </Status>
          )}
        </div>
        <ScrollArea className="flex-grow h-40">
          <div className="flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-xs text-muted-foreground mt-10 italic">
                No messages yet.
              </div>
            )}
            {messages.map((msg, i) => {
              const isUser = msg.isUser;
              return (
                <div
                  key={msg.ts || `msg-${i}`}
                  className={cn(
                    "flex w-max max-w-72 flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                    isUser
                      ? "ml-auto bg-primary text-primary-foreground self-end"
                      : "bg-muted self-start",
                  )}
                >
                  <span className="break-words">{msg.text}</span>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="mt-auto flex gap-2">
          {!name || changeName ? (
            <form
              className="flex w-full gap-2 animate-in fade-in slide-in-from-bottom-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (changeName) setChangeName(false);
                if (nameValue !== name) endChat();
                setName(nameValue);
              }}
            >
              <InputGroup className="text-xs lg:text-sm">
                <InputGroupInput
                  name="name"
                  placeholder={
                    changeName
                      ? "Change your name to..."
                      : "Enter your name to chat..."
                  }
                  onInput={(e) => {
                    let value = e.currentTarget.value;
                    const inputLength = value.length || 0;
                    if (inputLength > NAME_CHAR_LIMIT) {
                      value = value.substring(0, inputLength - 1);
                    }

                    e.currentTarget.value = value;
                    setNameValue(value);
                  }}
                  value={nameValue}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText className="text-xs font-title">
                    {nameValue.length || 0}/{NAME_CHAR_LIMIT}
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton variant="ghost" type="submit">
                    {isPending ? <Spinner /> : <Send />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          ) : (
            <form
              className="flex w-full gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage({ message: inputValue, name });
                setInputValue("");
                messageInputRef.current?.focus();
              }}
            >
              <ButtonGroup className="text-xs lg:text-sm w-full">
                <InputGroup>
                  <InputGroupInput
                    ref={messageInputRef}
                    placeholder={`Speaking as ${name}...`}
                    value={inputValue}
                    onInput={(e) => {
                      let value = e.currentTarget.value;
                      const inputLength = value.length || 0;
                      if (inputLength > MSG_CHAR_LIMIT) {
                        value = value.substring(0, inputLength - 1);
                      }

                      e.currentTarget.value = value;
                      setInputValue(value);
                    }}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText className="text-xs font-title">
                      {inputValue.length || 0}/{MSG_CHAR_LIMIT}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  type="button"
                  onClick={() => setChangeName(true)}
                >
                  <UserPen />
                </Button>
                <Button
                  variant="outline"
                  type="submit"
                  size="icon"
                  className="cursor-pointer"
                >
                  {isPending ? <Spinner /> : <Send />}
                </Button>
              </ButtonGroup>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
