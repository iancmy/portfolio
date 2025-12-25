import { fetchGithubActivity, fetchRepositories } from "@/lib/api";
import { GHActivityDate } from "@/lib/types/github";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const githubKeys = {
  all: ["github"] as const,
  activity: () => [...githubKeys.all, "activity"] as const,
  repos: () => [...githubKeys.all, "repos"] as const,
};

export function useRepositories() {
  return useQuery({
    queryKey: githubKeys.repos(),
    queryFn: fetchRepositories,
  });
}

interface GithubActivityParams {
  year: GHActivityDate;
}

export function useGithubActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ year }: GithubActivityParams) => fetchGithubActivity(year),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: githubKeys.activity() });
      await queryClient.refetchQueries({ queryKey: githubKeys.activity() });
    },
  });
}
