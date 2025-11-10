import { useEffect } from "react";
import { useCachedState } from "@raycast/utils";
import { useQuery } from "@tanstack/react-query";

import { getJiraCurrentUser } from "@/utils";
import { CACHE_KEY } from "@/constants";
import type { JiraCurrentUser, QueryOptions } from "@/types";

export function useJiraCurrentUserQuery<TSelect = JiraCurrentUser | null>(
  options?: QueryOptions<JiraCurrentUser | null, TSelect>,
) {
  return useQuery<JiraCurrentUser | null, Error, TSelect>({
    queryKey: ["jira-current-user"],
    queryFn: getJiraCurrentUser,
    ...options,
  });
}

export function useJiraCurrentUser() {
  const [currentUser, setCurrentUser] = useCachedState<JiraCurrentUser | null>(CACHE_KEY.JIRA_CURRENT_USER, null);

  const queryResult = useJiraCurrentUserQuery({
    enabled: !currentUser,
    meta: { errorMessage: "Failed to Load User" },
  });

  useEffect(() => {
    if (queryResult.data) {
      setCurrentUser(queryResult.data);
    }
  }, [queryResult.data]);

  return {
    ...queryResult,
    currentUser,
  };
}
