import { Icon, Image } from "@raycast/api";

import { avatarCache } from "@/utils";
import {
  CONFLUENCE_ENTITY_TYPE,
  CONFLUENCE_SPACE_TYPE_LABEL,
  CONFLUENCE_TYPE_ICON,
  DEFAULT_AVATAR,
  CONFLUENCE_BASE_URL,
} from "@/constants";
import type { ConfluenceSearchResult, ConfluenceSpaceType, ProcessedConfluenceSpaceItem } from "@/types";

export function processConfluenceSearchSpaceItems(results: ConfluenceSearchResult[]): ProcessedConfluenceSpaceItem[] {
  return results
    .filter((result) => result.space && result.entityType === "space")
    .map((result) => processConfluenceSearchSpaceItem(result));
}

function processConfluenceSearchSpaceItem(result: ConfluenceSearchResult): ProcessedConfluenceSpaceItem {
  const space = result.space!;

  const spaceKey = space.key || "";
  const spaceType = space.type || "";

  const url = space._links?.webui ? `${CONFLUENCE_BASE_URL}${space._links.webui}` : "";

  const avatarUrl = space.icon.path ? `${CONFLUENCE_BASE_URL}${space.icon.path}` : "";
  const avatarCacheKey = spaceKey;
  const avatar = (avatarCacheKey && avatarCache.get(avatarCacheKey)) ?? DEFAULT_AVATAR;

  const isFavourited =
    space.metadata?.labels?.results?.some((label) => label.prefix === "my" && label.name === "favourite") ?? false;

  const icon = avatar
    ? {
        source: avatar,
        mask: Image.Mask.Circle,
      }
    : CONFLUENCE_TYPE_ICON[CONFLUENCE_ENTITY_TYPE.SPACE];

  const description = space.description?.plain?.value || "";
  const subtitle = {
    value: description || spaceKey,
    tooltip: description ? `Space Description: ${description}` : `Space Key: ${spaceKey}`,
  };
  const spaceTypeLabel = CONFLUENCE_SPACE_TYPE_LABEL[spaceType as ConfluenceSpaceType] ?? spaceType;
  const accessories = [
    ...(isFavourited
      ? [
          {
            icon: Icon.Star,
            tooltip: "My Favourite Space",
          },
        ]
      : []),
    {
      text: spaceTypeLabel,
      tooltip: `Space Type: ${spaceTypeLabel}`,
    },
  ];

  return {
    renderKey: space.key,
    title: space.name,
    key: space.key,
    name: space.name,
    icon,
    subtitle,
    accessories,
    url,
    avatarUrl,
    avatarCacheKey,
  };
}
