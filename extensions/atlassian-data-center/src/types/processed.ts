import type { ListItemTitle, ListItemKeywords, ListItemAccessories, ListItemIcon, ListItemSubtitle } from "@/types";

export interface ProcessedBase {
  renderKey: string;
  title: ListItemTitle;
}

export interface ProcessedConfluenceContent extends ProcessedBase {
  id: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  editUrl: string;
  canEdit: boolean;
  canFavorite: boolean;
  isFavourited: boolean;
  spaceUrl: string;
  spaceName: string;
  creatorAvatarUrl: string;
  creatorAvatarCacheKey?: string;
}

export interface ProcessedConfluenceUser extends ProcessedBase {
  /**
   * Anonymous user may not have userKey, use username as fallback
   */
  userKey: string;
  displayName: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  avatarUrl: string;
  avatarCacheKey?: string;
}

export interface ProcessedConfluenceSpace extends ProcessedBase {
  key: string;
  name: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  avatarUrl: string;
  avatarCacheKey?: string;
}

export interface ProcessedJiraField extends ProcessedBase {
  id: string;
  name: string;
  custom: boolean;
  isAdded: boolean;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  keywords: ListItemKeywords;
  schema?: {
    type: string;
  };
}

export interface ProcessedJiraIssue extends ProcessedBase {
  key: string;
  summary: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  editUrl?: string;
}

export interface ProcessedJiraKanbanBoardIssue extends ProcessedBase {
  key: string;
  summary: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  editUrl?: string;
  keywords: ListItemKeywords;
}

export interface ProcessedWorklog extends ProcessedBase {
  keywords: ListItemKeywords;
  subtitle: string;
  icon: string;
  accessories: ListItemAccessories;
  url: string;
  timeSpent: string;
  timeSpentSeconds: number;
  comment: string;
  date: string;
  issueKey: string;
  worklogId: number;
}

export interface ProcessedJiraNotification extends ProcessedBase {
  notificationId: number;
  issueKey: string;
  content: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  state: 0 | 1;
  actionTime: number;
  actionMakerAvatarUrl: string;
  actionMakerAvatarCacheKey?: string;
  keywords: ListItemKeywords;
}
