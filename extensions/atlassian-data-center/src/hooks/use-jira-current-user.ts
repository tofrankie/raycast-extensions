import { useCachedState } from "@raycast/utils";

import { useJiraCurrentUserQuery } from "@/hooks";
import { CACHED_STATE_KEY } from "@/constants";
import type { JiraCurrentUser } from "@/types";
import { useEffect } from "react";

export function useJiraCurrentUser() {
  const [currentUser, setCurrentUser] = useCachedState<JiraCurrentUser | null>(
    CACHED_STATE_KEY.JIRA_CURRENT_USER,
    null,
  );

  const queryResult = useJiraCurrentUserQuery({ enabled: !currentUser });

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
