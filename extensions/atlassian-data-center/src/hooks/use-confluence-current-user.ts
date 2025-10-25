import { useEffect } from "react";
import { showFailureToast, useCachedState } from "@raycast/utils";

import { useConfluenceCurrentUserQuery } from "@/hooks";
import { CACHE_KEY } from "@/constants";
import type { ConfluenceCurrentUser } from "@/types";

export function useConfluenceCurrentUser() {
  const [currentUser, setCurrentUser] = useCachedState<ConfluenceCurrentUser | null>(
    CACHE_KEY.CONFLUENCE_CURRENT_USER,
    null,
  );

  const queryResult = useConfluenceCurrentUserQuery({ enabled: !currentUser });

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
