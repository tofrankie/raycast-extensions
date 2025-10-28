import path from "node:path";
import { environment } from "@raycast/api";

import type { AvatarType } from "@/types";

export const DEFAULT_AVATAR = "avatar-default.svg";

export const AVATAR_TYPE = {
  CONFLUENCE_USER: "confluence_user",
  CONFLUENCE_SPACE: "confluence_space",
} as const;

export const AVATAR_DIR = {
  [AVATAR_TYPE.CONFLUENCE_USER]: `${environment.supportPath}/avatar/confluence-user`,
  [AVATAR_TYPE.CONFLUENCE_SPACE]: `${environment.supportPath}/avatar/confluence-space`,
} as const satisfies Record<AvatarType, string>;

export const CACHE_DIRECTORY = {
  AVATAR: path.join(environment.supportPath, "avatar"),
  RESPONSE: path.join(environment.supportPath, "response"),
} as const;

export const CACHE_KEY = {
  CONFLUENCE_CURRENT_USER: "confluence_current_user",
  JIRA_CURRENT_USER: "jira_current_user",
  JIRA_SELECTED_FIELDS: "jira_selected_fields",
  JIRA_SELECTED_BOARD_ID: "jira_selected_board_id",
  JIRA_SELECTED_BOARD_SPRINT_ID: "jira_selected_board_sprint_id",
} as const;
