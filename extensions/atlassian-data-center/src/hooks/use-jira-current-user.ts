import { showFailureToast, useCachedState } from "@raycast/utils";

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
      return;
    }

    if (queryResult.isSuccess) {
      showFailureToast(new Error("Expected response body, but got 204"), {
        title: "Failed to Load User",
      });
    }
  }, [queryResult.data]);

  return {
    ...queryResult,
    currentUser,
  };
}
