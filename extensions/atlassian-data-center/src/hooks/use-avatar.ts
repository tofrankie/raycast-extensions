import { useMemo } from "react";
import { useQueries, type UseQueryOptions } from "@tanstack/react-query";

import { avatarCache, downloadAvatar } from "@/utils";
import { CURRENT_APP_TYPE, CURRENT_PAT } from "@/constants";
import type { AvatarList, AvatarType } from "@/types";

type UseAvatarOptions<T> = {
  items: T[];
  avatarType: AvatarType;
  collectAvatars: (items: T[]) => AvatarList;
};

type AvatarQueryKey = readonly [
  {
    scope: string;
    entity: "avatar";
    type: AvatarType;
    url: string;
    key: string;
  },
];

type AvatarQueryOptions = UseQueryOptions<string, Error, string, AvatarQueryKey>;

export function useAvatar<T>({ items, avatarType, collectAvatars }: UseAvatarOptions<T>) {
  const avatarList = useMemo(() => collectAvatars(items), [items, collectAvatars]);

  const uniqueList = useMemo(() => {
    return avatarList.filter(
      (item, index, self) => !avatarCache.has(item.key) && self.findIndex((a) => a.url === item.url) === index,
    );
  }, [avatarList]);

  useQueries({
    queries: uniqueList.map(
      (item): AvatarQueryOptions => ({
        queryKey: [{ scope: CURRENT_APP_TYPE, entity: "avatar", type: avatarType, url: item.url, key: item.key }],
        queryFn: ({ queryKey }) => {
          const [{ type, url, key }] = queryKey;
          return downloadAvatar({ token: CURRENT_PAT, type, url, key });
        },
        staleTime: Infinity,
        gcTime: Infinity,
      }),
    ),
    combine: (results) => results.filter((result) => result.isSuccess).length,
  });
}
