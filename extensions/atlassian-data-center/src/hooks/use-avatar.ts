import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { CURRENT_APP_TYPE, CURRENT_PAT } from "@/constants";
import { avatarCache, downloadAvatar } from "@/utils";
import type { AvatarList, AvatarType } from "@/types";

type UseAvatarOptions<T> = {
  items: T[];
  avatarType: AvatarType;
  extractAvatarData: (items: T[]) => AvatarList;
};

export function useAvatar<T>(options: UseAvatarOptions<T>) {
  const { items, extractAvatarData, avatarType } = options;

  const avatarList = useMemo(() => extractAvatarData(items), [items, extractAvatarData]);

  const uniqueList = useMemo(() => {
    return avatarList.filter(
      (item, index, self) => !avatarCache.has(item.key) && self.findIndex((a) => a.url === item.url) === index,
    );
  }, [avatarList]);

  const queries = useMemo(() => {
    return uniqueList.map((item) => ({
      queryKey: [`${CURRENT_APP_TYPE}-avatar`, { url: item.url }],
      queryFn: async () => {
        return downloadAvatar({
          token: CURRENT_PAT,
          type: avatarType,
          url: item.url,
          key: item.key,
        });
      },
      staleTime: Infinity,
      gcTime: Infinity,
    }));
  }, [uniqueList]);

  useQueries({ queries });
}
