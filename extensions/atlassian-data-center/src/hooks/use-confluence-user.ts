import { useEffect } from "react";
import { useCachedState } from "@raycast/utils";
import { useQuery } from "@tanstack/react-query";

import { getConfluenceCurrentUser } from "@/utils";
import { CACHE_KEY } from "@/constants";
import type { ConfluenceCurrentUser, QueryOptions } from "@/types";

export function useConfluenceCurrentUser() {
  const [currentUser, setCurrentUser] = useCachedState<ConfluenceCurrentUser | null>(
    CACHE_KEY.CONFLUENCE_CURRENT_USER,
    null,
  );

  const queryResult = useConfluenceCurrentUserQuery({
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

function useConfluenceCurrentUserQuery<TSelect = ConfluenceCurrentUser | null>(
  options?: QueryOptions<ConfluenceCurrentUser | null, TSelect>,
) {
  return useQuery<ConfluenceCurrentUser | null, Error, TSelect>({
    queryKey: ["confluence-current-user"],
    queryFn: getConfluenceCurrentUser,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}
