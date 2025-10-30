import type { ListItemIcon, ListItemSubtitle, ListItemAccessories, ListItemTitle } from "@/types";

export interface ProcessedBase {
  renderKey: string;
  title: ListItemTitle;
}

export interface ProcessedConfluenceContent extends ProcessedBase {
  id: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  canEdit: boolean;
  canFavorite: boolean;
  isFavourited: boolean;
  url: string;
  editUrl: string;
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
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  custom: boolean;
  isAdded: boolean;
  keywords: string[];
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
  editUrl: string;
}

export interface ProcessedJiraBoardIssue extends ProcessedBase {
  key: string;
  summary: string;
  icon: ListItemIcon;
  subtitle: ListItemSubtitle;
  accessories: ListItemAccessories;
  url: string;
  editUrl: string;
  keywords: string[];
}

export interface ProcessedWorklog extends ProcessedBase {
  keywords: string[];
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

export interface WorklogGroup {
  date: string;
  totalTimeSpent: string;
  totalTimeSpentSeconds: number;
  items: ProcessedWorklog[];
  title: string;
  subtitle: string;
}
