import type {
  AvatarList,
  ProcessedConfluenceUser,
  ProcessedConfluenceSpace,
  ProcessedConfluenceContent,
} from "@/types";

export const extractConfluenceUserAvatar = <T extends { avatarUrl: string; avatarCacheKey?: string }>(
  items: T[],
): AvatarList =>
  items
    .filter((item) => item.avatarUrl && item.avatarCacheKey)
    .map((item) => ({ url: item.avatarUrl, key: item.avatarCacheKey! }));

export const extractConfluenceCreatorAvatar = <T extends { creatorAvatarUrl: string; creatorAvatarCacheKey?: string }>(
  items: T[],
): AvatarList =>
  items
    .filter((item) => item.creatorAvatarUrl && item.creatorAvatarCacheKey)
    .map((item) => ({ url: item.creatorAvatarUrl, key: item.creatorAvatarCacheKey! }));

export const extractJiraNotificationUserAvatar = <
  T extends { actionMakerAvatarUrl: string; actionMakerAvatarCacheKey?: string },
>(
  items: T[],
): AvatarList =>
  items
    .filter((item) => item.actionMakerAvatarUrl && item.actionMakerAvatarCacheKey)
    .map((item) => ({ url: item.actionMakerAvatarUrl, key: item.actionMakerAvatarCacheKey! }));

export const avatarExtractors = {
  confluenceUser: (items: ProcessedConfluenceUser[]): AvatarList => extractConfluenceUserAvatar(items),
  confluenceSpace: (items: ProcessedConfluenceSpace[]): AvatarList => extractConfluenceUserAvatar(items),
  confluenceContentCreator: (items: ProcessedConfluenceContent[]): AvatarList => extractConfluenceCreatorAvatar(items),
  jiraNotificationUser: <T extends { actionMakerAvatarUrl: string; actionMakerAvatarCacheKey?: string }>(
    items: T[],
  ): AvatarList => extractJiraNotificationUserAvatar(items),
} as const;
