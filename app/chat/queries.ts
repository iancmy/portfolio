import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChat, sendChat, endChat, checkChatStatus } from "@/lib/api";
import { ChatStatus } from "@/lib/types";

export const chatKeys = {
  all: ["chat"] as const,
  status: () => [...chatKeys.all, "status"] as const,
  messages: () => [...chatKeys.all, "messages"] as const,
};

export function useChatStatus() {
  return useQuery<ChatStatus>({
    queryKey: chatKeys.status(),
    queryFn: checkChatStatus,
    staleTime: 0,
    refetchInterval: 30 * 1000, // every 30s
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    initialData: { status: "offline" },
  });
}

export function useChatMessages() {
  return useQuery({
    queryKey: chatKeys.messages(),
    queryFn: getChat,
    refetchInterval: 5 * 1000,
    refetchOnWindowFocus: true,
  });
}

interface SendChatParams {
  message: string;
  name: string;
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ message, name }: SendChatParams) => sendChat(message, name),
    onMutate: (chatMessage) => {
      const data = {
        text: chatMessage.message,
        name: chatMessage.name,
        isUser: true,
      };

      queryClient.setQueryData(
        chatKeys.messages(),
        (oldData: SendChatParams[]) => {
          return [...(oldData || []), data];
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
      await queryClient.refetchQueries({ queryKey: chatKeys.messages() });
    },
  });
}

export function useEndChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endChat,
    onMutate: () => {
      queryClient.setQueryData(chatKeys.messages(), () => []);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.all });
      await queryClient.refetchQueries({ queryKey: chatKeys.all });
    },
  });
}
